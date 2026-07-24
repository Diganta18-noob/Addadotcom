"use client";

import { useSSE } from "@/lib/useSSE";
import toast from "react-hot-toast";

export function AdminNotifier() {
  useSSE({
    "new-order": (data) => {
      toast.success(
        `🔔 New Order: ${data.orderNumber} (${data.type?.replace("_", " ")})`,
        { duration: 8000, id: `order-${data.orderId || data.id}` }
      );
    },
    "bill-paid": (data) => {
      toast.success(`💰 Bill Paid: ${data.billNumber || "Invoice"} — ₹${data.total || 0}`, {
        duration: 5000,
        id: `bill-${data.orderId || data.id}`,
      });
    },
  });

  return null;
}
