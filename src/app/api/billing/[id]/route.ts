import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
        return NextResponse.json({ success: false, error: "Bill not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: billByNumber });
    }

    return NextResponse.json({ success: true, data: bill });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch bill" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const bill = await prisma.bill.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.payments && { payments: body.payments }),
        ...(body.discounts && { discounts: body.discounts }),
        ...(body.taxes && { taxes: body.taxes }),
        ...(body.total !== undefined && { total: parseFloat(body.total) }),
        ...(body.subtotal !== undefined && { subtotal: parseFloat(body.subtotal) }),
        ...(body.serviceCharge !== undefined && { serviceCharge: parseFloat(body.serviceCharge) }),
        ...(body.splitConfig !== undefined && { splitConfig: body.splitConfig }),
        ...(body.refundReason && { refundReason: body.refundReason }),
        ...(body.roundingAdj !== undefined && { roundingAdj: parseFloat(body.roundingAdj) }),
      },
      include: { order: true },
    });

    // Free table when bill is paid
    if (body.status === "PAID" && bill.order?.tableId) {
      await prisma.cafeTable.update({
        where: { id: bill.order.tableId },
        data: { status: "FREE" },
      });
      await prisma.order.update({
        where: { id: bill.orderId },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({ success: true, data: bill });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update bill" }, { status: 500 });
  }
}
