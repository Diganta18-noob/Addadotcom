import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { createOrderSchema, updateOrderSchema } from "@/lib/validations";
import { AutomationEngine } from "@/lib/automation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const today = searchParams.get("today");

  const where: any = {};

  if (status) {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }
  if (today === "true") {
    // Calculate IST (+5:30) midnight to prevent UTC server timezone bleed
    const now = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffsetMs);
    const istMidnight = new Date(istNow);
    istMidnight.setUTCHours(0, 0, 0, 0);
    const startUTC = new Date(istMidnight.getTime() - istOffsetMs);
    where.createdAt = { gte: startUTC };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { bill: true, table: true },
  });

  return { data: orders };
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const data = createOrderSchema.parse(body);

  // Robustly resolve tableId from tableId parameter or tableNumber
  let resolvedTableId: string | null = null;

  if (data.tableId) {
    // Check if tableId is CUID or a numeric string table number
    const foundById = await prisma.cafeTable.findUnique({ where: { id: data.tableId } });
    if (foundById) {
      resolvedTableId = foundById.id;
    } else {
      const parsedNum = parseInt(data.tableId);
      if (!isNaN(parsedNum)) {
        const foundByNum = await prisma.cafeTable.findUnique({ where: { number: parsedNum } });
        if (foundByNum) resolvedTableId = foundByNum.id;
      }
    }
  }

  if (!resolvedTableId && body.tableNumber) {
    const parsedNum = parseInt(body.tableNumber);
    if (!isNaN(parsedNum)) {
      const foundByNum = await prisma.cafeTable.findUnique({ where: { number: parsedNum } });
      if (foundByNum) resolvedTableId = foundByNum.id;
    }
  }

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: data.userId || null,
      type: data.type,
      tableId: resolvedTableId,
      reservationId: data.reservationId || null,
      items: data.items,
      notes: data.notes || null,
      deliveryAddress: data.deliveryAddress || null,
      deliveryFee: data.deliveryFee || 0,
      pickupTime: data.pickupTime ? new Date(data.pickupTime) : null,
      status: "PLACED",
    },
    include: { table: true },
  });

  // If dine-in and table resolved, mark table OCCUPIED
  if (data.type === "DINE_IN" && resolvedTableId) {
    await prisma.cafeTable.update({
      where: { id: resolvedTableId },
      data: { status: "OCCUPIED" },
    });
  }

  // Broadcast real-time SSE event
  try {
    const { broadcast } = await import("@/lib/sse-emitter");
    broadcast("new-order", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      type: order.type,
      tableId: resolvedTableId || null,
      tableNumber: order.table?.number || null,
      itemCount: Array.isArray(data.items) ? data.items.length : 0,
    });
    if (resolvedTableId) {
      broadcast("table-updated", {
        tableId: resolvedTableId,
        tableNumber: order.table?.number || null,
        status: "OCCUPIED",
      });
    }
  } catch (e) {
    console.error("SSE Broadcast Error:", e);
  }

  // Fire Automation Engine event asynchronously
  const total = Array.isArray(data.items)
    ? data.items.reduce((s: number, i: any) => s + (i.totalPrice || 0), 0)
    : 0;

  AutomationEngine.fire(
    "ORDER_CREATED",
    {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderType: order.type,
      tableId: resolvedTableId,
      userId: order.userId,
      items: data.items,
      total,
    },
    order.id
  );

  return { data: order, status: 201 };
});
