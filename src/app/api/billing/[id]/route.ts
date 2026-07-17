import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { updateBillSchema } from "@/lib/validations";

export const GET = apiHandler(async (request, { params }) => {
  const bill = await prisma.bill.findUnique({
    where: { id: params.id },
    include: { order: { include: { table: true } }, cashier: true },
  });

  if (!bill) {
    const billByNumber = await prisma.bill.findUnique({
      where: { billNumber: params.id },
      include: { order: { include: { table: true } }, cashier: true },
    });
    if (!billByNumber) {
      throw new ApiError(404, "NOT_FOUND", "Bill not found");
    }
    return { data: billByNumber };
  }

  return { data: bill };
});

export const PUT = apiHandler(async (request, { params }) => {
  const body = await request.json();
  const data = updateBillSchema.parse(body);

  const bill = await prisma.bill.update({
    where: { id: params.id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.payments && { payments: data.payments }),
      ...(data.total !== undefined && { total: data.total }),
      ...(data.roundingAdj !== undefined && { roundingAdj: data.roundingAdj }),
      ...(data.refundReason !== undefined && { refundReason: data.refundReason }),
      ...(data.cashierId !== undefined && { cashierId: data.cashierId }),
    },
    include: { order: true },
  });

  // Free table when bill is paid
  if (data.status === "PAID" && bill.order?.tableId) {
    await prisma.cafeTable.update({
      where: { id: bill.order.tableId },
      data: { status: "FREE" },
    });
    await prisma.order.update({
      where: { id: bill.orderId },
      data: { status: "COMPLETED" },
    });
  }

  return { data: bill };
});
