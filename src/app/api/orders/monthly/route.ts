import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const currentYear = new Date().getFullYear();
  const year = parseInt(searchParams.get("year") || String(currentYear), 10);

  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  // Fetch all orders & bills for the target year
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    include: {
      bill: true,
      user: { select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Initialize 12 month slots
  const monthsData = monthNames.map((month, index) => ({
    monthIndex: index + 1,
    month,
    monthShort: month.slice(0, 3),
    orders: 0,
    revenue: 0,
    customers: 0,
    avgBill: 0,
    topItem: "N/A",
    topCategory: "Coffee & Beverages",
  }));

  // Track customer sets and item/category counts per month
  const customerSets: Set<string>[] = Array.from({ length: 12 }, () => new Set());
  const itemCountsPerMonth: Record<string, number>[] = Array.from({ length: 12 }, () => ({}));

  orders.forEach((order) => {
    const monthIdx = new Date(order.createdAt).getMonth();
    monthsData[monthIdx].orders += 1;

    if (order.user?.id) {
      customerSets[monthIdx].add(order.user.id);
    }

    const billTotal = order.bill?.status === "PAID" ? order.bill.total : 0;
    monthsData[monthIdx].revenue += billTotal;

    const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const name = item.menuItemName || item.menuItemId || "Item";
        const qty = item.qty || 1;
        itemCountsPerMonth[monthIdx][name] = (itemCountsPerMonth[monthIdx][name] || 0) + qty;
      });
    }
  });

  // Finalize monthly aggregations
  monthsData.forEach((m, idx) => {
    m.customers = customerSets[idx].size;
    m.revenue = Math.round(m.revenue * 100) / 100;
    m.avgBill = m.orders > 0 ? Math.round((m.revenue / m.orders) * 100) / 100 : 0;

    const sortedItems = Object.entries(itemCountsPerMonth[idx]).sort((a, b) => b[1] - a[1]);
    if (sortedItems.length > 0) {
      m.topItem = sortedItems[0][0];
    }
  });

  return {
    data: {
      year,
      months: monthsData,
    },
  };
});
