import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { updateOrderSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { bill: true, table: true, user: true },
  });

  if (!order) {
    const orderByNumber = await prisma.order.findUnique({
      where: { orderNumber: id },
      include: { bill: true, table: true, user: true },
    });

    if (!orderByNumber) {
      throw new ApiError(404, "NOT_FOUND", "Order not found");
    }
    return { data: orderByNumber };
  }

  return { data: order };
});

export const PUT = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;

  const body = await request.json();
  const data = updateOrderSchema.parse(body);

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Order not found");
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.items && { items: data.items }),
    },
    include: { bill: true, table: true, user: true },
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

  // Award Loyalty Points if status changed to COMPLETED and user is attached
  if (data.status === "COMPLETED" && existing.status !== "COMPLETED" && order.userId) {
    const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
    const totalAmount = Array.isArray(items)
      ? items.reduce((sum: number, i: any) => sum + (i.totalPrice || (i.unitPrice * (i.qty || 1)) || 0), 0)
      : 0;
    const earnedPoints = Math.floor(totalAmount / 10); // 1 point per ₹10 spent

    if (earnedPoints > 0) {
      await prisma.user.update({
        where: { id: order.userId },
        data: { loyaltyPoints: { increment: earnedPoints } },
      });
    }
  }

  // Broadcast SSE event
  try {
    const { broadcast } = await import("@/lib/sse-emitter");
    broadcast("order-updated", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      previousStatus: existing.status,
    });
  } catch (e) {
    console.error("SSE Broadcast Error:", e);
  }

  return { data: order };
});
