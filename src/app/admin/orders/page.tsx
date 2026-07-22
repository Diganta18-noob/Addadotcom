"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import { StatusBadge, SearchInput, EmptyState } from "@/components/shared";
import {
  Clock,
  ChevronRight,
  Bell,
  Filter,
  Volume2,
  UtensilsCrossed,
  Package,
  Truck,
  RefreshCw,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

interface OrderItem {
  menuItemName: string;
  qty: number;
  variant?: string;
  addons?: { name: string }[];
  note?: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  notes: string | null;
  tableId: string | null;
  table?: { number: number } | null;
  createdAt: string;
  bill?: any;
}

const statusFlow: Record<OrderStatus, OrderStatus | null> = {
  PLACED: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
  SERVED: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

const typeIcons: Record<OrderType, React.ReactNode> = {
  DINE_IN: <UtensilsCrossed className="w-3.5 h-3.5" />,
  TAKEAWAY: <Package className="w-3.5 h-3.5" />,
  DELIVERY: <Truck className="w-3.5 h-3.5" />,
};

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function getOrderTotal(order: OrderData): number {
  const items = order.items as any[];
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.qty || 0), 0);
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [filterType, setFilterType] = useState<OrderType | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"queue" | "kitchen">("queue");
  const [searchQuery, setSearchQuery] = useState("");

  const previousOrderIdsRef = React.useRef<Set<string>>(new Set());

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?today=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const parsed = data.data.map((order: any) => ({
          ...order,
          items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
        }));

        // Detect newly placed orders
        if (previousOrderIdsRef.current.size > 0) {
          const newOrders = parsed.filter((o: any) => !previousOrderIdsRef.current.has(o.id));
          if (newOrders.length > 0) {
            playChime();
            newOrders.forEach((n: any) => {
              toast.success(`🔔 NEW ORDER: ${n.orderNumber} (${n.type})!`, { duration: 6000 });
            });
          }
        }

        previousOrderIdsRef.current = new Set(parsed.map((o: any) => o.id));
        setOrders(parsed);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + smart real-time refresh (only when tab is visible)
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchOrders();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
    if (filterType !== "ALL" && o.type !== filterType) return false;
    if (searchQuery && !o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const advanceStatus = async (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const nextStatus = statusFlow[order.status];
    if (!nextStatus) return;

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
    );

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: order.status } : o))
        );
        toast.error("Failed to update order status");
        return;
      }
      toast.success(`Order ${order.orderNumber} → ${nextStatus.replace("_", " ")}`);
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: order.status } : o))
      );
      toast.error("Failed to update order status");
    }
  };

  const activeStatuses: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "READY"];
  const kitchenOrders = orders.filter((o) => activeStatuses.includes(o.status));

  const getTableNumber = (order: OrderData): number | null => {
    if (order.table?.number) return order.table.number;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("queue")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              viewMode === "queue" ? "bg-espresso text-cream" : "bg-muted hover:bg-muted/80"
            )}
          >
            Order Queue
          </button>
          <button
            onClick={() => setViewMode("kitchen")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              viewMode === "kitchen" ? "bg-espresso text-cream" : "bg-muted hover:bg-muted/80"
            )}
          >
            Kitchen Display
          </button>
          <Link
            href="/admin/history"
            className="px-4 py-2 bg-caramel text-espresso rounded-lg text-sm font-bold hover:bg-caramel-300 transition-all inline-flex items-center gap-1.5 shadow-sm"
          >
            View Full History →
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search orders..." className="w-48" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "ALL")}
            className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
          >
            <option value="ALL">All Status</option>
            <option value="PLACED">Placed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="SERVED">Served</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as OrderType | "ALL")}
            className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
          >
            <option value="ALL">All Types</option>
            <option value="DINE_IN">Dine-in</option>
            <option value="TAKEAWAY">Takeaway</option>
            <option value="DELIVERY">Delivery</option>
          </select>
          <button
            onClick={() => { setLoading(true); fetchOrders(); }}
            className="px-3 py-2 bg-muted border border-border rounded-lg text-sm hover:bg-muted/80 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-caramel" />
          <span className="ml-3 text-muted-foreground">Loading orders...</span>
        </div>
      ) : (
        <>
          {/* Kitchen Display Mode */}
          {viewMode === "kitchen" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeStatuses.map((status) => (
                <div key={status} className="space-y-3">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span>({kitchenOrders.filter((o) => o.status === status).length})</span>
                  </h3>
                  <AnimatePresence>
                    {kitchenOrders
                      .filter((o) => o.status === status)
                      .map((order) => (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="rounded-xl border-2 border-border bg-card p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {typeIcons[order.type]}
                              <span className="font-mono text-sm font-bold">{order.orderNumber}</span>
                            </div>
                            <span className={cn(
                              "text-xs font-bold px-2 py-1 rounded-full",
                              getElapsedMinutes(order.createdAt) > 20
                                ? "bg-red-100 text-red-700"
                                : getElapsedMinutes(order.createdAt) > 10
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                            )}>
                              {getElapsedMinutes(order.createdAt)}m
                            </span>
                          </div>

                          {getTableNumber(order) && (
                            <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                              Table {getTableNumber(order)}
                            </span>
                          )}

                          <div className="space-y-1.5">
                            {(order.items as OrderItem[]).map((item, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">{item.qty}× {item.menuItemName}</span>
                                {item.variant && <span className="text-xs text-muted-foreground ml-1">({item.variant})</span>}
                                {item.addons && item.addons.length > 0 && (
                                  <span className="text-xs text-caramel ml-1">+{item.addons.map((a) => a.name).join(", ")}</span>
                                )}
                                {item.note && <p className="text-xs text-amber-600 italic ml-4">&quot;{item.note}&quot;</p>}
                              </div>
                            ))}
                          </div>

                          {order.notes && (
                            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg italic">
                              📝 {order.notes}
                            </p>
                          )}

                          {statusFlow[order.status] && (
                            <button
                              onClick={() => advanceStatus(order.id)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-espresso text-cream rounded-lg text-sm font-semibold hover:bg-espresso-500 transition-all"
                            >
                              Mark {statusFlow[order.status]?.replace("_", " ")}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : (
            /* Queue View */
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <EmptyState title="No orders found" description={orders.length === 0 ? "Orders placed by customers will appear here" : "Try adjusting your filters"} />
              ) : (
                filteredOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 min-w-[120px]">
                      {typeIcons[order.type]}
                      <div>
                        <p className="font-mono text-sm font-bold">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.type.replace("_", " ")} {getTableNumber(order) ? `• T${getTableNumber(order)}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {(order.items as OrderItem[]).map((i) => `${i.qty}× ${i.menuItemName}`).join(", ")}
                      </p>
                      {order.notes && <p className="text-xs text-amber-600 truncate">📝 {order.notes}</p>}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {getElapsedMinutes(order.createdAt)}m ago
                    </div>

                    <span className="font-semibold text-sm">{formatCurrency(getOrderTotal(order))}</span>

                    <StatusBadge status={order.status} />

                    {statusFlow[order.status] && (
                      <button
                        onClick={() => advanceStatus(order.id)}
                        className="px-3 py-1.5 bg-espresso text-cream rounded-lg text-xs font-medium hover:bg-espresso-500 transition-colors whitespace-nowrap"
                      >
                        → {statusFlow[order.status]?.replace("_", " ")}
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
