import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";
import { updateTableSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const PUT = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;

  const body = await request.json();
  const data = updateTableSchema.parse(body);

  const table = await prisma.cafeTable.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
      ...(data.zone && { zone: data.zone }),
    },
  });

  // Broadcast SSE event
  try {
    const { broadcast } = await import("@/lib/sse-emitter");
    broadcast("table-updated", {
      tableId: table.id,
      tableNumber: table.number,
      status: table.status,
    });
  } catch (e) {
    console.error("SSE Broadcast Error:", e);
  }

  return { data: table };
});

export const DELETE = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;

  await prisma.cafeTable.delete({ where: { id } });
  return { data: { message: "Table deleted" } };
});
