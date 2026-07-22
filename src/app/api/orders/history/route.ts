import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  const paymentStatus = searchParams.get("paymentStatus");
  const type = searchParams.get("type");
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status && status !== "ALL") {
    where.status = status;
  }
  if (type && type !== "ALL") {
    where.type = type;
  }

  // Date filtering (defaults to last 30 days if no range provided)
  const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = to ? new Date(to) : new Date();
  if (from || to) {
    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  if (paymentStatus && paymentStatus !== "ALL") {
    where.bill = {
      status: paymentStatus,
    };
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
      { deliveryAddress: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { phone: { contains: search, mode: "insensitive" } } },
      { bill: { billNumber: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        table: { select: { id: true, number: true, zone: true } },
        bill: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  const formattedOrders = orders.map((order) => {
    const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
    const subtotal = Array.isArray(items)
      ? items.reduce((sum, i) => sum + (i.totalPrice || (i.unitPrice * (i.qty || 1)) || 0), 0)
      : 0;

    const payments = (typeof order.bill?.payments === "string"
      ? JSON.parse(order.bill.payments)
      : order.bill?.payments) as any[];

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      invoiceNumber: order.bill?.billNumber || `INV-${order.orderNumber.slice(-8)}`,
      staffId: order.bill?.cashierId || null,
      transactionId: Array.isArray(payments) && payments[0]?.reference ? payments[0].reference : order.bill?.id || null,
      status: order.status,
      type: order.type,
      items,
      subtotal,
      deliveryFee: order.deliveryFee,
      total: order.bill?.total || Math.round((subtotal * 1.05) * 100) / 100,
      customer: order.user ? { id: order.user.id, name: order.user.name, email: order.user.email, phone: order.user.phone } : null,
      tableNumber: order.table?.number || null,
      tableZone: order.table?.zone || null,
      paymentStatus: order.bill?.status || "UNPAID",
      paymentMethod: Array.isArray(payments) && payments[0]?.method ? payments[0].method : "CASH",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  });

  return {
    data: {
      orders: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    },
  };
});
