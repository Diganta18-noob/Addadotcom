import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { updateReservationSchema } from "@/lib/validations";

export const GET = apiHandler(async (request, { params }) => {
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
    throw new ApiError(404, "NOT_FOUND", "Reservation not found");
  }

  return { data: reservation };
});

export const PUT = apiHandler(async (request, { params }) => {
  const body = await request.json();
  const data = updateReservationSchema.parse(body);

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
    throw new ApiError(404, "NOT_FOUND", "Reservation not found");
  }

  const reservation = await prisma.reservation.update({
    where: { id: existing.id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.tableId && { tableId: data.tableId }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.timeSlot && { timeSlot: data.timeSlot }),
      ...(data.partySize && { partySize: data.partySize }),
    },
    include: { table: true },
  });

  // If marking as seated, update table status
  if (data.status === "SEATED" && reservation.tableId) {
    await prisma.cafeTable.update({
      where: { id: reservation.tableId },
      data: { status: "OCCUPIED" },
    });
  }

  return { data: reservation };
});
