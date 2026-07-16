import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Try by ID first, then by booking code
    let reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { table: true },
    });

    if (!reservation) {
      reservation = await prisma.reservation.findUnique({
        where: { bookingCode: params.id },
        include: { table: true },
      });
    }

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch reservation" },
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

    // Find reservation by ID or booking code
    let existing = await prisma.reservation.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      existing = await prisma.reservation.findUnique({
        where: { bookingCode: params.id },
      });
    }
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    const reservation = await prisma.reservation.update({
      where: { id: existing.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.tableId && { tableId: body.tableId }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.date && { date: new Date(body.date) }),
        ...(body.timeSlot && { timeSlot: body.timeSlot }),
        ...(body.partySize && { partySize: body.partySize }),
      },
      include: { table: true },
    });

    // If marking as seated, update table status
    if (body.status === "SEATED" && reservation.tableId) {
      await prisma.cafeTable.update({
        where: { id: reservation.tableId },
        data: { status: "OCCUPIED" },
      });
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}
