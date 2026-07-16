import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: orderByNumber });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.items && { items: body.items }),
      },
      include: { bill: true, table: true },
    });

    // Update table status based on order status
    if (order.tableId && order.type === "DINE_IN") {
      if (body.status === "COMPLETED" || body.status === "CANCELLED") {
        await prisma.cafeTable.update({
          where: { id: order.tableId },
          data: { status: "NEEDS_CLEANING" },
        });
      } else if (body.status === "SERVED") {
        await prisma.cafeTable.update({
          where: { id: order.tableId },
          data: { status: "BILL_REQUESTED" },
        });
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
