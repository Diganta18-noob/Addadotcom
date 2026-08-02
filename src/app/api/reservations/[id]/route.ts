import prisma from "@/lib/prisma";
import { apiHandler, protectedApiHandler, ApiError } from "@/lib/api-helpers";
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

export const PUT = protectedApiHandler(async (request, { params }) => {
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

  const reservation = await prisma.$transaction(async (tx) => {
    const updated = await tx.reservation.update({
      where: { id: existing!.id },
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

    if (data.status === "SEATED" && updated.tableId) {
      await tx.cafeTable.update({
        where: { id: updated.tableId },
        data: { status: "OCCUPIED" },
      });
    }

    if (data.status === "CANCELLED" && existing!.tableId && existing!.status !== "CANCELLED") {
      await tx.cafeTable.update({
        where: { id: existing!.tableId },
        data: { status: "FREE" },
      });
    }

    return updated;
  });

  // Handle SSE broadcasts
  try {
    const { broadcast } = await import("@/lib/sse-emitter");
    if (data.status === "SEATED" && reservation.tableId) {
      broadcast("table-updated", {
        tableId: reservation.tableId,
        tableNumber: reservation.table?.number,
        status: "OCCUPIED",
      });
    } else if (data.status === "CANCELLED" && existing.tableId) {
      broadcast("table-updated", {
        tableId: existing.tableId,
        tableNumber: reservation.table?.number,
        status: "FREE",
      });
    }
    broadcast("reservation-updated", {
      id: reservation.id,
      status: reservation.status,
      tableId: reservation.tableId,
    });
  } catch (e) {}

  return { data: reservation };
});
