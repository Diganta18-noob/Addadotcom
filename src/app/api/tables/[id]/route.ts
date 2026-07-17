import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";
import { updateTableSchema } from "@/lib/validations";

export const PUT = apiHandler(async (request, { params }) => {
  const body = await request.json();
  const data = updateTableSchema.parse(body);

  const table = await prisma.cafeTable.update({
    where: { id: params.id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
      ...(data.zone && { zone: data.zone }),
    },
  });

  return { data: table };
});

export const DELETE = apiHandler(async (request, { params }) => {
  await prisma.cafeTable.delete({ where: { id: params.id } });
  return { data: { message: "Table deleted" } };
});
