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
    "admin-notification": (data) => {
      const msg = data.message || "Automation Notification";
      const type = data.type || "info";
      if (type === "success") {
        toast.success(msg, { duration: 6000 });
      } else if (type === "warning") {
        toast(msg, { icon: "⚠️", duration: 7000 });
      } else if (type === "error") {
        toast.error(msg, { duration: 8000 });
      } else {
        toast(msg, { icon: "⚡", duration: 6000 });
      }
    },
  });

  return null;
}
