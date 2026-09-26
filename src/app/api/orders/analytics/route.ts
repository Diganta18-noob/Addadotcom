import prisma from "@/lib/prisma";
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

  const dateWhere = useDateFilter
    ? { createdAt: { gte: startDate, lte: endDate } }
    : {};

  // Fetch orders, bills, and menu items with categories in parallel using Prisma
  const [orders, bills, allMenuItems] = await Promise.all([
    prisma.order.findMany({
      where: dateWhere,
      select: {
        id: true,
        type: true,
        status: true,
        items: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bill.findMany({
      where: dateWhere,
      select: {
        id: true,
        total: true,
        status: true,
        payments: true,
        createdAt: true,
      },
    }),
    prisma.menuItem.findMany({
      select: {
        id: true,
        name: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  // Build category mapping dictionary
  const itemToCategoryMap: Record<string, string> = {};
  allMenuItems.forEach((mi) => {
    if (mi.name && mi.category?.name) {
      itemToCategoryMap[mi.name.toLowerCase().trim()] = mi.category.name;
    }
    if (mi.id && mi.category?.name) {
      itemToCategoryMap[mi.id] = mi.category.name;
    }
  });

  // Calculate summary metrics
  const paidBills = bills.filter((b) => b.status === "PAID");
  const totalRevenue = paidBills.reduce((acc, b) => acc + (b.total || 0), 0);
  const totalOrderCount = orders.length;
  const completedOrdersCount =
    orders.filter(
      (o) =>
        o.status === "SERVED" ||
        (o.status as string) === "COMPLETED" ||
        (o.status as string) === "DELIVERED"
    ).length || paidBills.length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;
  const refundedCount = bills.filter((b) => b.status === "REFUNDED").length;

  const avgOrderValue =
    completedOrdersCount > 0
      ? Math.round((totalRevenue / completedOrdersCount) * 100) / 100
      : paidBills.length > 0
      ? Math.round((totalRevenue / paidBills.length) * 100) / 100
      : 0;

  const refundRate =
    totalOrderCount > 0
      ? Math.round((refundedCount / totalOrderCount) * 100 * 100) / 100
      : 0;

  const cancellationRate =
    totalOrderCount > 0
      ? Math.round((cancelledCount / totalOrderCount) * 100 * 100) / 100
      : 0;

  // Peak Operating Hours Heatmap (24 hours)
  const peakHoursMap = new Array(24).fill(0);
  orders.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    if (hour >= 0 && hour < 24) {
      peakHoursMap[hour] += 1;
    }
  });
  const peakHours = peakHoursMap.map((count, hour) => ({
    hour: `${String(hour).padStart(2, "0")}:00`,
    hourNumber: hour,
    count,
  }));

  // Busiest Days of Week (0 = Sun, 6 = Sat)
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const busiestDaysMap = new Array(7).fill(0);
  orders.forEach((o) => {
    const dow = new Date(o.createdAt).getDay();
    if (dow >= 0 && dow < 7) {
      busiestDaysMap[dow] += 1;
    }
  });
  const busiestDays = busiestDaysMap.map((count, dow) => ({
    day: dayNames[dow],
    dayCode: dayNames[dow].slice(0, 3),
    dow,
    count,
  }));

  // Aggregation for Category & Item Leaderboards
  const categoryRevenue: Record<string, number> = {};
  const productSalesMap: Record<
    string,
    { name: string; qty: number; revenue: number }
  > = {};

  orders.forEach((order) => {
    if (order.status === "CANCELLED") return;

    let items: any[] = [];
    if (typeof order.items === "string") {
      try {
        items = JSON.parse(order.items);
      } catch {
        items = [];
      }
    } else if (Array.isArray(order.items)) {
      items = order.items;
    }

    if (Array.isArray(items)) {
      items.forEach((item) => {
        const name =
          item.menuItemName || item.name || item.menuItemId || "Café Item";
        const qty = Number(item.qty) || 1;
        const rev =
          Number(item.totalPrice) || Number(item.unitPrice || 0) * qty;
        const category =
          itemToCategoryMap[name.toLowerCase().trim()] ||
          itemToCategoryMap[item.menuItemId] ||
          item.category ||
          "Coffee & Beverages";

        categoryRevenue[category] = (categoryRevenue[category] || 0) + rev;

        if (!productSalesMap[name]) {
          productSalesMap[name] = { name, qty: 0, revenue: 0 };
        }
        productSalesMap[name].qty += qty;
        productSalesMap[name].revenue += rev;
      });
    }
  });

  const catColors = [
    "#4B2E2B",
    "#D4A056",
    "#8BA888",
    "#E8C890",
    "#6B4A47",
    "#A47E6C",
  ];
  const salesByCategory = Object.entries(categoryRevenue).map(
    ([name, value], idx) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: catColors[idx % catColors.length],
    })
  );

  if (salesByCategory.length === 0) {
    salesByCategory.push({
      name: "Coffee & Beverages",
      value: 0,
      color: catColors[0],
    });
  }

  const allProductsSorted = Object.values(productSalesMap).sort(
    (a, b) => b.qty - a.qty
  );
  const mostSellingItems = allProductsSorted.slice(0, 5);
  const leastSellingItems =
    allProductsSorted.length > 5
      ? allProductsSorted.slice(-5).reverse()
      : [...allProductsSorted].reverse();

  // Payment Methods Breakdown
  const paymentTotals: Record<string, number> = {
    CASH: 0,
    CARD: 0,
    UPI: 0,
  };

  paidBills.forEach((b) => {
    let payments: any[] = [];
    if (typeof b.payments === "string") {
      try {
        payments = JSON.parse(b.payments);
      } catch {
        payments = [];
      }
    } else if (Array.isArray(b.payments)) {
      payments = b.payments;
    }

    if (Array.isArray(payments) && payments.length > 0) {
      payments.forEach((pay) => {
        const method = String(pay.method || "UPI").toUpperCase();
        const amt = Number(pay.amount || 0);
        if (method in paymentTotals) {
          paymentTotals[method] += amt;
        } else {
          paymentTotals.UPI += amt;
        }
      });
    } else if (b.total > 0) {
      paymentTotals.UPI += b.total;
    }
  });

  const salesByPayment = [
    {
      name: "UPI / Wallet",
      value: Math.round(paymentTotals.UPI * 100) / 100,
      color: "#10B981",
    },
    {
      name: "Card Payments",
      value: Math.round(paymentTotals.CARD * 100) / 100,
      color: "#4F46E5",
    },
    {
      name: "Cash Transactions",
      value: Math.round(paymentTotals.CASH * 100) / 100,
      color: "#F59E0B",
    },
  ];

  // Order types grouping
  const orderTypeMap: Record<string, number> = {};
  orders.forEach((o) => {
    orderTypeMap[o.type] = (orderTypeMap[o.type] || 0) + 1;
  });
  const orderTypes = Object.entries(orderTypeMap).map(([type, count]) => ({
    type,
    count,
  }));

  // Peak hour & busiest day safely resolved
  const peakHoursWithOrders = peakHours.filter((p) => p.count > 0);
  const busiestHourObj =
    peakHoursWithOrders.length > 0
      ? [...peakHoursWithOrders].sort((a, b) => b.count - a.count)[0]
      : peakHours[14] || peakHours[0];

  const busiestDaysWithOrders = busiestDays.filter((d) => d.count > 0);
  const busiestDayObj =
    busiestDaysWithOrders.length > 0
      ? [...busiestDaysWithOrders].sort((a, b) => b.count - a.count)[0]
      : busiestDays[5] || busiestDays[0];

  const topCategoryObj = [...salesByCategory].sort(
    (a, b) => b.value - a.value
  )[0];

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
        peakHour: busiestHourObj ? busiestHourObj.hour : "14:00",
        busiestDay: busiestDayObj ? busiestDayObj.day : "Saturday",
        mostPopularCategory: topCategoryObj?.name || "Coffee & Beverages",
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
