"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Layers,
  CreditCard,
  Flame,
} from "lucide-react";
import toast from "react-hot-toast";
import { CardSpotlight } from "@/components/animations/CardSpotlight";
import { BorderBeam } from "@/components/animations/BorderBeam";
import { ShinyText } from "@/components/animations/ShinyText";
import { NumberTicker } from "@/components/animations/NumberTicker";

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
  orderTypes?: { type: string; count: number }[];
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

const DEFAULT_ANALYTICS: AnalyticsData = {
  summary: {
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
    avgOrderValue: 0,
    refundRate: 0,
    cancellationRate: 0,
    peakHour: "14:00",
    busiestDay: "Saturday",
    mostPopularCategory: "Coffee & Beverages",
  },
  peakHours: Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    hourNumber: i,
    count: 0,
  })),
  busiestDays: [
    { day: "Sunday", dayCode: "Sun", dow: 0, count: 0 },
    { day: "Monday", dayCode: "Mon", dow: 1, count: 0 },
    { day: "Tuesday", dayCode: "Tue", dow: 2, count: 0 },
    { day: "Wednesday", dayCode: "Wed", dow: 3, count: 0 },
    { day: "Thursday", dayCode: "Thu", dow: 4, count: 0 },
    { day: "Friday", dayCode: "Fri", dow: 5, count: 0 },
    { day: "Saturday", dayCode: "Sat", dow: 6, count: 0 },
  ],
  salesByCategory: [{ name: "Coffee & Beverages", value: 0, color: "#D4A056" }],
  mostSellingItems: [],
  leastSellingItems: [],
  salesByPayment: [
    { name: "UPI / Wallet", value: 0, color: "#10B981" },
    { name: "Card Payments", value: 0, color: "#4F46E5" },
    { name: "Cash Transactions", value: 0, color: "#F59E0B" },
  ],
};

