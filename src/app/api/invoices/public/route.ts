import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get("number") || searchParams.get("id");

  if (!number) {
    throw new ApiError(400, "BAD_REQUEST", "Invoice or bill number is required");
  }

  // 1. Search by bill number first
  let bill: any = await prisma.bill.findFirst({
    where: { billNumber: number },
    include: {
      order: {
        include: {
          user: true,
          table: true,
          bill: true,
        },
      },
    },
  });

  let order: any = bill?.order;

  // 2. If not found by billNumber, search by orderNumber or order ID
  if (!order) {
    order = await prisma.order.findFirst({
      where: {
        OR: [{ id: number }, { orderNumber: number }],
      },
      include: {
        user: true,
        table: true,
        bill: true,
      },
    });

    if (order?.bill) {
      bill = order.bill;
    }
  }

  if (!order) {
    throw new ApiError(404, "NOT_FOUND", "Invoice record not found");
  }

  // Security check: Only return paid invoices publicly
  const isPaid = bill?.status === "PAID" || order.status === "COMPLETED";
  if (!isPaid) {
    throw new ApiError(403, "FORBIDDEN", "Public digital receipt is available for paid bills only");
  }

  // Fetch cashier name if cashierId exists
  let staffName = "Staff Member";
  if (bill?.cashierId) {
    const staffUser = await prisma.user.findUnique({
      where: { id: bill.cashierId },
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
  const payments = typeof bill?.payments === "string"
    ? JSON.parse(bill.payments)
    : bill?.payments || [];
  const taxes = typeof bill?.taxes === "string"
    ? JSON.parse(bill.taxes)
    : bill?.taxes || [];
  const discounts = typeof bill?.discounts === "string"
    ? JSON.parse(bill.discounts)
    : bill?.discounts || [];

  const subtotal = Array.isArray(items)
    ? items.reduce((sum, i) => sum + (i.totalPrice || (i.unitPrice * (i.qty || 1)) || 0), 0)
    : 0;

  return {
    data: {
      invoiceNumber: bill?.billNumber || `INV-${order.orderNumber.slice(-8)}`,
      orderNumber: order.orderNumber,
      orderId: order.id,
      transactionId: Array.isArray(payments) && payments[0]?.reference ? payments[0].reference : `TXN-${order.id.slice(-6)}`,
      createdAt: order.createdAt,
      type: order.type,
      status: order.status,
      paymentStatus: bill?.status || "PAID",
      paymentMethod: Array.isArray(payments) && payments[0]?.method ? payments[0].method : "CASH",
      staffName,
      tableNumber: order.table?.number || null,
      tableZone: order.table?.zone || null,
      customerDetails: {
        name: order.user?.name || "Guest Customer",
        email: order.user?.email || "guest@addadotcom.cafe",
        phone: order.user?.phone || "N/A",
      },
      cafeDetails,
      items: Array.isArray(items) ? items : [],
      financials: {
        subtotal: bill?.subtotal || subtotal,
        discounts: Array.isArray(discounts) ? discounts : [],
        serviceCharge: bill?.serviceCharge || (order.type === "DINE_IN" ? Math.round(subtotal * 0.05 * 100) / 100 : 0),
        deliveryFee: order.deliveryFee || 0,
        taxes: Array.isArray(taxes) && taxes.length > 0 ? taxes : [
          { name: "CGST", rate: 2.5, amount: Math.round(subtotal * 0.025 * 100) / 100 },
          { name: "SGST", rate: 2.5, amount: Math.round(subtotal * 0.025 * 100) / 100 },
        ],
        total: bill?.total || Math.round((subtotal * 1.05) * 100) / 100,
      },
    },
  };
});
