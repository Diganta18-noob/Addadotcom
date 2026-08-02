import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { protectedApiHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = protectedApiHandler(async (request) => {
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
  const [billAggregate, totalOrderCount, cancelledCount, refundedCount, orderTypesGroup] = await Promise.all([
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
    prisma.order.groupBy({
      by: ["type"],
      where: dateWhere,
      _count: true,
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

  // 4. SQL Aggregation for Category & Item Leaderboards
  const itemStatsRaw: { name: string; qty: number; revenue: number; category: string }[] = await prisma.$queryRaw`
    SELECT
      COALESCE(item->>'menuItemName', item->>'menuItemId', 'Item') as name,
      SUM(COALESCE((item->>'qty')::int, 1))::int as qty,
      SUM(COALESCE((item->>'totalPrice')::float, (item->>'unitPrice')::float * COALESCE((item->>'qty')::int, 1), 0))::float as revenue,
      COALESCE(c.name, 'Coffee & Beverages') as category
    FROM orders o,
      jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(o.items::jsonb) = 'array' THEN o.items::jsonb
          ELSE '[]'::jsonb
        END
      ) as item
    LEFT JOIN menu_items mi ON (mi.name = item->>'menuItemName' OR mi.id = item->>'menuItemId')
    LEFT JOIN categories c ON c.id = mi."categoryId"
    ${useDateFilter ? Prisma.sql`WHERE o."createdAt" >= ${startDate} AND o."createdAt" <= ${endDate}` : Prisma.empty}
    GROUP BY name, category
    ORDER BY qty DESC
  `;

  const categoryRevenue: Record<string, number> = {};
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};

  itemStatsRaw.forEach((row) => {
    categoryRevenue[row.category] = (categoryRevenue[row.category] || 0) + Number(row.revenue);
    if (!productSalesMap[row.name]) {
      productSalesMap[row.name] = { name: row.name, qty: 0, revenue: 0 };
    }
    productSalesMap[row.name].qty += Number(row.qty);
    productSalesMap[row.name].revenue += Number(row.revenue);
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
  const paymentStatsRaw: { method: string; amount: number }[] = await prisma.$queryRaw`
    SELECT
      pay->>'method' as method,
      SUM((pay->>'amount')::float)::float as amount
    FROM bills b,
      jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(b.payments::jsonb) = 'array' THEN b.payments::jsonb
          ELSE '[]'::jsonb
        END
      ) as pay
    ${useDateFilter ? Prisma.sql`WHERE b."createdAt" >= ${startDate} AND b."createdAt" <= ${endDate}` : Prisma.empty}
    GROUP BY method
  `;

  const payColors: Record<string, string> = {
    "Card Payments": "#4F46E5",
    "UPI / Wallet": "#10B981",
    "Cash Transactions": "#F59E0B",
  };

  const salesByPayment = paymentStatsRaw.map((row) => {
    const name = row.method === "CASH" ? "Cash Transactions" : row.method === "CARD" ? "Card Payments" : "UPI / Wallet";
    return {
      name,
      value: Math.round(Number(row.amount) * 100) / 100,
      color: payColors[name] || "#4F46E5",
    };
  });

  const orderTypes = orderTypesGroup.map((g) => ({ type: g.type, count: g._count }));

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
      orderTypes,
    },
  };
});
