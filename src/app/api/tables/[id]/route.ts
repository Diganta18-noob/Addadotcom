import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const table = await prisma.cafeTable.update({
      where: { id: params.id },
      data: {
        ...(body.number !== undefined && { number: parseInt(body.number) }),
        ...(body.capacity !== undefined && { capacity: parseInt(body.capacity) }),
        ...(body.zone && { zone: body.zone }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json({ success: true, data: table });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update table" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.cafeTable.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Table deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete table" },
      { status: 500 }
    );
  }
}
