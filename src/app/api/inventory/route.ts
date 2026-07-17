import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";
import { createInventorySchema } from "@/lib/validations";

export const GET = apiHandler(async () => {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
    include: {
      stockLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  return { data: items };
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const data = createInventorySchema.parse(body);

  const item = await prisma.inventoryItem.create({
    data: {
      name: data.name,
      unit: data.unit,
      quantity: data.quantity,
      lowStockThreshold: data.lowStockThreshold,
    },
  });

  if (data.quantity > 0) {
    await prisma.stockLog.create({
      data: {
        inventoryItemId: item.id,
        change: data.quantity,
        reason: "Initial stock registration",
      },
    });
  }

  return { data: item, status: 201 };
});
