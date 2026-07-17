import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { adjustInventorySchema } from "@/lib/validations";

export const PUT = apiHandler(async (request, { params }) => {
  const body = await request.json();
  const data = adjustInventorySchema.parse(body);

  const existing = await prisma.inventoryItem.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Inventory item not found");
  }

  const updated = await prisma.inventoryItem.update({
    where: { id: params.id },
    data: {
      quantity: {
        increment: data.change,
      },
    },
  });

  // Log the change
  await prisma.stockLog.create({
    data: {
      inventoryItemId: params.id,
      change: data.change,
      reason: data.reason || "Manual adjustment",
    },
  });

  return { data: updated };
});
