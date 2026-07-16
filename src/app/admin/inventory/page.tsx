"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchInput, EmptyState } from "@/components/shared";
import {
  Package,
  Plus,
  Minus,
  Edit,
  Trash2,
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  lowStockThreshold: number;
}

interface StockLog {
  id: string;
  itemName: string;
  change: number;
  reason: string;
  createdAt: string;
}

const initialInventory: InventoryItem[] = [
  { id: "i1", name: "Coffee Beans (Arabica)", unit: "kg", quantity: 18.5, lowStockThreshold: 5.0 },
  { id: "i2", name: "Whole Milk", unit: "Liters", quantity: 4.2, lowStockThreshold: 10.0 },
  { id: "i3", name: "Almond Milk", unit: "Liters", quantity: 12.0, lowStockThreshold: 5.0 },
  { id: "i4", name: "Chocolate Sauce", unit: "kg", quantity: 2.1, lowStockThreshold: 3.0 },
  { id: "i5", name: "Brioche Bread", unit: "Loaves", quantity: 15.0, lowStockThreshold: 8.0 },
  { id: "i6", name: "Avocado", unit: "pcs", quantity: 8.0, lowStockThreshold: 15.0 },
];

const initialLogs: StockLog[] = [
  { id: "l1", itemName: "Whole Milk", change: -2.0, reason: "Daily usage deduction", createdAt: new Date().toISOString() },
  { id: "l2", itemName: "Coffee Beans (Arabica)", change: 10.0, reason: "Stock purchase replenishment", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "l3", itemName: "Brioche Bread", change: -4.0, reason: "French Toast prep", createdAt: new Date(Date.now() - 7200000).toISOString() },
];

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [logs, setLogs] = useState<StockLog[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("Manual adjustment");

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem || !adjustQty) return;

    const delta = parseFloat(adjustQty);
    if (isNaN(delta)) {
      toast.error("Please enter a valid quantity");
      return;
    }

    // Update item stock
    setInventory((prev) =>
      prev.map((item) =>
        item.id === adjustItem.id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );

    // Add Stock Log
    const newLog: StockLog = {
      id: String(Date.now()),
      itemName: adjustItem.name,
      change: delta,
      reason: adjustReason,
      createdAt: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);

    toast.success(`Inventory updated for ${adjustItem.name}`);
    setIsAdjusting(false);
    setAdjustItem(null);
    setAdjustQty("");
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isLow = item.quantity <= item.lowStockThreshold;
    if (filterLowStock) return matchesSearch && isLow;
    return matchesSearch;
  });

  const lowStockCount = inventory.filter((item) => item.quantity <= item.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      {/* Top statistics summary banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-espresso/5 flex items-center justify-center text-espresso dark:text-caramel">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Ingredients</p>
            <p className="text-2xl font-bold font-serif">{inventory.length}</p>
          </div>
        </div>

        <div className={cn(
          "rounded-2xl border p-5 flex items-center gap-4 transition-all",
          lowStockCount > 0
            ? "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900"
            : "border-border bg-card"
        )}>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            lowStockCount > 0 ? "bg-red-100 text-red-600 dark:bg-red-900" : "bg-muted text-muted-foreground"
          )}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Low Stock Alerts</p>
            <p className={cn("text-2xl font-bold font-serif", lowStockCount > 0 && "text-red-600 dark:text-red-400")}>
              {lowStockCount}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-espresso/5 flex items-center justify-center text-espresso dark:text-caramel">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stock Updates Today</p>
            <p className="text-2xl font-bold font-serif">{logs.length}</p>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search stock list..."
          className="w-full sm:max-w-xs"
        />

        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2",
            filterLowStock
              ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/30"
              : "border-border hover:bg-muted"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          Show Low Stock Only
        </button>
      </div>

      {/* Content layout - two columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ingredients List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-serif text-lg font-bold">Inventory Stock Levels</h3>
          {filteredItems.length === 0 ? (
            <EmptyState title="No items found" description="Try clearing your filters or search." />
          ) : (
            <div className="grid gap-3">
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.lowStockThreshold;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border bg-card transition-all hover:shadow-sm",
                      isLow ? "border-red-200 bg-red-50/20 dark:border-red-950" : "border-border"
                    )}
                  >
                    <div>
                      <h4 className="font-medium text-sm sm:text-base flex items-center gap-2">
                        {item.name}
                        {isLow && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase">
                            <AlertTriangle className="w-3 h-3" /> Low
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Threshold: {item.lowStockThreshold} {item.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm sm:text-base font-bold">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={() => {
                          setAdjustItem(item);
                          setIsAdjusting(true);
                        }}
                        className="px-3 py-1.5 bg-espresso text-cream rounded-lg text-xs font-semibold hover:bg-espresso-500 transition-colors"
                      >
                        Adjust
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold">Recent Stock Updates</h3>
          <div className="rounded-xl border border-border bg-card p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-3 text-xs border-b border-border pb-3 last:border-b-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="font-semibold">{log.itemName}</p>
                  <p className="text-muted-foreground">{log.reason}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className={cn(
                  "font-mono font-bold flex items-center gap-0.5 px-2 py-0.5 rounded",
                  log.change >= 0
                    ? "bg-green-100 text-green-700 dark:bg-green-950/30"
                    : "bg-red-100 text-red-700 dark:bg-red-950/30"
                )}>
                  {log.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {log.change >= 0 ? `+${log.change}` : log.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adjust Stock Dialog */}
      <AnimatePresence>
        {isAdjusting && adjustItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdjusting(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md bg-background p-6 rounded-2xl shadow-xl flex flex-col"
            >
              <h3 className="font-serif text-xl font-bold mb-2">Adjust Stock level</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Updating stock for <span className="font-bold text-foreground">{adjustItem.name}</span>
              </p>

              <form onSubmit={handleAdjustStock} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">
                    Adjustment Quantity ({adjustItem.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="E.g. +10 (Add) or -5 (Deduct)"
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Current stock level: {adjustItem.quantity} {adjustItem.unit}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Reason *</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                  >
                    <option value="Manual adjustment">Manual correction</option>
                    <option value="Stock purchase replenishment">Stock Purchase / Delivery</option>
                    <option value="Daily usage deduction">Daily Production usage</option>
                    <option value="Wastage / Spoilage">Wastage / Spoilage</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAdjusting(false)}
                    className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors"
                  >
                    Save Adjustment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
