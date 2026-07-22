import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const idOrEmail = params.id;

  if (!idOrEmail) {
    throw new ApiError(400, "BAD_REQUEST", "Customer ID or Email is required");
  }

  // Find user by ID or Email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: idOrEmail },
        { email: idOrEmail },
      ],
    },
  });

  if (!user) {
    throw new ApiError(404, "NOT_FOUND", "Customer not found");
  }

  // Fetch all orders for this customer
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      bill: true,
      table: { select: { number: true, zone: true } },
    },
  });

  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const totalSpending = completedOrders.reduce((sum, o) => sum + (o.bill?.total || 0), 0);
  const visitCount = completedOrders.length;
  const avgOrderValue = visitCount > 0 ? Math.round((totalSpending / visitCount) * 100) / 100 : 0;
  const lastVisit = orders[0]?.createdAt || null;

  // Favorite items computation
  const itemTally: Record<string, { name: string; count: number; totalSpent: number }> = {};
  const paymentHistory: any[] = [];
  const invoices: any[] = [];

  orders.forEach((o) => {
    const items = typeof o.items === "string" ? JSON.parse(o.items) : o.items;
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const name = item.menuItemName || item.menuItemId || "Item";
        const qty = item.qty || 1;
        const price = item.totalPrice || (item.unitPrice * qty) || 0;

        if (!itemTally[name]) {
          itemTally[name] = { name, count: 0, totalSpent: 0 };
        }
        itemTally[name].count += qty;
        itemTally[name].totalSpent += price;
      });
    }

    if (o.bill) {
      invoices.push({
        invoiceNumber: o.bill.billNumber,
        orderId: o.id,
        orderNumber: o.orderNumber,
        date: o.createdAt,
        total: o.bill.total,
        status: o.bill.status,
      });

      if (o.bill.payments) {
        const payments = typeof o.bill.payments === "string" ? JSON.parse(o.bill.payments) : o.bill.payments;
        if (Array.isArray(payments)) {
          payments.forEach((p) => {
            paymentHistory.push({
              date: o.createdAt,
              orderNumber: o.orderNumber,
              invoiceNumber: o.bill?.billNumber,
              method: p.method,
              amount: p.amount,
              reference: p.reference || null,
            });
          });
        }
      }
    }
  });

  const favoriteItems = Object.values(itemTally)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    data: {
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loyaltyPoints: user.loyaltyPoints,
        createdAt: user.createdAt,
      },
      metrics: {
        totalSpending: Math.round(totalSpending * 100) / 100,
        visitCount,
        avgOrderValue,
        lastVisit,
      },
      favoriteItems,
      paymentHistory,
      invoices,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        invoiceNumber: o.bill?.billNumber || null,
        type: o.type,
        status: o.status,
        total: o.bill?.total || 0,
        itemCount: Array.isArray(typeof o.items === "string" ? JSON.parse(o.items) : o.items)
          ? (typeof o.items === "string" ? JSON.parse(o.items) : o.items).length
          : 0,
        createdAt: o.createdAt,
      })),
    },
  };
});