const DEFAULT_MONTHLY: MonthlyData = {
  year: new Date().getFullYear(),
  months: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].map((m, i) => ({
    monthIndex: i + 1,
    month: m,
    monthShort: m,
    orders: 0,
    revenue: 0,
    customers: 0,
    avgBill: 0,
    topItem: "N/A",
  })),
};

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("month");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [analytics, setAnalytics] = useState<AnalyticsData>(DEFAULT_ANALYTICS);
  const [monthly, setMonthly] = useState<MonthlyData>(DEFAULT_MONTHLY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch Analytics & Monthly Data
  const fetchAnalytics = useCallback(
    async (isBackground = false) => {
      if (isBackground) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setFetchError(null);

      try {
        const [analyticsRes, monthlyRes] = await Promise.all([
          fetch(`/api/orders/analytics?range=${range}`),
          fetch(`/api/orders/monthly?year=${targetYear}`),
        ]);

        const analyticsJson = await analyticsRes.json().catch(() => ({}));
        const monthlyJson = await monthlyRes.json().catch(() => ({}));

        if (analyticsJson?.success && analyticsJson.data) {
          setAnalytics(analyticsJson.data);
        } else if (!analyticsJson?.success) {
          console.warn("Analytics API warning:", analyticsJson?.message);
        }

        if (monthlyJson?.success && monthlyJson.data) {
          setMonthly(monthlyJson.data);
        } else if (!monthlyJson?.success) {
          console.warn("Monthly API warning:", monthlyJson?.message);
        }

        if (!analyticsJson?.success && !monthlyJson?.success) {
          setFetchError(
            analyticsJson?.message || "Unable to retrieve POS analytics."
          );
        }
      } catch (error: any) {
        console.error("Failed to fetch analytics:", error);
        setFetchError("Network issue communicating with POS analytics API.");
        toast.error("Could not sync latest analytics");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range, targetYear]
  );

  useEffect(() => {
    fetchAnalytics(false);
    const interval = setInterval(() => fetchAnalytics(true), 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const { summary } = analytics;

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Business Analytics Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-caramel/15 text-caramel border border-caramel/30">
              <Sparkles className="w-3 h-3" />
              Live Insights
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time multi-dimensional POS metrics, peak hours heatmap, and revenue breakdown
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Preset Range Selector */}
          <div className="bg-card/80 backdrop-blur-md border border-border p-1 rounded-xl flex items-center gap-1 text-xs shadow-sm">
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
                  "px-3 py-1.5 rounded-lg font-medium transition-all duration-200",
                  range === p.id
                    ? "bg-caramel text-espresso font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(false)}
            disabled={loading || refreshing}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh Analytics"
          >
            <RefreshCw
              className={cn("w-4 h-4", (loading || refreshing) && "animate-spin text-caramel")}
            />
          </button>
        </div>
      </div>

      {/* Error Notice (if any) */}
      <AnimatePresence>
        {fetchError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 p-4 rounded-2xl flex items-center justify-between text-xs gap-3"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>
                <strong>Notice:</strong> {fetchError} Showing cached or baseline metrics.
              </span>
            </div>
            <button
              onClick={() => fetchAnalytics(false)}
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-bold transition-colors whitespace-nowrap"
            >
              Retry Sync
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Total Revenue",
            val: formatCurrency(summary.totalRevenue),
            numVal: summary.totalRevenue,
            isCurrency: true,
            icon: DollarSign,
            sub: "Paid bills total",
            color: "text-caramel",
          },
          {
            label: "Total Orders",
            val: summary.totalOrders.toString(),
            numVal: summary.totalOrders,
            icon: ShoppingBag,
            sub: `${summary.completedOrders} completed`,
            color: "text-blue-500",
          },
          {
            label: "Avg Order Value",
            val: formatCurrency(summary.avgOrderValue),
            numVal: summary.avgOrderValue,
            isCurrency: true,
            icon: TrendingUp,
            sub: "Per bill average",
            color: "text-emerald-500",
          },
          {
            label: "Refund Rate",
            val: `${summary.refundRate}%`,
            icon: Percent,
            sub: `${summary.refundedOrders} refunded`,
            color: "text-rose-500",
          },
          {
            label: "Cancellation Rate",
            val: `${summary.cancellationRate}%`,
            icon: AlertCircle,
            sub: `${summary.cancelledOrders} cancelled`,
            color: "text-amber-500",
          },
          {
            label: "Peak Operating Hour",
            val: summary.peakHour,
            icon: Clock,
            sub: "Highest order velocity",
            color: "text-indigo-500",
          },
          {
            label: "Busiest Day",
            val: summary.busiestDay,
            icon: Calendar,
            sub: "Top order volume day",
            color: "text-purple-500",
          },
          {
            label: "Top Category",
            val: summary.mostPopularCategory,
            icon: Award,
            sub: "Most revenue generated",
            color: "text-caramel",
          },
        ].map((kpi, idx) => (
          <CardSpotlight
            key={idx}
            className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm hover:border-caramel/40 transition-all duration-300"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                {kpi.label}
              </span>
              <div className={cn("p-1.5 rounded-lg bg-muted/60", kpi.color)}>
                <kpi.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="font-serif text-lg sm:text-2xl font-bold text-foreground tracking-tight truncate">
              {kpi.val}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
              {kpi.sub}
            </p>
          </CardSpotlight>
        ))}
      </div>

      {/* Charts Grid Row 1: Line Chart & Monthly Bar Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Trend Line Chart */}
        <CardSpotlight className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold">
                Revenue & Volume Trend
              </h3>
              <p className="text-xs text-muted-foreground">
                Monthly sales performance across the calendar
              </p>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
              {targetYear}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly.months}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis
                  dataKey="monthShort"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [
                    formatCurrency(Number(value)),
                    "Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4A056"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#D4A056" }}
                  activeDot={{ r: 6, fill: "#E8C890" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardSpotlight>

        {/* Chart 2: Monthly Sales Bar Chart */}
        <CardSpotlight className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold">
                Monthly Revenue Overview
              </h3>
              <p className="text-xs text-muted-foreground">
                Comparative revenue bars for {targetYear}
              </p>
            </div>
            <select
              value={targetYear}
              onChange={(e) => setTargetYear(parseInt(e.target.value, 10))}
              className="px-2.5 py-1 bg-muted border border-border rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-caramel"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly.months}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis
                  dataKey="monthShort"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [
                    formatCurrency(Number(value)),
                    "Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#D4A056"
                  radius={[6, 6, 0, 0]}
                  opacity={0.9}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardSpotlight>
      </div>

      {/* Charts Grid Row 2: Category Pie Chart, Payment Donut, Area Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart 3: Category Pie Chart */}
        <CardSpotlight className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-4 shadow-sm">
          <div>
            <h3 className="font-serif text-base font-bold">Sales by Category</h3>
            <p className="text-xs text-muted-foreground">
              Revenue distribution across menu categories
            </p>
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
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {analytics.salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardSpotlight>

        {/* Chart 4: Payment Methods Donut Chart */}
        <CardSpotlight className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-4 shadow-sm">
          <div>
            <h3 className="font-serif text-base font-bold">Payment Methods</h3>
            <p className="text-xs text-muted-foreground">
              Cash vs Card vs UPI settlement breakdown
            </p>
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
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardSpotlight>

        {/* Chart 5: Daily Revenue Fill Area Chart */}
        <CardSpotlight className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-4 shadow-sm">
          <div>
            <h3 className="font-serif text-base font-bold">Monthly Orders Count</h3>
            <p className="text-xs text-muted-foreground">
              Order volume rhythm across all 12 months
            </p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly.months}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis
                  dataKey="monthShort"
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#8BA888"
                  fill="#8BA888"
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardSpotlight>
      </div>

      {/* Chart 6: Peak Operating Hours Heatmap (24 hours x count) */}
      <CardSpotlight className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold">
              Hourly Peak Operating Heatmap
            </h3>
            <p className="text-xs text-muted-foreground">
              Order concentration across 24 operating hours (hover slot for exact count)
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Low</span>
            <div className="w-16 h-2 rounded-full bg-gradient-to-r from-caramel/20 to-caramel" />
            <span>Peak</span>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1.5 pt-2">
          {analytics.peakHours.map((slot) => {
            const maxCount = Math.max(
              ...analytics.peakHours.map((p) => p.count),
              1
            );
            const intensity =
              slot.count > 0 ? Math.max(0.2, slot.count / maxCount) : 0.06;

            return (
              <div
                key={slot.hour}
                className="flex flex-col items-center gap-1 group relative cursor-pointer"
              >
                <div
                  style={{ opacity: intensity }}
                  className="w-full h-11 rounded-lg bg-caramel border border-caramel/40 transition-all duration-200 group-hover:scale-105 group-hover:opacity-100 shadow-sm"
                />
                <span className="text-[9px] text-muted-foreground font-mono">
                  {slot.hourNumber}h
                </span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-1.5 hidden group-hover:block bg-espresso text-cream text-[10px] py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap z-30 border border-caramel/30 pointer-events-none">
                  <span className="font-bold">{slot.hour}</span>: {slot.count} orders
                </div>
              </div>
            );
          })}
        </div>
      </CardSpotlight>

      {/* Product Leaderboards (Top vs Least Selling) */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CardSpotlight className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-500" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
              Top 5 Selling Items
            </h3>
          </div>
          <div className="divide-y divide-border/60">
            {analytics.mostSellingItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No orders registered for this period yet.
              </p>
            ) : (
              analytics.mostSellingItems.map((item, i) => (
                <div
                  key={i}
                  className="py-3 flex items-center justify-between text-xs hover:bg-muted/40 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-[11px]">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-foreground">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono font-medium">
                    {item.qty} units ({formatCurrency(item.revenue)})
                  </span>
                </div>
              ))
            )}
          </div>
        </CardSpotlight>

        <CardSpotlight className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">
              Least Selling Items
            </h3>
          </div>
          <div className="divide-y divide-border/60">
            {analytics.leastSellingItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No data available for this range.
              </p>
            ) : (
              analytics.leastSellingItems.map((item, i) => (
                <div
                  key={i}
                  className="py-3 flex items-center justify-between text-xs hover:bg-muted/40 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-[11px]">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-foreground">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono font-medium">
                    {item.qty} units ({formatCurrency(item.revenue)})
                  </span>
                </div>
              ))
            )}
          </div>
        </CardSpotlight>
      </div>
    </div>
  );
}
