// ─── Automation Execution Logger ──────────────────────────────────────────────

import prisma from "@/lib/prisma";

export async function logExecution(
  workflowId: string,
  payload: { event: string; triggeredBy?: string; data: Record<string, any> },
  status: "SUCCESS" | "FAILED" | "RETRYING" | "SKIPPED",
  result: any = null,
  error: string | null = null,
  durationMs: number | null = null,
  retryCount: number = 0
): Promise<void> {
  try {
    await prisma.automationLog.create({
      data: {
        workflowId,
        status,
        triggerEvent: payload.event,
        triggeredBy: payload.triggeredBy || null,
        payload: payload.data || {},
        result: result ? result : undefined,
        error: error || null,
        durationMs: durationMs || null,
        retryCount,
      },
    });
  } catch (err) {
    console.error("[logExecution] Error writing automation log:", err);
  }
}
