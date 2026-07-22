"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchInput, EmptyState } from "@/components/shared";
import {
  Package,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Loader2,
  FileSpreadsheet,
  Download,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface StockLog {
  id: string;
  change: number;
  reason: string;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  lowStockThreshold: number;
  stockLogs?: StockLog[];
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Stock Adjustment State
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("Manual adjustment");
  const [adjusting, setAdjusting] = useState(false);

  // Add Ingredient State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("kg");
  const [newQuantity, setNewQuantity] = useState("10");
  const [newThreshold, setNewThreshold] = useState("2");
  const [adding, setAdding] = useState(false);

  // Bulk Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");

  // Fetch inventory from API
  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, [fetchInventory]);

  // Collect all stock logs from all items for the activity feed
  const allLogs = inventory
    .flatMap((item) =>
      (item.stockLogs || []).map((log) => ({
        ...log,
        itemName: item.name,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  // Handle Add Ingredient
  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Ingredient name is required");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          unit: newUnit,
          quantity: parseFloat(newQuantity) || 0,
          lowStockThreshold: parseFloat(newThreshold) || 0,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message || "Failed to add ingredient");
        return;
      }

      toast.success(`Ingredient "${newName}" added to inventory`);
      setIsAdding(false);
      setNewName("");
      setNewQuantity("10");
      setNewThreshold("2");
      fetchInventory();
    } catch {
      toast.error("Error adding ingredient");
    } finally {
      setAdding(false);
    }
  };

  // Handle Delete Ingredient
  const handleDeleteIngredient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Deleted "${name}"`);
        setInventory((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(data.error?.message || "Failed to delete item");
      }
    } catch {
      toast.error("Error deleting ingredient");
    }
  };

  // Handle Stock Adjustment
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem || !adjustQty) return;

    const delta = parseFloat(adjustQty);
    if (isNaN(delta)) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setAdjusting(true);

    try {
      const res = await fetch(`/api/inventory/${adjustItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change: delta, reason: adjustReason }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message || "Failed to update inventory");
        return;
      }

      toast.success(`Inventory updated for ${adjustItem.name}`);
      setIsAdjusting(false);
      setAdjustItem(null);
      setAdjustQty("");
      fetchInventory();
    } catch {
      toast.error("Failed to update inventory");
    } finally {
      setAdjusting(false);
    }
  };

  // Handle CSV Import
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress("Reading CSV file...");

    try {
      const text = await file.text();
      const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

      // Skip header if present
      const hasHeader = lines[0].toLowerCase().includes("name");
      const dataRows = hasHeader ? lines.slice(1) : lines;

      let successCount = 0;
      for (let i = 0; i < dataRows.length; i++) {
        const parts = dataRows[i].split(",").map((p) => p.trim());
        if (parts.length >= 2) {
          const [name, unit, quantity, threshold] = parts;
          setImportProgress(`Importing item ${i + 1} of ${dataRows.length}: ${name}...`);

          try {
            await fetch("/api/inventory", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                unit: unit || "kg",
                quantity: parseFloat(quantity) || 0,
                lowStockThreshold: parseFloat(threshold) || 0,
              }),
            });
            successCount++;
          } catch (err) {
            console.error(`Failed to import line ${i + 1}:`, err);
          }
        }
      }

      toast.success(`Successfully imported ${successCount} ingredients!`);
      setIsImporting(false);
      fetchInventory();
    } catch (err) {
      toast.error("Error reading CSV file");
    } finally {
      setImporting(false);
      setImportProgress("");
      e.target.value = "";
    }
  };

  // Download Sample CSV Template
  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Unit,Quantity,LowStockThreshold\nAlmond Milk,liters,12,3\nDark Roast Beans,kg,15,4\nCinnamon Powder,grams,300,50\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_inventory_import.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isLow = item.quantity <= item.lowStockThreshold;
    if (filterLowStock) return matchesSearch && isLow;
    return matchesSearch;
  });

  const lowStockCount = inventory.filter((item) => item.quantity <= item.lowStockThreshold).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-caramel" />
        <span className="ml-3 text-muted-foreground">Loading inventory...</span>
      </div>
    );
  }

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
            <p className="text-sm text-muted-foreground">Recent Stock Updates</p>
            <p className="text-2xl font-bold font-serif">{allLogs.length}</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search stock list..."
          className="w-full sm:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-espresso text-cream rounded-xl text-xs font-bold hover:bg-espresso-500 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Ingredient
          </button>

          <button
            onClick={() => setIsImporting(true)}
            className="px-3.5 py-2 bg-caramel/10 text-caramel border border-caramel/30 rounded-xl text-xs font-bold hover:bg-caramel/20 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import CSV
          </button>

          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5",
              filterLowStock
                ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/30 font-bold"
                : "border-border hover:bg-muted"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock Only
          </button>

          <button
            onClick={() => { setLoading(true); fetchInventory(); }}
            className="p-2 bg-muted border border-border rounded-xl text-sm hover:bg-muted/80 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Content layout - two columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ingredients List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-serif text-lg font-bold">Inventory Stock Levels ({filteredItems.length})</h3>
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

                    <div className="flex items-center gap-3">
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
                      <button
                        onClick={() => handleDeleteIngredient(item.id, item.name)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Delete ingredient"
                      >
                        <Trash2 className="w-4 h-4" />
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
          <div className="rounded-xl border border-border bg-card p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            {allLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No stock updates yet</p>
            ) : (
              allLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-3 text-xs border-b border-border pb-3 last:border-b-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="font-semibold">{log.itemName}</p>
                    <p className="text-muted-foreground">{log.reason}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Ingredient Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md bg-background p-6 rounded-2xl shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-serif text-xl font-bold">Add New Ingredient</h3>
                <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddIngredient} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Ingredient Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="E.g. Espresso Beans, Whole Milk"
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Measurement Unit *</label>
                    <select
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    >
                      <option value="kg">kg (Kilograms)</option>
                      <option value="liters">liters (L)</option>
                      <option value="pieces">pieces (Pcs)</option>
                      <option value="grams">grams (g)</option>
                      <option value="ml">ml (Milliliters)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block">Initial Quantity *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Low Stock Alert Threshold *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    placeholder="Alert when stock falls below this"
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 px-4 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {adding && <Loader2 className="w-4 h-4 animate-spin" />}
                    Add Ingredient
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSV Bulk Import Modal */}
      <AnimatePresence>
        {isImporting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !importing && setIsImporting(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md bg-background p-6 rounded-2xl shadow-xl space-y-4 text-center"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-caramel" /> Bulk Import Inventory
                </h3>
                <button onClick={() => !importing && setIsImporting(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Upload a <code>.csv</code> file formatted as: <br />
                <code className="bg-muted px-2 py-1 rounded text-[11px] block mt-1">Name, Unit, Quantity, LowStockThreshold</code>
              </p>

              <div className="border-2 border-dashed border-border p-6 rounded-xl space-y-3 bg-muted/20 hover:border-caramel transition-colors relative">
                <Upload className="w-8 h-8 mx-auto text-caramel" />
                <p className="text-xs font-semibold">Choose CSV File to Upload</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={importing}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {importProgress && (
                <p className="text-xs font-mono font-semibold text-caramel flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> {importProgress}
                </p>
              )}

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="text-xs text-caramel font-semibold hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
                <button
                  type="button"
                  onClick={() => setIsImporting(false)}
                  disabled={importing}
                  className="px-4 py-2 bg-muted border border-border rounded-xl text-xs font-semibold hover:bg-muted/80"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adjust Stock Dialog */}
      <AnimatePresence>
        {isAdjusting && adjustItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdjusting(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md bg-background p-6 rounded-2xl shadow-xl flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-serif text-xl font-bold">Adjust Stock Level</h3>
                <button onClick={() => setIsAdjusting(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
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
                    disabled={adjusting}
                    className="flex-1 px-4 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {adjusting && <Loader2 className="w-4 h-4 animate-spin" />}
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
