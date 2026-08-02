import prisma from "@/lib/prisma";
import { generateBillNumber } from "@/lib/utils";
import { protectedApiHandler } from "@/lib/api-helpers";
import { createBillSchema } from "@/lib/validations";
import { AutomationEngine } from "@/lib/automation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = protectedApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const today = searchParams.get("today");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const skip = (page - 1) * limit;

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

  const [total, bills] = await Promise.all([
    prisma.bill.count({ where }),
    prisma.bill.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { order: true },
    }),
  ]);

  return {
    data: {
      items: bills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
});

export const POST = protectedApiHandler(async (request) => {
  const body = await request.json();
  const data = createBillSchema.parse(body);

  const billNumber = generateBillNumber();

  const paymentsArray = data.payments || [];
  const totalPaid = paymentsArray.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const isPaid = totalPaid >= (data.total - 1);

  const bill = await prisma.$transaction(async (tx) => {
    const createdBill = await tx.bill.create({
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

    if (isPaid && createdBill.order?.tableId) {
      await tx.cafeTable.update({
        where: { id: createdBill.order.tableId },
        data: { status: "FREE" },
      });

      await tx.order.update({
        where: { id: data.orderId },
        data: { status: "COMPLETED" },
      });

      if (createdBill.order.userId) {
        const pointsAwarded = Math.floor(data.total / 10);
        if (pointsAwarded > 0) {
          await tx.user.update({
            where: { id: createdBill.order.userId },
            data: { loyaltyPoints: { increment: pointsAwarded } },
          });
        }
      }
    }

    return createdBill;
  });

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
