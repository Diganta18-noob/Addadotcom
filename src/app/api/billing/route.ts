import prisma from "@/lib/prisma";
import { generateBillNumber } from "@/lib/utils";
import { apiHandler } from "@/lib/api-helpers";
import { createBillSchema } from "@/lib/validations";
import { AutomationEngine } from "@/lib/automation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const paymentsArray = data.payments || [];
  const totalPaid = paymentsArray.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const isPaid = totalPaid >= (data.total - 1);

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
      payments: paymentsArray,
      status: isPaid ? "PAID" : "UNPAID",
    },
    include: { order: true },
  });

  // Only free table and complete order if fully paid
  if (isPaid && bill.order?.tableId) {
    await prisma.cafeTable.update({
      where: { id: bill.order.tableId },
      data: { status: "FREE" },
    });

    await prisma.order.update({
      where: { id: data.orderId },
      data: { status: "COMPLETED" },
    });
  }

  // Broadcast real-time SSE event
  try {
    const { broadcast } = await import("@/lib/sse-emitter");
    broadcast("bill-paid", {
      orderId: bill.orderId,
      billNumber: bill.billNumber,
      total: bill.total,
      tableId: bill.order?.tableId || null,
    });
    if (isPaid && bill.order?.tableId) {
      broadcast("table-updated", {
        tableId: bill.order.tableId,
        status: "FREE",
      });
    }
  } catch (e) {
    console.error("SSE Broadcast Error:", e);
  }

  // Fire Automation Engine event asynchronously
  AutomationEngine.fire(
    isPaid ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED",
    {
      orderId: bill.orderId,
      billNumber: bill.billNumber,
      total: bill.total,
      tableId: bill.order?.tableId,
      userId: bill.order?.userId,
    },
    bill.id
  );

  return { data: bill, status: 201 };
});
