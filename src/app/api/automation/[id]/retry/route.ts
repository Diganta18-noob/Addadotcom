import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { AutomationEngine } from "@/lib/automation";

export const dynamic = "force-dynamic";

// POST /api/automation/[id]/retry — re-fire a workflow execution using saved log payload
export const POST = apiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id; // workflowId or logId

  const body = await request.json().catch(() => ({}));
  const logId = body.logId;

  let log: any = null;
  if (logId) {
    log = await prisma.automationLog.findUnique({ where: { id: logId } });
  }

  if (!log) {
    // Find the latest failed log for this workflow
    log = await prisma.automationLog.findFirst({
      where: { workflowId: id },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!log) {
    throw new ApiError(404, "NOT_FOUND", "Execution log not found for retry");
  }

  const workflow = await prisma.automationWorkflow.findUnique({
    where: { id: log.workflowId },
  });

  if (!workflow) {
    throw new ApiError(404, "NOT_FOUND", "Associated workflow not found");
  }

  // Re-fire workflow execution asynchronously
  setImmediate(() => {
    AutomationEngine.executeWorkflowWithRetry(workflow, {
      event: log.triggerEvent as any,
      triggeredBy: log.triggeredBy || undefined,
      data: log.payload || {},
    }).catch((err) => console.error("[Retry] Automation retry error:", err));
  });

  return {
    data: {
      success: true,
      message: `Retriggered workflow "${workflow.name}" with original event payload`,
      logId: log.id,
    },
  };
});
