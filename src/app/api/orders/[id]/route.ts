import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { updateOrderSchema } from "@/lib/validations";

export const GET = apiHandler(async (request, { params }) => {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { bill: true, table: true },
  });

  if (!order) {
    // Try by order number
    const orderByNumber = await prisma.order.findUnique({
      where: { orderNumber: params.id },
      include: { bill: true, table: true },
    });

    if (!orderByNumber) {
      throw new ApiError(404, "NOT_FOUND", "Order not found");
    }
    return { data: orderByNumber };
  }

  return { data: order };
});

export const PUT = apiHandler(async (request, { params }) => {
  const body = await request.json();
  const data = updateOrderSchema.parse(body);

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.items && { items: data.items }),
    },
    include: { bill: true, table: true },
  });

  // Update table status based on order status
  if (order.tableId && order.type === "DINE_IN") {
    if (data.status === "COMPLETED" || data.status === "CANCELLED") {
      await prisma.cafeTable.update({
        where: { id: order.tableId },
        data: { status: "NEEDS_CLEANING" },
      });
    } else if (data.status === "SERVED") {
      await prisma.cafeTable.update({
        where: { id: order.tableId },
        data: { status: "BILL_REQUESTED" },
      });
    }
  }

  return { data: order };
});
