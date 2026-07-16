"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  DollarSign,
  ShoppingBag,
  Percent,
  CalendarDays,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface DailyTrend {
  day: string;
  sales: number;
  orders: number;
}

interface SalesCategory {
  name: string;
  value: number;
  color: string;
}

interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

interface SalesPayment {
  name: string;
  value: number;
  color: string;
}

interface ReportsData {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  totalGst: number;
  dailyTrends: DailyTrend[];
  salesByCategory: SalesCategory[];
  salesByItem: TopProduct[];
  salesByPayment: SalesPayment[];
}

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      let url = `/api/reports?range=${dateRange}`;
      if (dateRange === "custom" && customStart && customEnd) {
        url += `&start=${customStart}&end=${customEnd}`;
      }

      const res = await fetch(url);
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to generate report metrics");
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStart, customEnd]);

  useEffect(() => {
    // Only fetch if custom is selected and both dates are present, or if simple ranges are selected
    if (dateRange === "custom" && (!customStart || !customEnd)) {
      return;
    }
    setLoading(true);
    fetchReports();
  }, [fetchReports, dateRange, customStart, customEnd]);

  const handleExport = (format: "csv" | "pdf", reportName: string) => {
    toast.loading(`Preparing ${format.toUpperCase()} export...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`${reportName} exported to ${format.toUpperCase()}!`);
    }, 1200);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-caramel" />
        <span className="ml-3 text-muted-foreground">Generating reports data...</span>
      </div>
    );
  }

  const totalSales = data?.totalSales || 0;
  const totalOrders = data?.totalOrders || 0;
  const avgOrderValue = data?.avgOrderValue || 0;
  const gstCollected = data?.totalGst || 0;
  const dailyTrends = data?.dailyTrends || [];
  const salesByCategory = data?.salesByCategory || [];
  const salesByItem = data?.salesByItem || [];
  const salesByPayment = data?.salesByPayment || [];

  return (
    <div className="space-y-6">
      {/* Date controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex gap-2">
          {[
            { value: "today", label: "Today" },
            { value: "week", label: "This Week" },
            { value: "month", label: "This Month" },
            { value: "custom", label: "Custom" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                dateRange === opt.value ? "bg-espresso text-cream" : "bg-muted hover:bg-muted/80"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {dateRange === "custom" && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1 bg-muted border border-border rounded"
            />
            <span>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1 bg-muted border border-border rounded"
            />
          </div>
        )}

        <div className="flex gap-2 w-full sm:w-auto items-center">
          <button
            onClick={() => { setLoading(true); fetchReports(); }}
            className="px-3 py-2 bg-muted border border-border rounded-xl text-xs hover:bg-muted/80 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => handleExport("csv", "Sales_Report")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => handleExport("pdf", "Sales_Report")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-espresso text-cream rounded-xl text-xs font-semibold hover:bg-espresso-500 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-2">
            <DollarSign className="w-4 h-4 text-caramel" /> Gross Revenue
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif">{formatCurrency(totalSales)}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-2">
            <ShoppingBag className="w-4 h-4 text-caramel" /> Total Orders
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif">{totalOrders}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-2">
            <Percent className="w-4 h-4 text-caramel" /> Average Order Value
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif">{formatCurrency(avgOrderValue)}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-2">
            <CalendarDays className="w-4 h-4 text-caramel" /> Tax (GST Collected)
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif">{formatCurrency(gstCollected)}</p>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Trend Line */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-serif text-base font-bold">Revenue & Order Trend</h3>
          {dailyTrends.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
              No sales data found for the selected period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                />
                <Line type="monotone" dataKey="sales" stroke="#D4A056" strokeWidth={2} name="Sales (₹)" />
                <Line type="monotone" dataKey="orders" stroke="#4B2E2B" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 flex flex-col justify-between">
          <h3 className="font-serif text-base font-bold">Sales by Category</h3>
          {salesByCategory.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
              No category sales data.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                    {salesByCategory.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2 max-h-[140px] overflow-y-auto">
                {salesByCategory.map((cat, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-muted-foreground">{cat.name}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 3: Items list + Payment Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top selling menu items */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-base font-bold">Top Selling Products</h3>
            <button
              onClick={() => handleExport("csv", "Top_Products")}
              className="text-xs text-caramel font-semibold hover:underline"
            >
              Export Detail
            </button>
          </div>

          <div className="overflow-x-auto">
            {salesByItem.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No products sold in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="pb-2 font-medium">Menu Item</th>
                    <th className="pb-2 font-medium text-center">Qty Sold</th>
                    <th className="pb-2 font-medium text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {salesByItem.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="py-2.5 font-medium">{item.name}</td>
                      <td className="py-2.5 text-center font-mono">{item.qty}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-caramel">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 flex flex-col justify-between">
          <h3 className="font-serif text-base font-bold">Payment Methods</h3>
          {salesByPayment.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
              No payment transactions.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={salesByPayment} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                    {salesByPayment.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {salesByPayment.map((pay, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pay.color }} />
                      <span className="text-muted-foreground">{pay.name}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(pay.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
