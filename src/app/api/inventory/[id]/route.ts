import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { change, reason } = body;

    const existing = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Inventory item not found" }, { status: 404 });
    }

    const updated = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        quantity: {
          increment: parseFloat(change),
        },
      },
    });

    // Log the change
    await prisma.stockLog.create({
      data: {
        inventoryItemId: params.id,
        change: parseFloat(change),
        reason: reason || "Manual adjustment",
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to adjust inventory level" }, { status: 500 });
  }
}
