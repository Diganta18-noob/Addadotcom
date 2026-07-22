"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  ChevronRight,
  User,
  UtensilsCrossed,
  Package,
  Truck,
  AlertTriangle,
  Receipt,
  CheckCircle,
  ChefHat,
  Bell,
  Utensils,
  Sparkles,
} from "lucide-react";
import { cn, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared";

type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";

const statusSteps: { key: OrderStatus; label: string; icon: any }[] = [
  { key: "PLACED", label: "Placed", icon: Receipt },
  { key: "ACCEPTED", label: "Accepted", icon: CheckCircle },
  { key: "PREPARING", label: "Preparing", icon: ChefHat },
  { key: "READY", label: "Ready", icon: Bell },
  { key: "SERVED", label: "Served", icon: Utensils },
  { key: "COMPLETED", label: "Completed", icon: Sparkles },
];

const statusFlow: Record<string, string | null> = {
  PLACED: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
  SERVED: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

export interface OrderDetailModalProps {
  order: any | null;
  onClose: () => void;
  onAdvanceStatus?: (id: string) => void;
}

export function OrderDetailModal({ order, onClose, onAdvanceStatus }: OrderDetailModalProps) {
  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const items = Array.isArray(order.items)
    ? order.items
    : typeof order.items === "string"
    ? JSON.parse(order.items)
    : [];

  const elapsedMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "CANCELLED";

  const nextStatus = statusFlow[order.status];

  const getOrderTotal = () => {
    if (order.bill?.total) return order.bill.total;
    return items.reduce(
      (sum: number, item: any) => sum + (item.totalPrice || (item.unitPrice || 0) * (item.qty || 1)),
      0
    );
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-modal-title"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      >
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Sticky Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold text-foreground">
                {order.orderNumber}
              </span>
              <StatusBadge status={order.status} />
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {elapsedMinutes}m ago
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
            {/* Status Timeline Stepper */}
            <div className="bg-muted/30 border border-border/70 rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Order Timeline & Kitchen Progress
              </p>

              {isCancelled ? (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Order has been CANCELLED
                </div>
              ) : (
                <div className="overflow-x-auto pb-2">
                  <div className="flex items-center justify-between min-w-[500px]">
                    {statusSteps.map((step, idx) => {
                      const Icon = step.icon;
                      const isCompleted = currentStepIndex > idx;
                      const isActive = currentStepIndex === idx;

                      return (
                        <React.Fragment key={step.key}>
                          <div className="flex flex-col items-center gap-1.5 text-center">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all border-2",
                                isActive
                                  ? "bg-caramel text-espresso border-caramel shadow-md ring-4 ring-caramel/20 scale-110"
                                  : isCompleted
                                  ? "bg-espresso text-cream border-espresso"
                                  : "bg-muted text-muted-foreground border-border"
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={cn(
                                "text-[11px] font-medium",
                                isActive
                                  ? "font-bold text-caramel"
                                  : isCompleted
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              {step.label}
                            </span>
                          </div>

                          {idx < statusSteps.length - 1 && (
                            <div
                              className={cn(
                                "flex-1 h-0.5 mx-2 rounded transition-colors",
                                idx < currentStepIndex ? "bg-espresso" : "bg-border"
                              )}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Customer & Dining Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-card border border-border/80 p-4 rounded-xl">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Customer Information
                </p>
                <p className="font-bold text-sm text-foreground">
                  {order.user?.name || "Walk-in Guest"}
                </p>
                <p className="text-muted-foreground font-mono">{order.user?.phone || "No phone provided"}</p>
                <p className="text-muted-foreground">{order.user?.email || ""}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Order Details
                </p>
                <p className="font-semibold text-foreground">
                  Type: {order.type.replace("_", " ")}
                </p>
                <p className="text-muted-foreground">
                  {order.table?.number ? `Table Number: ${order.table.number}` : "Takeaway / Counter"}
                </p>
                <p className="text-muted-foreground">
                  Time: {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Itemized Order List ({items.length} items)
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 font-semibold text-muted-foreground text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((item: any, idx: number) => {
                      const addonsList = Array.isArray(item.addons)
                        ? item.addons.map((a: any) => (typeof a === "string" ? a : a.name))
                        : [];

                      return (
                        <tr key={idx}>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-foreground">{item.menuItemName || item.menuItemId}</p>
                            {item.variant && (
                              <p className="text-[11px] text-muted-foreground italic">Variant: {item.variant}</p>
                            )}
                            {addonsList.length > 0 && (
                              <p className="text-[10px] text-caramel">+ {addonsList.join(", ")}</p>
                            )}
                            {item.note && (
                              <p className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded mt-1 inline-block font-medium">
                                Kitchen Note: &quot;{item.note}&quot;
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">{item.qty || 1}</td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground font-mono">
                            {formatCurrency(item.unitPrice || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-foreground font-mono">
                            {formatCurrency(item.totalPrice || (item.unitPrice || 0) * (item.qty || 1))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* General Order Notes */}
            {order.notes && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl space-y-1 text-xs">
                <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  📝 Customer Special Instructions:
                </p>
                <p className="text-amber-800 dark:text-amber-300 italic pl-5">&quot;{order.notes}&quot;</p>
              </div>
            )}

            {/* Total Summary Strip */}
            <div className="flex justify-between items-center bg-muted/40 p-3 rounded-xl border border-border font-serif font-bold text-base">
              <span>Total Order Value:</span>
              <span className="text-caramel font-sans">{formatCurrency(getOrderTotal())}</span>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/40 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-muted border border-border rounded-xl text-xs font-semibold hover:bg-muted/80"
            >
              Close
            </button>

            {onAdvanceStatus && nextStatus && (
              <button
                onClick={() => {
                  onAdvanceStatus(order.id);
                  onClose();
                }}
                className="px-4 py-2 bg-espresso text-cream rounded-xl text-xs font-bold hover:bg-espresso-500 transition-colors flex items-center gap-2 shadow-sm"
              >
                Advance to {nextStatus.replace("_", " ")}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
