import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { createOrderSchema, updateOrderSchema } from "@/lib/validations";

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
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    where.createdAt = { gte: start, lte: end };
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

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: data.userId || null,
      type: data.type,
      tableId: data.tableId || null,
      reservationId: data.reservationId || null,
      items: data.items,
      notes: data.notes || null,
      deliveryAddress: data.deliveryAddress || null,
      deliveryFee: data.deliveryFee || 0,
      pickupTime: data.pickupTime ? new Date(data.pickupTime) : null,
      status: "PLACED",
    },
  });

  // If dine-in, update table status to OCCUPIED
  if (data.type === "DINE_IN" && data.tableId) {
    await prisma.cafeTable.update({
      where: { id: data.tableId },
      data: { status: "OCCUPIED" },
    });
  }

  return { data: order, status: 201 };
});
