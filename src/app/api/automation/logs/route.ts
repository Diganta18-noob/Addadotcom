import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

// GET /api/automation/logs — fetch automation execution history with optional filtering
export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const workflowId = searchParams.get("workflowId");
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50)));

  const where: any = {};
  if (status) where.status = status;
  if (workflowId) where.workflowId = workflowId;

  const [logs, stats] = await Promise.all([
    prisma.automationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        workflow: {
          select: { id: true, name: true, triggerEvent: true },
        },
      },
    }),
    prisma.automationLog.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  return { data: { logs, stats } };
});
