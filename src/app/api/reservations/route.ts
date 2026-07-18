import prisma from "@/lib/prisma";
import { generateBookingCode } from "@/lib/utils";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { createReservationSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = apiHandler(async (request) => {
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
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: { table: true },
  });

  return { data: reservations };
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const data = createReservationSchema.parse(body);

  const bookingDate = new Date(data.date);

  // Try to find a suitable table for party size if available
  const suitableTables = await prisma.cafeTable.findMany({
    where: {
      capacity: { gte: data.partySize },
    },
    orderBy: { capacity: "asc" },
  });

  // Check existing active reservations for this date and timeslot
  const existingReservations = await prisma.reservation.findMany({
    where: {
      date: bookingDate,
      timeSlot: data.timeSlot,
      status: { in: ["PENDING", "CONFIRMED", "SEATED"] },
    },
  });

  const bookedTableIds = existingReservations.map((r) => r.tableId).filter(Boolean);
  const availableTable = suitableTables.find((t) => !bookedTableIds.includes(t.id));

  const bookingCode = generateBookingCode();

  const reservation = await prisma.reservation.create({
    data: {
      userId: data.userId || null,
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone,
      date: bookingDate,
      timeSlot: data.timeSlot,
      duration: data.duration || 90,
      partySize: data.partySize,
      tableId: availableTable ? availableTable.id : null,
      status: "CONFIRMED",
      bookingCode,
      notes: data.notes || null,
    },
    include: { table: true },
  });

  // Update table status to RESERVED in the database if table is assigned
  if (availableTable) {
    await prisma.cafeTable.update({
      where: { id: availableTable.id },
      data: { status: "RESERVED" },
    });
  }

  return { data: reservation, status: 201 };
});
