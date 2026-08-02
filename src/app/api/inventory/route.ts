import prisma from "@/lib/prisma";
import { protectedApiHandler } from "@/lib/api-helpers";
import { createInventorySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = protectedApiHandler(async () => {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
  });
  return { data: items };
});

export const POST = protectedApiHandler(async (request) => {
  const body = await request.json();
  const data = createInventorySchema.parse(body);

  const item = await prisma.$transaction(async (tx) => {
    const createdItem = await tx.inventoryItem.create({
      data: {
        name: data.name,
        unit: data.unit,
        quantity: data.quantity,
        lowStockThreshold: data.lowStockThreshold,
      },
    });

    if (data.quantity > 0) {
      await tx.stockLog.create({
        data: {
          inventoryItemId: createdItem.id,
          change: data.quantity,
          reason: "Initial stock registration",
        },
      });
    }

    return createdItem;
  });

  return { data: item, status: 201 };
});
