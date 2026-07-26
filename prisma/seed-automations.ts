import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultWorkflows = [
  {
    name: "Order Created → Kitchen + Dashboard Notify",
    description: "Notify kitchen display and admin dashboard when a new order is placed",
    triggerEvent: "ORDER_CREATED",
    conditions: [],
    actions: [
      {
        type: "BROADCAST_SSE",
        params: { event: "new-order", data: { orderId: "{{orderId}}", orderNumber: "{{orderNumber}}" } },
      },
      {
        type: "NOTIFY_ADMIN_TOAST",
        params: { message: "🔔 New order placed: {{orderNumber}}", toastType: "info" },
      },
    ],
  },
  {
    name: "Kitchen Marks Ready → Cashier Notified",
    description: "Send alert to cashier when kitchen updates order status to READY",
    triggerEvent: "ORDER_STATUS_CHANGED",
    conditions: [{ field: "status", operator: "eq", value: "READY" }],
    actions: [
      {
        type: "NOTIFY_ADMIN_TOAST",
        params: { message: "✅ Order {{orderNumber}} is READY for serving / pickup!", toastType: "success" },
      },
    ],
  },
  {
    name: "Payment Success → Free Table & Award Loyalty",
    description: "Automatically free the table, award customer loyalty points, and clear analytics cache upon bill payment",
    triggerEvent: "PAYMENT_SUCCESS",
    conditions: [],
    actions: [
      { type: "FREE_TABLE", params: {} },
      { type: "AWARD_LOYALTY_POINTS", params: {} },
      { type: "INVALIDATE_CACHE", params: { keys: ["cache:analytics:today"] } },
    ],
  },
  {
    name: "Low Inventory → Admin Alert",
    description: "Broadcast warning toast and SSE alert when inventory falls below threshold",
    triggerEvent: "INVENTORY_LOW",
    conditions: [],
    dedupeKey: "low-stock",
    dedupeWindow: 3600, // max once per hour
    actions: [
      {
        type: "NOTIFY_ADMIN_TOAST",
        params: { message: "⚠️ Low inventory alert: {{name}} ({{quantity}} remaining)", toastType: "warning" },
      },
      {
        type: "BROADCAST_SSE",
        params: { event: "inventory-low", data: { name: "{{name}}", quantity: "{{quantity}}" } },
      },
    ],
  },
  {
    name: "Reservation Created → Mark Table Reserved",
    description: "Mark table as RESERVED when a new booking is confirmed",
    triggerEvent: "RESERVATION_CREATED",
    conditions: [{ field: "tableId", operator: "exists" }],
    actions: [
      { type: "MARK_TABLE_RESERVED", params: {} },
      {
        type: "NOTIFY_ADMIN_TOAST",
        params: { message: "📅 New reservation for {{guestName}}", toastType: "info" },
      },
    ],
  },
  {
    name: "Review Submitted → Admin Toast Notification",
    description: "Notify admin when a customer submits a new feedback rating",
    triggerEvent: "REVIEW_SUBMITTED",
    conditions: [],
    actions: [
      {
        type: "NOTIFY_ADMIN_TOAST",
        params: { message: "⭐ New review from {{author}} ({{rating}}/5)", toastType: "info" },
      },
    ],
  },
  {
    name: "Order Completed → Clear Analytics Cache",
    description: "Invalidate analytics cache to show real-time metrics when order completes",
    triggerEvent: "ORDER_STATUS_CHANGED",
    conditions: [{ field: "status", operator: "eq", value: "COMPLETED" }],
    actions: [
      { type: "INVALIDATE_CACHE", params: { keys: ["cache:analytics:today"] } },
    ],
  },
  {
    name: "High Value Order → VIP Toast Alert",
    description: "Highlight orders exceeding ₹1,000 to staff for VIP care",
    triggerEvent: "ORDER_CREATED",
    conditions: [{ field: "total", operator: "gte", value: 1000 }],
    actions: [
      {
        type: "NOTIFY_ADMIN_TOAST",
        params: { message: "💎 High value order: ₹{{total}} (Order {{orderNumber}})", toastType: "success" },
      },
    ],
  },
  {
    name: "Peak Hours Order Alert",
    description: "Flag orders placed during peak lunch or dinner rush hours",
    triggerEvent: "ORDER_CREATED",
    conditions: [{ operator: "is_peak_hours" }],
    actions: [
      {
        type: "NOTIFY_ADMIN_TOAST",
        params: { message: "🔥 Rush hour order: {{orderNumber}}", toastType: "info" },
      },
    ],
  },
  {
    name: "Weekend Special Order Notification",
    triggerEvent: "ORDER_CREATED",
    conditions: [{ operator: "is_weekend" }],
    actions: [
      {
        type: "NOTIFY_ADMIN_TOAST",
        params: { message: "🎉 Weekend guest order: {{orderNumber}}", toastType: "info" },
      },
    ],
  },
];

async function main() {
  console.log("Seeding default automation workflows...");

  for (const wf of defaultWorkflows) {
    const existing = await prisma.automationWorkflow.findFirst({
      where: { name: wf.name },
    });

    if (!existing) {
      await prisma.automationWorkflow.create({
        data: {
          name: wf.name,
          description: wf.description,
          triggerEvent: wf.triggerEvent,
          isActive: true,
          conditions: wf.conditions,
          actions: wf.actions,
          dedupeKey: wf.dedupeKey || null,
          dedupeWindow: wf.dedupeWindow || 60,
        },
      });
      console.log(`✓ Seeded: ${wf.name}`);
    } else {
      console.log(`- Already exists: ${wf.name}`);
    }
  }

  console.log("Automation seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
