import prisma from "@/lib/prisma";
import { apiHandler, protectedApiHandler, ApiError } from "@/lib/api-helpers";
import { updateOrderSchema } from "@/lib/validations";
import { AutomationEngine } from "@/lib/automation";

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

export const PUT = protectedApiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;

  const body = await request.json();
  const data = updateOrderSchema.parse(body);

  let existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    existing = await prisma.order.findUnique({ where: { orderNumber: id } });
  }
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Order not found");
  }

  const order = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: existing!.id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.items && { items: data.items }),
      },
      include: { bill: true, table: true, user: true },
    });

    if (updatedOrder.tableId && updatedOrder.type === "DINE_IN") {
      if (data.status === "COMPLETED" || data.status === "CANCELLED") {
        await tx.cafeTable.update({
          where: { id: updatedOrder.tableId },
          data: { status: "NEEDS_CLEANING" },
        });
      } else if (data.status === "SERVED") {
        await tx.cafeTable.update({
          where: { id: updatedOrder.tableId },
          data: { status: "BILL_REQUESTED" },
        });
      }
    }

    if (data.status === "COMPLETED" && existing!.status !== "COMPLETED" && updatedOrder.userId) {
      const items = typeof updatedOrder.items === "string" ? JSON.parse(updatedOrder.items) : updatedOrder.items;
      const totalAmount = Array.isArray(items)
        ? items.reduce((sum: number, i: any) => sum + (i.totalPrice || (i.unitPrice * (i.qty || 1)) || 0), 0)
        : 0;
      const earnedPoints = Math.floor(totalAmount / 10);

      if (earnedPoints > 0) {
        await tx.user.update({
          where: { id: updatedOrder.userId },
          data: { loyaltyPoints: { increment: earnedPoints } },
        });
      }
    }

    return updatedOrder;
  });

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

  // Fire Automation Engine event asynchronously
  if (data.status) {
    AutomationEngine.fire(
      "ORDER_STATUS_CHANGED",
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        previousStatus: existing.status,
        tableId: order.tableId,
        userId: order.userId,
      },
      order.id
    );
  }

  return { data: order };
});
