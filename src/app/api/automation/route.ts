import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { CacheManager } from "@/lib/redis";

export const dynamic = "force-dynamic";

// GET /api/automation — list all automation workflows
export const GET = apiHandler(async () => {
  const workflows = await prisma.automationWorkflow.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { executions: true },
      },
    },
  });

  return { data: workflows };
});

// POST /api/automation — create new automation workflow
export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { name, description, triggerEvent, conditions, actions, dedupeKey, dedupeWindow, maxRetries, retryDelay } = body;

  if (!name || !triggerEvent) {
    throw new ApiError(400, "BAD_REQUEST", "Name and triggerEvent are required");
  }

  const workflow = await prisma.automationWorkflow.create({
    data: {
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      triggerEvent: String(triggerEvent).trim(),
      isActive: true,
      conditions: conditions || [],
      actions: actions || [],
      dedupeKey: dedupeKey ? String(dedupeKey).trim() : null,
      dedupeWindow: dedupeWindow ? Number(dedupeWindow) : 60,
      maxRetries: maxRetries ? Number(maxRetries) : 3,
      retryDelay: retryDelay ? Number(retryDelay) : 2000,
    },
  });

  // Invalidate cache for workflows
  CacheManager.del(`automation:workflows:${triggerEvent}`);

  return { data: workflow, status: 201 };
});
