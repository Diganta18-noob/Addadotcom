import prisma from "@/lib/prisma";
import { generateBillNumber } from "@/lib/utils";
import { apiHandler } from "@/lib/api-helpers";
import { createBillSchema } from "@/lib/validations";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const today = searchParams.get("today");
  const search = searchParams.get("search");

  const where: any = {};

  if (status) where.status = status;
  if (today === "true") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    where.createdAt = { gte: start, lte: end };
  }
  if (search) {
    where.billNumber = { contains: search, mode: "insensitive" };
  }

  const bills = await prisma.bill.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  return { data: bills };
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const data = createBillSchema.parse(body);

  const billNumber = generateBillNumber();

  const bill = await prisma.bill.create({
    data: {
      billNumber,
      orderId: data.orderId,
      subtotal: data.subtotal,
      discounts: data.discounts || [],
      serviceCharge: data.serviceCharge || 0,
      serviceChargeRate: data.serviceChargeRate || 0,
      taxes: data.taxes || [],
      total: data.total,
      roundingAdj: data.roundingAdj || 0,
      cashierId: data.cashierId || null,
      splitConfig: data.splitConfig || null,
      payments: data.payments || [],
      status: data.payments && data.payments.length > 0 ? "PAID" : "UNPAID",
    },
    include: { order: true },
  });

  // If bill is paid and order is dine-in, free the table
  if (bill.status === "PAID" && bill.order?.tableId) {
    await prisma.cafeTable.update({
      where: { id: bill.order.tableId },
      data: { status: "FREE" },
    });

    // Mark order as completed
    await prisma.order.update({
      where: { id: data.orderId },
      data: { status: "COMPLETED" },
    });
  }

  return { data: bill, status: 201 };
});
