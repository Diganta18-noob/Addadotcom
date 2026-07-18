import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "week"; // today, week, month, custom
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");

  let start = new Date();
  let end = new Date();

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (range === "week") {
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else if (range === "month") {
    start.setMonth(start.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
  } else if (range === "custom" && startStr && endStr) {
    start = new Date(startStr);
    start.setHours(0, 0, 0, 0);
    end = new Date(endStr);
    end.setHours(23, 59, 59, 999);
  }

  const bills = await prisma.bill.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: "PAID",
    },
    include: { order: true },
  });

  const totalSales = bills.reduce((sum, b) => sum + b.total, 0);
  const totalOrders = bills.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const totalGst = bills.reduce((sum, b) => {
    const taxes = b.taxes as any[];
    if (Array.isArray(taxes)) {
      return sum + taxes.reduce((s, t) => s + (t.amount || 0), 0);
    }
    return sum;
  }, 0);

  // Group sales by day
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyMap: Record<string, { day: string; dateStr: string; sales: number; orders: number }> = {};
  
  // Initialize days of the week to ensure the chart is formatted correctly
  if (range === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      const dateStr = d.toISOString().split("T")[0];
      dailyMap[dateStr] = { day: dayName, dateStr, sales: 0, orders: 0 };
    }
  }

  bills.forEach((b) => {
    const dateStr = b.createdAt.toISOString().split("T")[0];
    const dayName = daysOfWeek[b.createdAt.getDay()];
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = { day: dayName, dateStr, sales: 0, orders: 0 };
    }
    dailyMap[dateStr].sales += b.total;
    dailyMap[dateStr].orders += 1;
  });

  const dailyTrends = Object.values(dailyMap)
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
    .map((d) => ({
      day: d.day,
      sales: d.sales,
      orders: d.orders,
    }));

  // Map items to categories for accurate category sales chart
  const allMenuItems = await prisma.menuItem.findMany({
    include: { category: true },
  });
  const itemToCategoryMap: Record<string, string> = {};
  allMenuItems.forEach((item) => {
    itemToCategoryMap[item.name] = item.category.name;
    itemToCategoryMap[item.id] = item.category.name;
  });

  // Compute sales by Category & product sales
  const categoryRevenue: Record<string, number> = {};
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  
  bills.forEach((b) => {
    if (!b.order) return;
    const items = (typeof b.order.items === "string" ? JSON.parse(b.order.items) : b.order.items) as any[];
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const catName = itemToCategoryMap[item.menuItemName] || itemToCategoryMap[item.menuItemId] || "Coffee & Beverages";
        const qty = item.qty || 1;
        const rev = item.totalPrice || item.unitPrice * qty || 0;

        // Category
        categoryRevenue[catName] = (categoryRevenue[catName] || 0) + rev;

        // Product Sales
        const prodKey = item.menuItemName || item.menuItemId;
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
    value,
    color: catColors[idx % catColors.length],
  }));

  // Default category fallback
  if (salesByCategory.length === 0) {
    salesByCategory.push({ name: "Coffee & Beverages", value: 0, color: "#4B2E2B" });
  }

  const salesByItem = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Compute sales by Payment Method
  const paymentRevenue: Record<string, number> = {};
  bills.forEach((b) => {
    const payments = (typeof b.payments === "string" ? JSON.parse(b.payments) : b.payments) as any[];
    if (Array.isArray(payments)) {
      payments.forEach((pay) => {
        const methodLabel = pay.method === "CASH" ? "Cash Transactions" : pay.method === "CARD" ? "Card Payments" : "UPI / Wallet";
        paymentRevenue[methodLabel] = (paymentRevenue[methodLabel] || 0) + (pay.amount || 0);
      });
    }
  });

  const payColors: Record<string, string> = {
    "Card Payments": "#4F46E5",
    "UPI / Wallet": "#10B981",
    "Cash Transactions": "#F59E0B",
  };

  const salesByPayment = Object.entries(paymentRevenue).map(([name, value]) => ({
    name,
    value,
    color: payColors[name] || "#4F46E5",
  }));

  // Default payment fallback
  if (salesByPayment.length === 0) {
    salesByPayment.push({ name: "Cash Transactions", value: 0, color: "#F59E0B" });
  }

  return {
    data: {
      totalSales,
      totalOrders,
      avgOrderValue,
      totalGst,
      dailyTrends,
      salesByCategory,
      salesByItem,
      salesByPayment,
    },
  };
});
