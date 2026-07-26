// ─── Restaurant Automation Engine ─────────────────────────────────────────────

import prisma from "@/lib/prisma";
import { evaluateConditions } from "./conditions";
import { executeAction } from "./actions";
import { logExecution } from "./logger";
import { CacheManager } from "@/lib/redis";

export type AutomationEvent =
  | "ORDER_CREATED"
  | "ORDER_STATUS_CHANGED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "INVENTORY_LOW"
  | "RESERVATION_CREATED"
  | "RESERVATION_CANCELLED"
  | "REVIEW_SUBMITTED"
  | "TABLE_OCCUPIED"
  | "TABLE_FREED"
  | "LOYALTY_AWARDED";

export interface AutomationPayload {
  event: AutomationEvent;
  triggeredBy?: string; // orderId, userId, inventoryItemId etc.
  data: Record<string, any>; // full event context
}

export class AutomationEngine {
  /**
   * Main entry point called from API routes after DB mutations.
   * Runs entirely async using setImmediate — never blocks the calling API route.
   */
  static fire(event: AutomationEvent, data: Record<string, any>, triggeredBy?: string): void {
    setImmediate(() => {
      AutomationEngine._process({ event, data, triggeredBy }).catch((err) =>
        console.error(`[AutomationEngine] Unhandled error processing ${event}:`, err)
      );
    });
  }

  private static async _process(payload: AutomationPayload): Promise<void> {
    const cacheKey = `automation:workflows:${payload.event}`;
    let workflows = CacheManager.get<any[]>(cacheKey);

    if (!workflows) {
      workflows = await prisma.automationWorkflow.findMany({
        where: { triggerEvent: payload.event, isActive: true },
      });
      CacheManager.set(cacheKey, workflows, 30); // cache 30 seconds
    }

    if (!workflows || workflows.length === 0) return;

    for (const workflow of workflows) {
      // Deduplication: prevent duplicate triggers within dedupeWindow
      if (workflow.dedupeKey && workflow.dedupeWindow > 0) {
        const dedupeId = `automation:dedupe:${workflow.id}:${payload.triggeredBy || "global"}`;
        if (CacheManager.get(dedupeId)) {
          await logExecution(workflow.id, payload, "SKIPPED", null, "Deduplicated within window");
          continue;
        }
        CacheManager.set(dedupeId, true, workflow.dedupeWindow);
      }

      await AutomationEngine.executeWorkflowWithRetry(workflow, payload);
    }
  }

  public static async executeWorkflowWithRetry(
    workflow: any,
    payload: AutomationPayload,
    attempt = 1
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const conditions =
        typeof workflow.conditions === "string" ? JSON.parse(workflow.conditions) : workflow.conditions;

      // Evaluate conditions
      const conditionsPass = evaluateConditions(conditions, payload.data);
      if (!conditionsPass) {
        await logExecution(workflow.id, payload, "SKIPPED", null, "Conditions not met", Date.now() - startTime);
        return;
      }

      // Execute actions in sequence
      const actions =
        typeof workflow.actions === "string" ? JSON.parse(workflow.actions) : workflow.actions;

      const results: any[] = [];
      for (const action of actions) {
        const result = await executeAction(action, payload.data);
        results.push({ action: action.type, result });
      }

      await logExecution(workflow.id, payload, "SUCCESS", results, null, Date.now() - startTime, attempt - 1);
    } catch (err: any) {
      const errorMessage = err?.message || "Unknown error during workflow execution";

      if (attempt < (workflow.maxRetries || 3)) {
        const delay = (workflow.retryDelay || 2000) * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return AutomationEngine.executeWorkflowWithRetry(workflow, payload, attempt + 1);
      }

      // Max retries exceeded — log failure and broadcast alert
      await logExecution(workflow.id, payload, "FAILED", null, errorMessage, Date.now() - startTime, attempt);

      try {
        const { broadcast } = await import("@/lib/sse-emitter");
        broadcast("automation-failed", {
          workflowName: workflow.name,
          error: errorMessage,
          event: payload.event,
        });
      } catch {}
    }
  }
}
