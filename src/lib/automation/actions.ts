// ─── Automation Action Executor ──────────────────────────────────────────────

import prisma from "@/lib/prisma";
import { broadcast } from "@/lib/sse-emitter";

export type ActionType =
  | "BROADCAST_SSE"
  | "FREE_TABLE"
  | "OCCUPY_TABLE"
  | "MARK_TABLE_NEEDS_CLEANING"
  | "MARK_TABLE_RESERVED"
  | "AWARD_LOYALTY_POINTS"
  | "UPDATE_ORDER_STATUS"
  | "UPDATE_INVENTORY"
  | "CREATE_AUDIT_LOG"
  | "NOTIFY_ADMIN_TOAST"
  | "INVALIDATE_CACHE"
  | "FREE_TABLE_AFTER_CLEANUP";

export interface Action {
  type: ActionType;
  params?: Record<string, any>;
}

export async function executeAction(action: Action, eventData: Record<string, any>): Promise<any> {
  const params = action.params || {};

  switch (action.type) {
    case "BROADCAST_SSE": {
      const event = resolveTemplate(params.event || "automation-event", eventData);
      const payload = resolveObjectTemplates(params.data || {}, eventData);
      broadcast(event, payload);
      return { broadcasted: event, payload };
    }

    case "FREE_TABLE": {
      const tableId = params.tableId || eventData.tableId;
      if (!tableId) return { skipped: "No tableId provided" };
      await prisma.cafeTable.update({
        where: { id: tableId },
        data: { status: "FREE" },
      });
      broadcast("table-updated", { tableId, status: "FREE" });
      return { freedTableId: tableId };
    }

    case "OCCUPY_TABLE": {
      const tableId = params.tableId || eventData.tableId;
      if (!tableId) return { skipped: "No tableId provided" };
      await prisma.cafeTable.update({
        where: { id: tableId },
        data: { status: "OCCUPIED" },
      });
      broadcast("table-updated", { tableId, status: "OCCUPIED" });
      return { occupiedTableId: tableId };
    }

    case "MARK_TABLE_NEEDS_CLEANING": {
      const tableId = params.tableId || eventData.tableId;
      if (!tableId) return { skipped: "No tableId provided" };
      await prisma.cafeTable.update({
        where: { id: tableId },
        data: { status: "NEEDS_CLEANING" },
      });
      broadcast("table-updated", { tableId, status: "NEEDS_CLEANING" });
      return { markedCleaningTableId: tableId };
    }

    case "MARK_TABLE_RESERVED": {
      const tableId = params.tableId || eventData.tableId;
      if (!tableId) return { skipped: "No tableId provided" };
      await prisma.cafeTable.update({
        where: { id: tableId },
        data: { status: "RESERVED" },
      });
      broadcast("table-updated", { tableId, status: "RESERVED" });
      return { reservedTableId: tableId };
    }

    case "FREE_TABLE_AFTER_CLEANUP": {
      const tableId = params.tableId || eventData.tableId;
      if (!tableId) return { skipped: "No tableId provided" };
      await prisma.cafeTable.update({
        where: { id: tableId },
        data: { status: "FREE" },
      });
      broadcast("table-updated", { tableId, status: "FREE" });
      return { freedTableId: tableId };
    }

    case "AWARD_LOYALTY_POINTS": {
      const userId = params.userId || eventData.userId;
      const points = Number(params.points || Math.floor((eventData.total || 0) / 10));
      if (!userId || points <= 0) return { skipped: "No userId or 0 points" };
      await prisma.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { increment: points } },
      });
      broadcast("loyalty-updated", { userId, pointsEarned: points });
      return { awardedUserId: userId, points };
    }

    case "UPDATE_ORDER_STATUS": {
      const orderId = params.orderId || eventData.orderId;
      const status = params.status;
      if (!orderId || !status) return { skipped: "Missing orderId or status" };
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
      broadcast("order-updated", { orderId: updated.id, orderNumber: updated.orderNumber, status: updated.status });
      return { updatedOrderId: orderId, status: updated.status };
    }

    case "UPDATE_INVENTORY": {
      const itemId = params.inventoryItemId || eventData.inventoryItemId;
      const change = Number(params.change || 0);
      if (!itemId) return { skipped: "No inventoryItemId provided" };
      const updated = await prisma.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: { increment: change } },
      });
      if (updated.quantity <= updated.lowStockThreshold) {
        broadcast("inventory-low", { itemId: updated.id, name: updated.name, quantity: updated.quantity });
      }
      return { updatedItemId: itemId, newQuantity: updated.quantity };
    }

    case "NOTIFY_ADMIN_TOAST": {
      const message = resolveTemplate(params.message || "Automation notification", eventData);
      const toastType = params.toastType || "info"; // info | success | warning | error
      broadcast("admin-notification", { message, type: toastType, timestamp: Date.now() });
      return { notifiedMessage: message, toastType };
    }

    case "INVALIDATE_CACHE": {
      const { CacheManager } = await import("@/lib/redis");
      const keys: string[] = params.keys || [];
      keys.forEach((key) => CacheManager.del(key));
      CacheManager.del("automation:workflows:");
      return { invalidatedKeys: keys };
    }

    case "CREATE_AUDIT_LOG": {
      const message = resolveTemplate(params.message || "Automation audit entry", eventData);
      return { auditMessage: message, timestamp: new Date().toISOString() };
    }

    default:
      return { skipped: `Unknown action type: ${(action as any).type}` };
  }
}

// Replaces {{fieldName}} placeholders with actual values from eventData
function resolveTemplate(template: string, data: Record<string, any>): string {
  return String(template || "").replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = data[key];
    return val !== undefined && val !== null ? String(val) : "";
  });
}

function resolveObjectTemplates(obj: Record<string, any>, data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === "string" ? resolveTemplate(value, data) : value;
  }
  return result;
}
