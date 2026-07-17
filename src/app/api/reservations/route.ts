import prisma from "@/lib/prisma";
import { generateBookingCode } from "@/lib/utils";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { createReservationSchema } from "@/lib/validations";

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
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
    include: { table: true },
  });

  return { data: reservations };
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const data = createReservationSchema.parse(body);

  // Find available table that fits the party size
  const bookingDate = new Date(data.date);

  // Get tables that can accommodate the party
  const suitableTables = await prisma.cafeTable.findMany({
    where: {
      capacity: { gte: data.partySize },
    },
    orderBy: { capacity: "asc" }, // Best fit: smallest table that fits
  });

  // Check which tables are already booked for this slot
  const existingReservations = await prisma.reservation.findMany({
    where: {
      date: bookingDate,
      timeSlot: data.timeSlot,
      status: { in: ["PENDING", "CONFIRMED", "SEATED"] },
    },
  });

  const bookedTableIds = existingReservations.map((r) => r.tableId).filter(Boolean);
  const availableTable = suitableTables.find(
    (t) => !bookedTableIds.includes(t.id)
  );

  if (!availableTable) {
    throw new ApiError(409, "NO_AVAILABILITY", "No tables available for this time slot");
  }

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
      tableId: availableTable.id,
      status: "CONFIRMED",
      bookingCode,
      notes: data.notes || null,
    },
    include: { table: true },
  });

  return { data: reservation, status: 201 };
});
