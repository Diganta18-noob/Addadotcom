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
  todayOrders: number;
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

  useEffect(() => {
    fetchDashboardStats();
    // Ultra-fast 3s real-time dashboard refresh
    const interval = setInterval(fetchDashboardStats, 3000);
    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  const kpiCards = stats
    ? [
        {
          label: "Today's Revenue",
          value: formatCurrency(stats.todayRevenue),
          change: "+12.5%",
          positive: true,
          icon: DollarSign,
          color: "bg-caramel/10 text-caramel",
        },
        {
          label: "Orders Today",
          value: stats.todayOrders.toString(),
          change: "Live order count",
          positive: true,
          icon: ShoppingBag,
          color: "bg-espresso/10 text-espresso dark:bg-espresso/20 dark:text-caramel",
        },
        {
          label: "Avg. Order Value",
          value: formatCurrency(stats.avgOrderValue),
          change: "Based on paid bills",
          positive: true,
          icon: TrendingUp,
          color: "bg-sage/10 text-sage-600",
        },
        {
          label: "Reservations Today",
          value: stats.todayReservations.toString(),
          change: "Table bookings",
          positive: true,
          icon: CalendarDays,
          color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-bold">Admin Dashboard</h2>
        <button
          onClick={() => {
            setRefreshing(true);
            fetchDashboardStats();
          }}
          disabled={refreshing || (loading && !stats)}
          className="px-3 py-2 bg-muted border border-border rounded-lg text-sm hover:bg-muted/80 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", (refreshing || loading) && "animate-spin")} />
          <span>Refresh stats</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading && !stats
          ? Array.from({ length: 4 }).map((_, i) => <DashboardCardSkeleton key={i} />)
          : kpiCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="text-2xl font-bold font-serif mt-1">{card.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {card.positive ? (
                          <ArrowUpRight className="w-3 h-3 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-xs text-muted-foreground">{card.change}</span>
                      </div>
                    </div>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {stats && (
        <>
          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 rounded-xl border border-border bg-card p-6"
            >
              <h3 className="font-serif text-lg font-semibold mb-6">Revenue (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.revenueByDay}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A056" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4A056" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "0.875rem",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D4A056" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Sales by Category Pie */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="font-serif text-lg font-semibold mb-6">Sales by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
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
              <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto">
                {stats.salesByCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-muted-foreground">{cat.category}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(cat.revenue)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Row: Orders + Reservations + Top Items */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-xl border border-border bg-card p-6 flex flex-col max-h-[400px]"
            >
              <h3 className="font-serif text-lg font-semibold mb-4">Live Orders</h3>
              <div className="space-y-3 overflow-y-auto flex-1">
                {stats.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No orders today yet</p>
                ) : (
                  stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                      <div>
                        <p className="text-sm font-medium">{order.orderNumber.split("-").pop()}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.type.replace("_", " ")} {order.table ? `• T${order.table.number}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Upcoming Reservations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-xl border border-border bg-card p-6 flex flex-col max-h-[400px]"
            >
              <h3 className="font-serif text-lg font-semibold mb-4">Upcoming Reservations</h3>
              <div className="space-y-3 overflow-y-auto flex-1">
                {stats.upcomingReservations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No upcoming bookings</p>
                ) : (
                  stats.upcomingReservations.map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                      <div>
                        <p className="text-sm font-medium">{res.guestName}</p>
                        <p className="text-xs text-muted-foreground">
                          <Users className="w-3 h-3 inline mr-1" />{res.partySize} • <Clock className="w-3 h-3 inline mr-1" />{res.timeSlot} {res.table ? `• T${res.table.number}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={res.status} />
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Top Selling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="rounded-xl border border-border bg-card p-6 flex flex-col max-h-[400px]"
            >
              <h3 className="font-serif text-lg font-semibold mb-4">Top Selling Items</h3>
              <div className="space-y-3 overflow-y-auto flex-1 font-sans">
                {stats.topSellingItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No sales recorded today</p>
                ) : (
                  stats.topSellingItems.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-caramel/10 text-caramel text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.count} sold</p>
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(item.revenue)}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
