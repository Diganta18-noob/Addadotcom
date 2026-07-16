import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateBillNumber } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const today = searchParams.get("today");
    const search = searchParams.get("search");

    const where: any = {};

    if (status) where.status = status;
    if (today === "true") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }
    if (search) {
      where.billNumber = { contains: search, mode: "insensitive" };
    }

    const bills = await prisma.bill.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { order: true },
    });

    return NextResponse.json({ success: true, data: bills });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      subtotal,
      discounts,
      serviceCharge,
      serviceChargeRate,
      taxes,
      total,
      roundingAdj,
      cashierId,
      splitConfig,
      payments,
    } = body;

    const billNumber = generateBillNumber();

    const bill = await prisma.bill.create({
      data: {
        billNumber,
        orderId,
        subtotal: parseFloat(subtotal),
        discounts: discounts || [],
        serviceCharge: serviceCharge ? parseFloat(serviceCharge) : 0,
        serviceChargeRate: serviceChargeRate ? parseFloat(serviceChargeRate) : 0,
        taxes: taxes || [],
        total: parseFloat(total),
        roundingAdj: roundingAdj ? parseFloat(roundingAdj) : 0,
        cashierId: cashierId || null,
        splitConfig: splitConfig || null,
        payments: payments || [],
        status: payments && payments.length > 0 ? "PAID" : "UNPAID",
      },
      include: { order: true },
    });

    // If bill is paid and order is dine-in, free the table
    if (bill.status === "PAID" && bill.order?.tableId) {
      await prisma.cafeTable.update({
        where: { id: bill.order.tableId },
        data: { status: "FREE" },
      });

      // Mark order as completed
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({ success: true, data: bill }, { status: 201 });
  } catch (error) {
    console.error("Bill Create Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create bill" },
      { status: 500 }
    );
  }
}
