import prisma from "@/lib/prisma";
import { protectedApiHandler, ApiError } from "@/lib/api-helpers";
import { adjustInventorySchema } from "@/lib/validations";
import { AutomationEngine } from "@/lib/automation";

export const dynamic = "force-dynamic";

export const PUT = protectedApiHandler(async (request, context: any) => {
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

  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.update({
      where: { id },
      data: {
        quantity: {
          increment: data.change,
        },
      },
    });

    await tx.stockLog.create({
      data: {
        inventoryItemId: id,
        change: data.change,
        reason: data.reason || "Manual adjustment",
      },
    });

    return item;
  });

  // Fire Automation Engine event if stock is low
  if (updated.quantity <= updated.lowStockThreshold) {
    AutomationEngine.fire(
      "INVENTORY_LOW",
      {
        inventoryItemId: updated.id,
        name: updated.name,
        quantity: updated.quantity,
        threshold: updated.lowStockThreshold,
      },
      updated.id
    );
  }

  return { data: updated };
});

export const DELETE = protectedApiHandler(async (request, context: any) => {
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
