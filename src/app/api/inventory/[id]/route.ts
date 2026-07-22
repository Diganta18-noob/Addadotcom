import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { adjustInventorySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const PUT = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;
  const body = await request.json();
  const data = adjustInventorySchema.parse(body);

  const existing = await prisma.inventoryItem.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Inventory item not found");
  }

  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: {
      quantity: {
        increment: data.change,
      },
    },
  });

  // Log the change
  await prisma.stockLog.create({
    data: {
      inventoryItemId: id,
      change: data.change,
      reason: data.reason || "Manual adjustment",
    },
  });

  return { data: updated };
});

export const DELETE = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;

  const existing = await prisma.inventoryItem.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Inventory item not found");
  }

  await prisma.inventoryItem.delete({
    where: { id },
  });

  return { data: { success: true, deletedId: id } };
});
