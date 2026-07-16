import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tables = await prisma.cafeTable.findMany({
      orderBy: { number: "asc" },
    });
    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const table = await prisma.cafeTable.create({
      data: {
        number: parseInt(body.number),
        capacity: parseInt(body.capacity),
        zone: body.zone || "INDOOR",
        status: "FREE",
      },
    });
    return NextResponse.json({ success: true, data: table }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create table" },
      { status: 500 }
    );
  }
}
