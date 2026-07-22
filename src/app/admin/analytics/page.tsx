"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Percent,
  Calendar,
  Clock,
  Award,
  RefreshCw,
  Loader2,
  Download,
  Users,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
    avgOrderValue: number;
    refundRate: number;
    cancellationRate: number;
    peakHour: string;
    busiestDay: string;
    mostPopularCategory: string;
  };
  peakHours: { hour: string; hourNumber: number; count: number }[];
  busiestDays: { day: string; dayCode: string; dow: number; count: number }[];
  salesByCategory: { name: string; value: number; color: string }[];
  mostSellingItems: { name: string; qty: number; revenue: number }[];
  leastSellingItems: { name: string; qty: number; revenue: number }[];
  salesByPayment: { name: string; value: number; color: string }[];
}

interface MonthlyData {
  year: number;
  months: {
    monthIndex: number;
    month: string;
    monthShort: string;
    orders: number;
    revenue: number;
    customers: number;
    avgBill: number;
    topItem: string;
  }[];
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("month");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Analytics & Monthly Data
  const fetchAnalytics = useCallback(async () => {
    try {
      const [analyticsRes, monthlyRes] = await Promise.all([
        fetch(`/api/orders/analytics?range=${range}`),
        fetch(`/api/orders/monthly?year=${targetYear}`),
      ]);

      const analyticsJson = await analyticsRes.json();
      const monthlyJson = await monthlyRes.json();

      if (analyticsJson.success) setAnalytics(analyticsJson.data);
      if (monthlyJson.success) setMonthly(monthlyJson.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load business analytics");
    } finally {
      setLoading(false);
    }
  }, [range, targetYear]);

  useEffect(() => {
    fetchAnalytics();
    // 30s auto-refresh
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading || !analytics || !monthly) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-caramel" />
        <p className="text-sm font-semibold text-muted-foreground">Calculating POS Business Analytics...</p>
      </div>
    );
  }

  const { summary } = analytics;

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Business Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Multi-dimensional POS metrics, peak hours heatmap, and revenue breakdown
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Preset Range Selector */}
          <div className="bg-card border border-border p-1 rounded-xl flex items-center gap-1 text-xs">
            {[
              { id: "today", label: "Today" },
              { id: "week", label: "7 Days" },
              { id: "month", label: "This Month" },
              { id: "year", label: "This Year" },
              { id: "all", label: "All Time" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setRange(p.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium transition-all",
                  range === p.id ? "bg-caramel text-espresso font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", val: formatCurrency(summary.totalRevenue), icon: DollarSign, sub: "Paid bills total" },
          { label: "Total Orders", val: summary.totalOrders.toString(), icon: ShoppingBag, sub: `${summary.completedOrders} completed` },
          { label: "Avg Order Value", val: formatCurrency(summary.avgOrderValue), icon: TrendingUp, sub: "Per bill average" },
          { label: "Refund Rate", val: `${summary.refundRate}%`, icon: Percent, sub: `${summary.refundedOrders} refunded` },
          { label: "Cancellation Rate", val: `${summary.cancellationRate}%`, icon: AlertCircle, sub: `${summary.cancelledOrders} cancelled` },
          { label: "Peak Operating Hour", val: summary.peakHour, icon: Clock, sub: "Highest order velocity" },
          { label: "Busiest Day", val: summary.busiestDay, icon: Calendar, sub: "Top order volume day" },
          { label: "Top Category", val: summary.mostPopularCategory, icon: Award, sub: "Most revenue generated" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-card border border-border p-4 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-caramel" />
            </div>
            <div className="font-serif text-xl font-bold text-foreground">{kpi.val}</div>
            <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid Row 1: Line Chart & Monthly Bar Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Trend Line Chart */}
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
          <div>
            <h3 className="font-serif text-base font-bold">Revenue & Order Volume Trend</h3>
            <p className="text-xs text-muted-foreground">Daily sales performance over selected timeframe</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly.months}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="monthShort" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#D4A056" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Sales Bar Chart */}
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold">Monthly Revenue (Jan – Dec)</h3>
              <p className="text-xs text-muted-foreground">Comparative monthly breakdown for {targetYear}</p>
            </div>
            <select
              value={targetYear}
              onChange={(e) => setTargetYear(parseInt(e.target.value))}
              className="px-2.5 py-1 bg-muted border border-border rounded-lg text-xs"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly.months}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="monthShort" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#4B2E2B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Category Pie Chart, Payment Donut, Area Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart 3: Category Pie Chart */}
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
          <div>
            <h3 className="font-serif text-base font-bold">Sales by Category</h3>
            <p className="text-xs text-muted-foreground">Revenue share per menu category</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.salesByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {analytics.salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Payment Methods Donut Chart */}
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
          <div>
            <h3 className="font-serif text-base font-bold">Payment Methods</h3>
            <p className="text-xs text-muted-foreground">Cash vs Card vs UPI transactions</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.salesByPayment}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {analytics.salesByPayment.map((entry, index) => (
                    <Cell key={`cell-pay-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Daily Revenue Fill Area Chart */}
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
          <div>
            <h3 className="font-serif text-base font-bold">Daily Orders Volume</h3>
            <p className="text-xs text-muted-foreground">Order frequency per month</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly.months}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="monthShort" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip />
                <Area type="monotone" dataKey="orders" stroke="#8BA888" fill="#8BA888" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 6: Peak Operating Hours Heatmap (24 hours x count) */}
      <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
        <div>
          <h3 className="font-serif text-base font-bold">Hourly Peak Hours Heatmap</h3>
          <p className="text-xs text-muted-foreground">Order concentration across 24 operating hours</p>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1.5 pt-2">
          {analytics.peakHours.map((slot) => {
            const maxCount = Math.max(...analytics.peakHours.map((p) => p.count), 1);
            const intensity = slot.count > 0 ? Math.max(0.15, slot.count / maxCount) : 0.05;

            return (
              <div key={slot.hour} className="flex flex-col items-center gap-1 group relative">
                <div
                  style={{ opacity: intensity }}
                  className="w-full h-12 rounded-lg bg-caramel border border-caramel-300 transition-transform group-hover:scale-110"
                />
                <span className="text-[9px] text-muted-foreground font-mono">{slot.hourNumber}h</span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-espresso text-cream text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap z-20">
                  {slot.hour}: {slot.count} orders
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Leaderboards (Top vs Least Selling) */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl space-y-3 shadow-sm">
          <h3 className="font-serif text-base font-bold text-emerald-600 dark:text-emerald-400">🔥 Top 5 Selling Products</h3>
          <div className="divide-y divide-border/60">
            {analytics.mostSellingItems.map((item, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold">{i + 1}. {item.name}</span>
                <span className="text-muted-foreground">{item.qty} units ({formatCurrency(item.revenue)})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl space-y-3 shadow-sm">
          <h3 className="font-serif text-base font-bold text-amber-600 dark:text-amber-400">⚠️ Least Selling Items</h3>
          <div className="divide-y divide-border/60">
            {analytics.leastSellingItems.map((item, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold">{i + 1}. {item.name}</span>
                <span className="text-muted-foreground">{item.qty} units ({formatCurrency(item.revenue)})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
