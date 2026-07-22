"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  X,
  CreditCard,
  User,
  MapPin,
  Clock,
} from "lucide-react";
import { cn, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
import toast from "react-hot-toast";


interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  status: string;
  type: string;
  items: any[];
  subtotal: number;
  total: number;
  customer: { id: string; name: string; email: string; phone: string } | null;
  tableNumber: number | null;
  tableZone: string | null;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}



export default function AdminOrderHistoryPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [datePreset, setDatePreset] = useState("30days"); // today, yesterday, 7days, 30days, month, year, custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  // Invoice Modal State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Compute date range parameters
  const getDateRangeParams = useCallback(() => {
    const now = new Date();
    let from: string | null = null;
    let to: string | null = null;

    if (datePreset === "today") {
      from = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      to = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    } else if (datePreset === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      from = new Date(y.setHours(0, 0, 0, 0)).toISOString();
      to = new Date(y.setHours(23, 59, 59, 999)).toISOString();
    } else if (datePreset === "7days") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (datePreset === "30days") {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (datePreset === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else if (datePreset === "year") {
      from = new Date(now.getFullYear(), 0, 1).toISOString();
    } else if (datePreset === "custom" && startDate && endDate) {
      from = new Date(startDate).toISOString();
      to = new Date(endDate).toISOString();
    }

    return { from, to };
  }, [datePreset, startDate, endDate]);

  // Fetch Order History
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = getDateRangeParams();
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "15");
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (paymentStatusFilter !== "ALL") params.set("paymentStatus", paymentStatusFilter);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(`/api/orders/history?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.pages || 1);
        setTotalOrders(data.data.pagination.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch order history:", error);
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, paymentStatusFilter, typeFilter, getDateRangeParams]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Open Invoice Modal
  const openInvoiceModal = (orderId: string) => {
    setSelectedOrderId(orderId);
  };


  // CSV Export Trigger
  const handleExportCSV = () => {
    const { from, to } = getDateRangeParams();
    let url = `/api/orders/export?format=csv`;
    if (from) url += `&from=${encodeURIComponent(from)}`;
    if (to) url += `&to=${encodeURIComponent(to)}`;
    if (statusFilter !== "ALL") url += `&status=${statusFilter}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Header (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-serif text-2xl font-bold">Permanent Order History</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and review all historic cafe orders ({totalOrders} total records)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-caramel text-espresso rounded-xl text-xs font-bold hover:bg-caramel-300 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar (hidden on print) */}
      <div className="bg-card border border-border p-4 rounded-2xl space-y-4 shadow-sm print:hidden">
        {/* Top Controls: Search + Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Invoice #, Customer, Phone, or Table..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-caramel/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7days", label: "Last 7 Days" },
              { id: "30days", label: "Last 30 Days" },
              { id: "month", label: "This Month" },
              { id: "year", label: "This Year" },
              { id: "custom", label: "Custom" },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setDatePreset(preset.id);
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  datePreset === preset.id
                    ? "bg-caramel text-espresso font-bold"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/60 pt-3 text-xs">
          {datePreset === "custom" && (
            <>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PLACED">Placed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Order Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg"
            >
              <option value="ALL">All Types</option>
              <option value="DINE_IN">Dine-In</option>
              <option value="TAKEAWAY">Takeaway</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table (Desktop) / Cards (Mobile) */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden print:hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-caramel" />
            <p className="text-sm font-semibold text-muted-foreground">Loading Order History...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-serif text-lg font-bold">No Orders Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No orders matched your active filters or date range. Try clearing search filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice / Order #</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Customer / Table</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => openInvoiceModal(o.id)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-bold text-foreground">{o.invoiceNumber}</div>
                        <div className="text-[10px] text-muted-foreground">{o.orderNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <div>{formatDate(o.createdAt)}</div>
                        <div className="text-[10px]">{formatTime(o.createdAt)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{o.customer?.name || "Guest"}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {o.tableNumber ? `Table ${o.tableNumber}` : o.customer?.phone || "Takeaway"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-muted-foreground">
                        {Array.isArray(o.items)
                          ? o.items.map((i) => `${i.qty || 1}× ${i.menuItemName || i.menuItemId}`).join(", ")
                          : "Order items"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground">
                          {o.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-foreground">
                        {formatCurrency(o.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold",
                            o.paymentStatus === "PAID"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {o.paymentStatus} ({o.paymentMethod})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInvoiceModal(o.id);
                          }}
                          className="px-2.5 py-1 bg-caramel/10 text-caramel rounded-lg font-bold hover:bg-caramel/20 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs">
              <span className="text-muted-foreground">
                Showing Page <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{totalPages}</strong> ({totalOrders} orders)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}

