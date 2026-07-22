"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSSE } from "@/lib/useSSE";
import { cn, formatTime } from "@/lib/utils";
import {
  ChefHat,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Utensils,
  Maximize2,
  Minimize2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";

interface OrderItem {
  menuItemName?: string;
  name?: string;
  qty: number;
  variant?: string;
  note?: string;
}

interface KDSOrder {
  id: string;
  orderNumber: string;
  type: string;
  status: OrderStatus;
  items: OrderItem[];
  notes?: string | null;
  table?: { number: number } | null;
  createdAt: string;
}

const statusNext: Record<OrderStatus, OrderStatus | null> = {
  PLACED: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
  SERVED: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

function getElapsedMins(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

export default function KitchenKDSPage() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  const fetchKitchenOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?today=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const parsed = data.data.map((o: any) => ({
          ...o,
          items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
        }));
        setOrders(parsed);
      }
    } catch (err) {
      console.error("Failed to fetch KDS orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time SSE subscriber
  useSSE({
    "new-order": (data) => {
      fetchKitchenOrders();
      playChime();
      toast.success(`🔔 NEW KITCHEN TICKET: ${data.orderNumber}`, { duration: 6000 });
    },
    "order-updated": () => {
      fetchKitchenOrders();
    },
  });

  useEffect(() => {
    fetchKitchenOrders();
  }, [fetchKitchenOrders]);

  const handleAdvanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const next = statusNext[currentStatus];
    if (!next) return;

    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: next } : o)));

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: currentStatus } : o)));
        toast.error("Failed to advance order status");
      }
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: currentStatus } : o)));
      toast.error("Error updating order status");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  };

  // Filter active tickets (exclude completed and cancelled)
  const activeOrders = orders.filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED");

  // Aggregated top pending items
  const itemAggregator: Record<string, number> = {};
  activeOrders.forEach((o) => {
    if (Array.isArray(o.items)) {
      o.items.forEach((item) => {
        const name = item.menuItemName || item.name || "Item";
        itemAggregator[name] = (itemAggregator[name] || 0) + (item.qty || 1);
      });
    }
  });

  const columns: { title: string; statuses: OrderStatus[]; color: string; bg: string }[] = [
    { title: "NEW TICKETS", statuses: ["PLACED"], color: "text-red-400 border-red-500/40", bg: "bg-red-950/20" },
    { title: "IN PREPARATION", statuses: ["ACCEPTED", "PREPARING"], color: "text-amber-400 border-amber-500/40", bg: "bg-amber-950/20" },
    { title: "READY FOR PICKUP", statuses: ["READY"], color: "text-emerald-400 border-emerald-500/40", bg: "bg-emerald-950/20" },
    { title: "SERVED", statuses: ["SERVED"], color: "text-blue-400 border-blue-500/40", bg: "bg-blue-950/20" },
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-caramel mx-auto" />
        <p className="font-serif font-bold text-lg text-foreground">Initializing Kitchen Display Station...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-caramel/20 border border-caramel/40 flex items-center justify-center text-caramel">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight">KDS Kitchen Station Display</h1>
            <p className="text-xs text-neutral-400">
              Live order tickets • {activeOrders.length} Active Tickets pending
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
              soundEnabled
                ? "bg-caramel text-espresso border-caramel shadow-sm"
                : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
            )}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Chime {soundEnabled ? "ON" : "OFF"}
          </button>

          <button
            onClick={toggleFullscreen}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Aggregated Item Summary Strip */}
      {Object.keys(itemAggregator).length > 0 && (
        <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl text-white space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-caramel flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5" /> Kitchen Item Aggregator (Pending Total)
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(itemAggregator).map(([itemName, count]) => (
              <span
                key={itemName}
                className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-bold text-neutral-200 flex items-center gap-1.5"
              >
                <span className="w-5 h-5 rounded-full bg-caramel text-espresso text-[11px] font-black flex items-center justify-center">
                  {count}
                </span>
                {itemName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4-Column KDS Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colOrders = activeOrders.filter((o) => col.statuses.includes(o.status));

          return (
            <div key={col.title} className={cn("rounded-2xl border p-4 space-y-4 min-h-[500px]", col.color, col.bg)}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif font-bold text-sm tracking-wider uppercase">{col.title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-black/30 font-mono text-xs font-bold">
                  {colOrders.length}
                </span>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {colOrders.map((order) => {
                    const elapsed = getElapsedMins(order.createdAt);
                    const isUrgent = elapsed >= 20;
                    const isWarning = elapsed >= 10 && elapsed < 20;

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "bg-card border-2 rounded-2xl p-4 space-y-3 shadow-lg text-foreground transition-all relative overflow-hidden",
                          isUrgent
                            ? "border-red-500 bg-red-950/30 animate-pulse"
                            : isWarning
                            ? "border-amber-500/80 bg-amber-950/20"
                            : "border-border hover:border-caramel/50"
                        )}
                      >
                        {/* Header info */}
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <div>
                            <span className="font-mono font-black text-lg text-foreground block">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              {order.type.replace("_", " ")} {order.table?.number ? `• T${order.table.number}` : ""}
                            </span>
                          </div>

                          <div
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 font-mono",
                              isUrgent
                                ? "bg-red-500 text-white"
                                : isWarning
                                ? "bg-amber-500 text-black"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {elapsed}m
                          </div>
                        </div>

                        {/* Itemized list */}
                        <div className="space-y-1.5 py-1">
                          {Array.isArray(order.items) &&
                            order.items.map((item, idx) => (
                              <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                                <span className="font-bold text-sm text-foreground">
                                  {item.qty}× {item.menuItemName || item.name}
                                </span>
                                {item.variant && (
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                    {item.variant}
                                  </span>
                                )}
                              </div>
                            ))}

                          {order.notes && (
                            <p className="text-[11px] font-semibold text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                              Note: {order.notes}
                            </p>
                          )}
                        </div>

                        {/* Action advance button */}
                        {statusNext[order.status] && (
                          <button
                            onClick={() => handleAdvanceStatus(order.id, order.status)}
                            className="w-full py-2.5 bg-espresso text-cream font-bold text-xs rounded-xl hover:bg-espresso-500 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            Advance to {statusNext[order.status]?.replace("_", " ")} <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
