"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import { StatusBadge, DashboardCardSkeleton } from "@/components/shared";
import { useSSE } from "@/lib/useSSE";
import { VengenceKpiCard } from "@/components/admin/VengenceKpiCard";
import { AdminQuickBar } from "@/components/admin/AdminQuickBar";
import { CardSpotlight } from "@/components/animations/CardSpotlight";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  todayRevenue: number;
  weeklyRevenue?: number;
  monthlyRevenue?: number;
  yearlyRevenue?: number;
  todayOrders: number;
  totalOrdersAllTime?: number;
  avgOrderValue: number;
  todayReservations: number;
  topSellingItems: { name: string; count: number; revenue: number }[];
  revenueByDay: { date: string; revenue: number }[];
  salesByCategory: { category: string; revenue: number; color: string }[];
  recentOrders: any[];
  upcomingReservations: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useSSE({
    "new-order": () => fetchDashboardStats(),
    "order-updated": () => fetchDashboardStats(),
    "bill-paid": () => fetchDashboardStats(),
    "reservation-created": () => fetchDashboardStats(),
    "table-updated": () => fetchDashboardStats(),
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <div className="space-y-6">
      {/* Floating Quick Action Bar (Skiper UI style) */}
      <AdminQuickBar />

      {/* Header controls with Live Status Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">Admin Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time operations, tables & sales performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Real-time SSE Active
          </span>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchDashboardStats();
            }}
            disabled={refreshing || (loading && !stats)}
            className="px-3.5 py-2 bg-card border border-border/80 rounded-xl text-xs font-semibold hover:bg-muted/80 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", (refreshing || loading) && "animate-spin text-caramel")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Vengence UI + Animata Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading && !stats ? (
          Array.from({ length: 4 }).map((_, i) => <DashboardCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <VengenceKpiCard
              label="Today's Revenue"
              rawValue={stats.todayRevenue}
              prefix="₹"
              change="Live today"
              positive={true}
              icon={DollarSign}
              color="bg-caramel/15 text-caramel dark:bg-caramel/25"
              delay={0.1}
              isLive={true}
              hasBeam={true}
              beamColor="#D4A056"
            />
            <VengenceKpiCard
              label="This Month Revenue"
              rawValue={stats.monthlyRevenue || 0}
              prefix="₹"
              change="Current month"
              positive={true}
              icon={TrendingUp}
              color="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              delay={0.2}
            />
            <VengenceKpiCard
              label="Orders Today / Total"
              fallbackValue={`${stats.todayOrders} / ${stats.totalOrdersAllTime || stats.todayOrders}`}
              change="Live order stream"
              positive={true}
              icon={ShoppingBag}
              color="bg-espresso/15 text-espresso dark:bg-caramel/15 dark:text-caramel"
              delay={0.3}
              isLive={true}
            />
            <VengenceKpiCard
              label="Avg. Order Value"
              rawValue={Math.round(stats.avgOrderValue)}
              prefix="₹"
              change="Paid bills"
              positive={true}
              icon={TrendingUp}
              color="bg-sage/15 text-sage-600 dark:text-sage-400"
              delay={0.4}
            />
          </>
        ) : null}
      </div>

      {stats && (
        <>
          {/* Charts Row with CardSpotlight (Aceternity UI style) */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <CardSpotlight className="p-6 h-full border border-border/80 bg-card/90 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold">Revenue (Last 7 Days)</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Continuous sales tracking</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-caramel/10 text-caramel border border-caramel/20">
                    Live Velocity
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={stats.revenueByDay}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4A056" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#D4A056" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.75rem",
                        fontSize: "0.875rem",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#D4A056" strokeWidth={2.5} fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardSpotlight>
            </motion.div>

            {/* Sales by Category Pie */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CardSpotlight className="p-6 h-full border border-border/80 bg-card/90 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-bold">Sales by Category</h3>
                  <span className="text-xs text-muted-foreground font-medium">Breakdown</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.salesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="revenue"
                    >
                      {stats.salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.75rem",
                        fontSize: "0.875rem",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                  {stats.salesByCategory.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-muted-foreground font-medium">{cat.category}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(cat.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardSpotlight>
            </motion.div>
          </div>

          {/* Bottom Row: Live Orders + Upcoming Reservations + Top Items */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <CardSpotlight className="p-6 h-full border border-border/80 bg-card/90 backdrop-blur-xl flex flex-col max-h-[420px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-bold">Live Orders</h3>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Auto-updates</span>
                </div>
                <div className="space-y-2.5 overflow-y-auto flex-1 custom-scrollbar pr-1">
                  {stats.recentOrders.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-12">No orders today yet</p>
                  ) : (
                    stats.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 hover:border-caramel/30 transition-colors">
                        <div>
                          <p className="text-xs font-bold">{order.orderNumber.split("-").pop()}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {order.type.replace("_", " ")} {order.table ? `• T${order.table.number}` : ""}
                          </p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                    ))
                  )}
                </div>
              </CardSpotlight>
            </motion.div>

            {/* Upcoming Reservations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <CardSpotlight className="p-6 h-full border border-border/80 bg-card/90 backdrop-blur-xl flex flex-col max-h-[420px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-bold">Upcoming Bookings</h3>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                <div className="space-y-2.5 overflow-y-auto flex-1 custom-scrollbar pr-1">
                  {stats.upcomingReservations.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-12">No upcoming bookings</p>
                  ) : (
                    stats.upcomingReservations.map((res) => (
                      <div key={res.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 hover:border-caramel/30 transition-colors">
                        <div>
                          <p className="text-xs font-bold">{res.guestName}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            <Users className="w-3 h-3 inline mr-1 text-caramel" />{res.partySize} • <Clock className="w-3 h-3 inline mr-1 text-caramel" />{res.timeSlot} {res.table ? `• T${res.table.number}` : ""}
                          </p>
                        </div>
                        <StatusBadge status={res.status} />
                      </div>
                    ))
                  )}
                </div>
              </CardSpotlight>
            </motion.div>

            {/* Top Selling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <CardSpotlight className="p-6 h-full border border-border/80 bg-card/90 backdrop-blur-xl flex flex-col max-h-[420px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-bold">Top Selling Items</h3>
                  <span className="text-xs text-caramel font-semibold">Today</span>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-1">
                  {stats.topSellingItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-12">No sales recorded today</p>
                  ) : (
                    stats.topSellingItems.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors">
                        <span className="w-6 h-6 rounded-full bg-caramel/15 text-caramel text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">{item.count} sold</p>
                        </div>
                        <span className="text-xs font-bold font-sans text-foreground">{formatCurrency(item.revenue)}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardSpotlight>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
