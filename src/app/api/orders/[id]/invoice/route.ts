import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;

  if (!id) {
    throw new ApiError(400, "BAD_REQUEST", "Order ID is required");
  }

  // Find order by ID or orderNumber
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id },
        { orderNumber: id },
      ],
    },
    include: {
      user: true,
      table: true,
      bill: true,
    },
  });

  if (!order) {
    throw new ApiError(404, "NOT_FOUND", "Order not found");
  }

  // Lookup staff / cashier name if cashierId exists on bill
  let staffName = "Staff Member";
  if (order.bill?.cashierId) {
    const staffUser = await prisma.user.findUnique({
      where: { id: order.bill.cashierId },
      select: { name: true },
    });
    if (staffUser) staffName = staffUser.name;
  }

  // Fetch cafe settings
  const settings = await prisma.setting.findMany({
    where: { group: { in: ["general", "tax"] } },
  });

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  const cafeDetails = {
    name: settingsMap["cafe_name"] || "AddaDotCom Cafe & Restaurant",
    address: settingsMap["cafe_address"] || "124 Artisan Blvd, Connaught Place, New Delhi",
    phone: settingsMap["cafe_phone"] || "+91 98765 43210",
    email: settingsMap["cafe_email"] || "support@addadotcom.cafe",
    gstin: settingsMap["cafe_gstin"] || "07AAAAA0000A1Z5",
  };

  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  const payments = typeof order.bill?.payments === "string"
    ? JSON.parse(order.bill.payments)
    : order.bill?.payments || [];
  const taxes = typeof order.bill?.taxes === "string"
    ? JSON.parse(order.bill.taxes)
    : order.bill?.taxes || [];

  const subtotal = Array.isArray(items)
    ? items.reduce((sum, i) => sum + (i.totalPrice || (i.unitPrice * (i.qty || 1)) || 0), 0)
    : 0;

  return {
    data: {
      invoiceNumber: order.bill?.billNumber || `INV-${order.orderNumber.slice(-8)}`,
      orderNumber: order.orderNumber,
      orderId: order.id,
      transactionId: Array.isArray(payments) && payments[0]?.reference ? payments[0].reference : `TXN-${order.id.slice(-6)}`,
      createdAt: order.createdAt,
      type: order.type,
      status: order.status,
      paymentStatus: order.bill?.status || "UNPAID",
      paymentMethod: Array.isArray(payments) && payments[0]?.method ? payments[0].method : "CASH",
      staffName,
      tableNumber: order.table?.number || null,
      tableZone: order.table?.zone || null,
      deliveryAddress: order.deliveryAddress,
      customerDetails: {
        name: order.user?.name || "Guest Customer",
        email: order.user?.email || "guest@addadotcom.cafe",
        phone: order.user?.phone || "N/A",
      },
      cafeDetails,
      items: Array.isArray(items) ? items : [],
      financials: {
        subtotal: order.bill?.subtotal || subtotal,
        serviceCharge: order.bill?.serviceCharge || (order.type === "DINE_IN" ? Math.round(subtotal * 0.05 * 100) / 100 : 0),
        deliveryFee: order.deliveryFee || 0,
        taxes: Array.isArray(taxes) ? taxes : [
          { name: "CGST", rate: 2.5, amount: Math.round(subtotal * 0.025 * 100) / 100 },
          { name: "SGST", rate: 2.5, amount: Math.round(subtotal * 0.025 * 100) / 100 },
        ],
        total: order.bill?.total || Math.round((subtotal * 1.05) * 100) / 100,
      },
    },
  };
});
