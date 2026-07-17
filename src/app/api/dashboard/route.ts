import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";

export const GET = apiHandler(async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Today's stats
  const todayBills = await prisma.bill.findMany({
    where: {
      createdAt: { gte: today, lte: endOfDay },
      status: "PAID",
    },
  });

  const todayRevenue = todayBills.reduce((sum, b) => sum + b.total, 0);

  const todayOrders = await prisma.order.count({
    where: {
      createdAt: { gte: today, lte: endOfDay },
    },
  });

  const todayReservations = await prisma.reservation.count({
    where: {
      date: { gte: today, lte: endOfDay },
    },
  });

  const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

  // Top selling items (from today's orders)
  const todayOrdersData = await prisma.order.findMany({
    where: {
      createdAt: { gte: today, lte: endOfDay },
      status: { not: "CANCELLED" },
    },
  });

  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  todayOrdersData.forEach((order) => {
    const items = order.items as any[];
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
      where: {
        createdAt: { gte: d, lte: dEnd },
        status: "PAID",
      },
    });

    revenueByDay.push({
      date: d.toLocaleDateString("en-US", dateOptions),
      revenue: bills.reduce((sum, b) => sum + b.total, 0),
    });
  }

  // Map items to categories for accurate category sales chart
  const allMenuItems = await prisma.menuItem.findMany({
    include: { category: true },
  });
  const itemToCategoryMap: Record<string, string> = {};
  allMenuItems.forEach((item) => {
    itemToCategoryMap[item.name] = item.category.name;
    itemToCategoryMap[item.id] = item.category.name;
  });

  const categoryRevenue: Record<string, number> = {};
  todayOrdersData.forEach((order) => {
    const items = order.items as any[];
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

  // If no sales yet today, add empty category stats to avoid rendering crash
  if (salesByCategory.length === 0) {
    salesByCategory.push({ category: "Coffee & Beverages", revenue: 0, color: "#D4A056" });
  }

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { table: true },
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
      todayRevenue,
      todayOrders,
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
