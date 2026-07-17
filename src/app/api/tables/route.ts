import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";

export const GET = apiHandler(async () => {
  const tables = await prisma.cafeTable.findMany({
    orderBy: { number: "asc" },
  });
  return { data: tables };
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const table = await prisma.cafeTable.create({
    data: {
      number: parseInt(body.number),
      capacity: parseInt(body.capacity),
      zone: body.zone || "INDOOR",
      status: "FREE",
    },
  });
  return { data: table, status: 201 };
});
