import prisma from "@/lib/prisma";
import { protectedApiHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = protectedApiHandler(async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Parallel aggregated database queries
  const [
    todayAggregate,
    weekAggregate,
    monthAggregate,
    yearAggregate,
    todayOrders,
    totalOrdersAllTime,
    todayReservations,
    todayOrdersData,
    revenueByDayRaw,
  ] = await Promise.all([
    prisma.bill.aggregate({ where: { createdAt: { gte: today, lte: endOfDay }, status: "PAID" }, _sum: { total: true } }),
    prisma.bill.aggregate({ where: { createdAt: { gte: startOfWeek }, status: "PAID" }, _sum: { total: true } }),
    prisma.bill.aggregate({ where: { createdAt: { gte: startOfMonth }, status: "PAID" }, _sum: { total: true } }),
    prisma.bill.aggregate({ where: { createdAt: { gte: startOfYear }, status: "PAID" }, _sum: { total: true } }),
    prisma.order.count({ where: { createdAt: { gte: today, lte: endOfDay } } }),
    prisma.order.count(),
    prisma.reservation.count({ where: { date: { gte: today, lte: endOfDay } } }),
    prisma.order.findMany({
      where: { createdAt: { gte: today, lte: endOfDay }, status: { not: "CANCELLED" } },
      select: { items: true },
    }),
    prisma.$queryRaw<{ date: Date; revenue: number }[]>`
      SELECT
        DATE_TRUNC('day', "createdAt") as date,
        SUM(total)::float as revenue
      FROM bills
      WHERE "createdAt" >= ${startOfWeek}
        AND status = 'PAID'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `,
  ]);

  const todayRevenue = todayAggregate._sum.total || 0;
  const weeklyRevenue = weekAggregate._sum.total || 0;
  const monthlyRevenue = monthAggregate._sum.total || 0;
  const yearlyRevenue = yearAggregate._sum.total || 0;

  const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

  // Top selling items
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  todayOrdersData.forEach((order) => {
    const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const key = item.menuItemName || item.menuItemId;
        if (!itemCounts[key]) {
          itemCounts[key] = { name: key, count: 0, revenue: 0 };
        }
        itemCounts[key].count += item.qty || 1;
        itemCounts[key].revenue += item.totalPrice || 0;
      });
    }
  });

  const topSellingItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Format revenueByDay (last 7 days guaranteed filled)
  const dateOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const revenueMap = new Map<string, number>();
  revenueByDayRaw.forEach((row) => {
    const dateKey = new Date(row.date).toLocaleDateString("en-US", dateOptions);
    revenueMap.set(dateKey, Number(row.revenue || 0));
  });

  const revenueByDay: { date: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", dateOptions);
    revenueByDay.push({
      date: label,
      revenue: revenueMap.get(label) || 0,
    });
  }

  // Categories map
  const allMenuItems = await prisma.menuItem.findMany({ include: { category: true } });
  const itemToCategoryMap: Record<string, string> = {};
  allMenuItems.forEach((item) => {
    itemToCategoryMap[item.name] = item.category.name;
    itemToCategoryMap[item.id] = item.category.name;
  });

  const categoryRevenue: Record<string, number> = {};
  todayOrdersData.forEach((order) => {
    const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const categoryName =
          itemToCategoryMap[item.menuItemName] ||
          itemToCategoryMap[item.menuItemId] ||
          "Coffee & Beverages";
        categoryRevenue[categoryName] =
          (categoryRevenue[categoryName] || 0) + (item.totalPrice || 0);
      });
    }
  });

  const colors = ["#D4A056", "#4B2E2B", "#8BA888", "#E8C890", "#6B4A47", "#A47E6C"];
  const salesByCategory = Object.entries(categoryRevenue).map(([category, revenue], idx) => ({
    category,
    revenue,
    color: colors[idx % colors.length],
  }));

  if (salesByCategory.length === 0) {
    salesByCategory.push({ category: "Coffee & Beverages", revenue: 0, color: "#D4A056" });
  }

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { table: true, bill: true },
  });

  const mappedRecentOrders = recentOrders.map((order) => ({
    ...order,
    items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
  }));

  // Upcoming reservations
  const upcomingReservations = await prisma.reservation.findMany({
    where: {
      date: { gte: today },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
    take: 10,
    include: { table: true },
  });

  return {
    data: {
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      weeklyRevenue: Math.round(weeklyRevenue * 100) / 100,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      yearlyRevenue: Math.round(yearlyRevenue * 100) / 100,
      todayOrders,
      totalOrdersAllTime,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      todayReservations,
      topSellingItems,
      revenueByDay,
      salesByCategory,
      recentOrders: mappedRecentOrders,
      upcomingReservations,
    },
  };
});
