import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateBookingCode } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const code = searchParams.get("code");

    const where: any = {};

    if (code) {
      where.bookingCode = code;
    }
    if (date) {
      where.date = new Date(date);
    }
    if (status) {
      where.status = status;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
      include: { table: true },
    });

    return NextResponse.json({ success: true, data: reservations });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      guestName,
      guestEmail,
      guestPhone,
      date,
      timeSlot,
      duration,
      partySize,
      notes,
    } = body;

    // Find available table that fits the party size
    const bookingDate = new Date(date);

    // Get tables that can accommodate the party
    const suitableTables = await prisma.cafeTable.findMany({
      where: {
        capacity: { gte: partySize },
      },
      orderBy: { capacity: "asc" }, // Best fit: smallest table that fits
    });

    // Check which tables are already booked for this slot
    const existingReservations = await prisma.reservation.findMany({
      where: {
        date: bookingDate,
        timeSlot,
        status: { in: ["PENDING", "CONFIRMED", "SEATED"] },
      },
    });

    const bookedTableIds = existingReservations.map((r) => r.tableId).filter(Boolean);
    const availableTable = suitableTables.find(
      (t) => !bookedTableIds.includes(t.id)
    );

    if (!availableTable) {
      return NextResponse.json(
        { success: false, error: "No tables available for this time slot" },
        { status: 409 }
      );
    }

    const bookingCode = generateBookingCode();

    const reservation = await prisma.reservation.create({
      data: {
        userId: userId || null,
        guestName,
        guestEmail: guestEmail || null,
        guestPhone,
        date: bookingDate,
        timeSlot,
        duration: duration || 90,
        partySize,
        tableId: availableTable.id,
        status: "CONFIRMED",
        bookingCode,
        notes: notes || null,
      },
      include: { table: true },
    });

    return NextResponse.json(
      { success: true, data: reservation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Reservation Create Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
