import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(request: Request) {
  try {
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

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      tableId,
      reservationId,
      items,
      notes,
      deliveryAddress,
      deliveryFee,
      pickupTime,
    } = body;

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        type,
        tableId: tableId || null,
        reservationId: reservationId || null,
        items,
        notes: notes || null,
        deliveryAddress: deliveryAddress || null,
        deliveryFee: deliveryFee || 0,
        pickupTime: pickupTime ? new Date(pickupTime) : null,
        status: "PLACED",
      },
    });

    // If dine-in, update table status to OCCUPIED
    if (type === "DINE_IN" && tableId) {
      await prisma.cafeTable.update({
        where: { id: tableId },
        data: { status: "OCCUPIED" },
      });
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Order Create Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
