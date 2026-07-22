import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/table-session/[tableNumber] — fetch shared cart for a table
export const GET = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const tableNumber = params.tableNumber;

  if (!tableNumber) {
    throw new ApiError(400, "BAD_REQUEST", "Table number is required");
  }

  const key = `table_session_${tableNumber}`;
  const setting = await prisma.setting.findUnique({
    where: { key },
  });

  if (!setting) {
    return { data: { items: [], sessionId: `TS-${tableNumber}`, updatedAt: new Date() } };
  }

  try {
    const data = JSON.parse(setting.value);
    return { data };
  } catch {
    return { data: { items: [], sessionId: `TS-${tableNumber}`, updatedAt: new Date() } };
  }
});

// POST /api/table-session/[tableNumber] — update shared cart for a table
export const POST = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const tableNumber = params.tableNumber;
  const body = await request.json();

  if (!tableNumber) {
    throw new ApiError(400, "BAD_REQUEST", "Table number is required");
  }

  const key = `table_session_${tableNumber}`;
  const payload = {
    items: body.items || [],
    sessionId: body.sessionId || `TS-${tableNumber}`,
    updatedAt: new Date(),
  };

  await prisma.setting.upsert({
    where: { key },
    update: { value: JSON.stringify(payload) },
    create: { key, value: JSON.stringify(payload), group: "table_session" },
  });

  return { data: payload };
});
