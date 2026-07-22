import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "month";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let startDate = new Date();
  let endDate = new Date();
  let useDateFilter = true;

  if (range === "today") {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (range === "week") {
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "month") {
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  } else if (range === "year") {
    startDate = new Date(startDate.getFullYear(), 0, 1);
  } else if (range === "all") {
    useDateFilter = false;
  } else if (range === "custom" && from && to) {
    startDate = new Date(from);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);
  }

  const dateWhere = useDateFilter ? { createdAt: { gte: startDate, lte: endDate } } : {};

  // 1. Prisma Aggregation for Revenue & Counts
  const [billAggregate, totalOrderCount, cancelledCount, refundedCount, orders] = await Promise.all([
    prisma.bill.aggregate({
      where: {
        ...dateWhere,
        status: "PAID",
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count({ where: dateWhere }),
    prisma.order.count({ where: { ...dateWhere, status: "CANCELLED" } }),
    prisma.bill.count({ where: { ...dateWhere, status: "REFUNDED" } }),
    prisma.order.findMany({
      where: dateWhere,
      select: {
        id: true,
        type: true,
        status: true,
        items: true,
        createdAt: true,
        bill: { select: { total: true, status: true, payments: true } },
      },
    }),
  ]);

  const totalRevenue = billAggregate._sum.total || 0;
  const completedOrdersCount = billAggregate._count || 0;
  const avgOrderValue = completedOrdersCount > 0 ? Math.round((totalRevenue / completedOrdersCount) * 100) / 100 : 0;
  const refundRate = totalOrderCount > 0 ? Math.round((refundedCount / totalOrderCount) * 100 * 100) / 100 : 0;
  const cancellationRate = totalOrderCount > 0 ? Math.round((cancelledCount / totalOrderCount) * 100 * 100) / 100 : 0;

  // 2. Raw SQL for Peak Hours Heatmap (24 hours)
  const peakHoursRaw: { hour: number; count: bigint }[] = await prisma.$queryRaw`
    SELECT EXTRACT(HOUR FROM "createdAt")::int as hour, COUNT(*)::bigint as count
    FROM orders
    ${useDateFilter ? Prisma.sql`WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}` : Prisma.empty}
    GROUP BY hour
    ORDER BY hour ASC
  `;

  const peakHoursMap = new Array(24).fill(0);
  peakHoursRaw.forEach((row) => {
    if (row.hour >= 0 && row.hour < 24) {
      peakHoursMap[row.hour] = Number(row.count);
    }
  });
  const peakHours = peakHoursMap.map((count, hour) => ({
    hour: `${String(hour).padStart(2, "0")}:00`,
    hourNumber: hour,
    count,
  }));

  // 3. Raw SQL for Busiest Days of Week (0 = Sun, 6 = Sat)
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const busiestDaysRaw: { dow: number; count: bigint }[] = await prisma.$queryRaw`
    SELECT EXTRACT(DOW FROM "createdAt")::int as dow, COUNT(*)::bigint as count
    FROM orders
    ${useDateFilter ? Prisma.sql`WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}` : Prisma.empty}
    GROUP BY dow
    ORDER BY dow ASC
  `;

  const busiestDaysMap = new Array(7).fill(0);
  busiestDaysRaw.forEach((row) => {
    if (row.dow >= 0 && row.dow < 7) {
      busiestDaysMap[row.dow] = Number(row.count);
    }
  });
  const busiestDays = busiestDaysMap.map((count, dow) => ({
    day: dayNames[dow],
    dayCode: dayNames[dow].slice(0, 3),
    dow,
    count,
  }));

  // 4. Item Leaderboards & Category Sales Breakdown
  const allMenuItems = await prisma.menuItem.findMany({ include: { category: true } });
  const itemToCategoryMap: Record<string, string> = {};
  allMenuItems.forEach((item) => {
    itemToCategoryMap[item.name] = item.category.name;
    itemToCategoryMap[item.id] = item.category.name;
  });

  const categoryRevenue: Record<string, number> = {};
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  const orderTypeCounts: Record<string, number> = { DINE_IN: 0, TAKEAWAY: 0, DELIVERY: 0 };

  orders.forEach((order) => {
    if (order.type) {
      orderTypeCounts[order.type] = (orderTypeCounts[order.type] || 0) + 1;
    }

    const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const catName = itemToCategoryMap[item.menuItemName] || itemToCategoryMap[item.menuItemId] || "Coffee & Beverages";
        const qty = item.qty || 1;
        const rev = item.totalPrice || (item.unitPrice * qty) || 0;

        categoryRevenue[catName] = (categoryRevenue[catName] || 0) + rev;

        const prodKey = item.menuItemName || item.menuItemId || "Item";
        if (!productSalesMap[prodKey]) {
          productSalesMap[prodKey] = { name: prodKey, qty: 0, revenue: 0 };
        }
        productSalesMap[prodKey].qty += qty;
        productSalesMap[prodKey].revenue += rev;
      });
    }
  });

  const catColors = ["#4B2E2B", "#D4A056", "#8BA888", "#E8C890", "#6B4A47", "#A47E6C"];
  const salesByCategory = Object.entries(categoryRevenue).map(([name, value], idx) => ({
    name,
    value: Math.round(value * 100) / 100,
    color: catColors[idx % catColors.length],
  }));

  const allProductsSorted = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);
  const mostSellingItems = allProductsSorted.slice(0, 5);
  const leastSellingItems = allProductsSorted.slice(-5).reverse();

  // 5. Payment Methods Breakdown
  const paymentRevenue: Record<string, number> = {};
  orders.forEach((o) => {
    if (o.bill?.payments) {
      const payments = typeof o.bill.payments === "string" ? JSON.parse(o.bill.payments) : o.bill.payments;
      if (Array.isArray(payments)) {
        payments.forEach((pay) => {
          const methodLabel = pay.method === "CASH" ? "Cash Transactions" : pay.method === "CARD" ? "Card Payments" : "UPI / Wallet";
          paymentRevenue[methodLabel] = (paymentRevenue[methodLabel] || 0) + (pay.amount || 0);
        });
      }
    }
  });

  const payColors: Record<string, string> = {
    "Card Payments": "#4F46E5",
    "UPI / Wallet": "#10B981",
    "Cash Transactions": "#F59E0B",
  };

  const salesByPayment = Object.entries(paymentRevenue).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
    color: payColors[name] || "#4F46E5",
  }));

  // Find Peak Hour & Busiest Day
  const busiestHourObj = [...peakHours].sort((a, b) => b.count - a.count)[0];
  const busiestDayObj = [...busiestDays].sort((a, b) => b.count - a.count)[0];

  return {
    data: {
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders: totalOrderCount,
        completedOrders: completedOrdersCount,
        cancelledOrders: cancelledCount,
        refundedOrders: refundedCount,
        avgOrderValue,
        refundRate,
        cancellationRate,
        peakHour: busiestHourObj ? busiestHourObj.hour : "N/A",
        busiestDay: busiestDayObj ? busiestDayObj.day : "N/A",
        mostPopularCategory: salesByCategory[0]?.name || "N/A",
      },
      peakHours,
      busiestDays,
      salesByCategory,
      mostSellingItems,
      leastSellingItems,
      salesByPayment,
      orderTypes: Object.entries(orderTypeCounts).map(([type, count]) => ({ type, count })),
    },
  };
});
