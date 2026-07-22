import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { createOrderSchema, updateOrderSchema } from "@/lib/validations";

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
    // Use a 48-hour window to handle timezone differences (Vercel runs in UTC)
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    where.createdAt = { gte: start };
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
      tableNumber: order.table?.number || null,
      itemCount: Array.isArray(data.items) ? data.items.length : 0,
    });
  } catch (e) {
    console.error("SSE Broadcast Error:", e);
  }

  return { data: order, status: 201 };
});
