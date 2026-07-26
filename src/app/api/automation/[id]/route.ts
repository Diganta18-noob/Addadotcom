import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { CacheManager } from "@/lib/redis";

export const dynamic = "force-dynamic";

// PUT /api/automation/[id] — update or toggle automation workflow
export const PUT = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;
  const body = await request.json();

  const existing = await prisma.automationWorkflow.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Workflow not found");
  }

  const updated = await prisma.automationWorkflow.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.triggerEvent !== undefined && { triggerEvent: body.triggerEvent }),
      ...(body.conditions !== undefined && { conditions: body.conditions }),
      ...(body.actions !== undefined && { actions: body.actions }),
      ...(body.dedupeKey !== undefined && { dedupeKey: body.dedupeKey }),
      ...(body.dedupeWindow !== undefined && { dedupeWindow: Number(body.dedupeWindow) }),
      ...(body.maxRetries !== undefined && { maxRetries: Number(body.maxRetries) }),
      ...(body.retryDelay !== undefined && { retryDelay: Number(body.retryDelay) }),
    },
  });

  CacheManager.del(`automation:workflows:${existing.triggerEvent}`);
  if (body.triggerEvent && body.triggerEvent !== existing.triggerEvent) {
    CacheManager.del(`automation:workflows:${body.triggerEvent}`);
  }

  return { data: updated };
});

// DELETE /api/automation/[id] — delete automation workflow
export const DELETE = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;

  const existing = await prisma.automationWorkflow.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Workflow not found");
  }

  await prisma.automationWorkflow.delete({
    where: { id },
  });

  CacheManager.del(`automation:workflows:${existing.triggerEvent}`);

  return { data: { success: true, deletedId: id } };
});
