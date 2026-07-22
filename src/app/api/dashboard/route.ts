import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = apiHandler(async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Aggregations
  const [
    todayBills,
    weekBills,
    monthBills,
    yearBills,
    todayOrders,
    totalOrdersAllTime,
    todayReservations,
    todayOrdersData,
  ] = await Promise.all([
    prisma.bill.findMany({ where: { createdAt: { gte: today, lte: endOfDay }, status: "PAID" } }),
    prisma.bill.findMany({ where: { createdAt: { gte: startOfWeek }, status: "PAID" } }),
    prisma.bill.findMany({ where: { createdAt: { gte: startOfMonth }, status: "PAID" } }),
    prisma.bill.findMany({ where: { createdAt: { gte: startOfYear }, status: "PAID" } }),
    prisma.order.count({ where: { createdAt: { gte: today, lte: endOfDay } } }),
    prisma.order.count(),
    prisma.reservation.count({ where: { date: { gte: today, lte: endOfDay } } }),
    prisma.order.findMany({ where: { createdAt: { gte: today, lte: endOfDay }, status: { not: "CANCELLED" } } }),
  ]);

  const todayRevenue = todayBills.reduce((sum, b) => sum + b.total, 0);
  const weeklyRevenue = weekBills.reduce((sum, b) => sum + b.total, 0);
  const monthlyRevenue = monthBills.reduce((sum, b) => sum + b.total, 0);
  const yearlyRevenue = yearBills.reduce((sum, b) => sum + b.total, 0);

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

  // Revenue by day (last 7 days)
  const revenueByDay: { date: string; revenue: number }[] = [];
  const dateOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dEnd = new Date(d);
    dEnd.setHours(23, 59, 59, 999);

    const bills = await prisma.bill.findMany({
      where: { createdAt: { gte: d, lte: dEnd }, status: "PAID" },
    });

    revenueByDay.push({
      date: d.toLocaleDateString("en-US", dateOptions),
      revenue: bills.reduce((sum, b) => sum + b.total, 0),
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
