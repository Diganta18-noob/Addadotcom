import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await prisma.inventoryItem.create({
      data: {
        name: body.name,
        unit: body.unit,
        quantity: parseFloat(body.quantity || 0),
        lowStockThreshold: parseFloat(body.lowStockThreshold || 0),
      },
    });

    if (body.quantity) {
      await prisma.stockLog.create({
        data: {
          inventoryItemId: item.id,
          change: parseFloat(body.quantity),
          reason: "Initial stock registration",
        },
      });
    }

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create inventory item" }, { status: 500 });
  }
}
