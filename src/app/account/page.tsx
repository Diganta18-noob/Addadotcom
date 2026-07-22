"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge, EmptyState } from "@/components/shared";
import {
  User,
  ShoppingBag,
  CalendarDays,
  Award,
  LogOut,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";

interface OrderHistory {
  id: string;
  orderNumber: string;
  date: string;
  items: string;
  total: number;
  status: string;
}

interface ResHistory {
  id: string;
  date: string;
  timeSlot: string;
  partySize: number;
  status: string;
  bookingCode: string;
}

const mockOrders: OrderHistory[] = [
  { id: "o1", orderNumber: "ORD-20260715-F456", date: "2026-07-15", items: "1× Caramel French Toast, 2× Espresso Bloom", total: 847, status: "COMPLETED" },
  { id: "o2", orderNumber: "ORD-20260710-X239", date: "2026-07-10", items: "1× Cold Brew Coffee, 1× Avocado Toast", total: 588, status: "COMPLETED" },
];

const mockReservations: ResHistory[] = [
  { id: "r1", date: "2026-07-17", timeSlot: "19:00", partySize: 4, status: "CONFIRMED", bookingCode: "BK-Y7U8I9" },
  { id: "r2", date: "2026-07-02", timeSlot: "13:30", partySize: 2, status: "COMPLETED", bookingCode: "BK-P3O2N1" },
];

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { data: session, status } = useSession();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: emailInput,
        password: passwordInput,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Successfully logged in!");
        if (callbackUrl && callbackUrl !== "/") {
          router.push(callbackUrl);
        } else {
          router.refresh();
        }
      }
    } catch (err) {
      toast.error("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order: OrderHistory) => {
    toast.success(`Items from ${order.orderNumber} added to cart!`);
  };

  // 1. Loading Session State
  if (status === "loading") {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[70vh] px-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-caramel border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground">Loading Account...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated or signed out state -> Show Sign In Form
  if (status === "unauthenticated" || !session) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-lg space-y-6"
        >
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to manage orders, reservations & access Admin Panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1 block">Email address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@addadotcom.cafe"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Admin Credentials Helper */}
          <div className="p-3 bg-muted/40 border border-border rounded-xl text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-caramel" /> Demo Admin Login Credentials:
            </p>
            <p>Email: <code className="bg-muted px-1 py-0.5 rounded text-foreground">admin@addadotcom.cafe</code></p>
            <p>Password: <code className="bg-muted px-1 py-0.5 rounded text-foreground">admin123</code></p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Authenticated State
  const user = session.user as any;
  const userRole = user?.role?.toUpperCase();
  const isAdminOrStaff =
    userRole === "ADMIN" ||
    userRole === "MANAGER" ||
    userRole === "STAFF" ||
    user?.email === "admin@addadotcom.cafe";

  return (
    <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: User details card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-espresso text-cream flex items-center justify-center text-2xl font-bold mx-auto border-4 border-caramel/20">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold">{user?.name || "User"}</h2>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-caramel/20 text-caramel">
                {user?.role || "CUSTOMER"}
              </span>
            </div>

            {/* Admin Quick Action Button */}
            {isAdminOrStaff && (
              <Link
                href="/admin"
                className="w-full py-2 bg-caramel text-espresso rounded-xl text-xs font-bold hover:bg-caramel-300 transition-colors flex items-center justify-center gap-1.5"
              >
                Go to Admin Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Loyalty points banner */}
            <div className="p-4 rounded-xl bg-caramel/10 border border-caramel/20 flex items-center justify-center gap-3">
              <Award className="w-6 h-6 text-caramel flex-shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Loyalty Points</p>
                <p className="font-serif font-bold text-lg text-caramel">1435 pts</p>
                <p className="text-[9px] text-muted-foreground">Redeem points for meal discounts</p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/account" })}
              className="w-full py-2 border border-border rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: History panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order history */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-caramel" /> Past Orders
            </h3>
            {mockOrders.length === 0 ? (
              <EmptyState title="No orders yet" description="Make your first order to earn points!" />
            ) : (
              <div className="space-y-3">
                {mockOrders.map((order) => (
                  <div key={order.id} className="p-4 rounded-xl border border-border flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-mono text-xs font-bold">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.date)}</p>
                      <p className="text-sm truncate">{order.items}</p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-2">
                      <p className="font-serif font-bold text-sm">{formatCurrency(order.total)}</p>
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-3 py-1 bg-espresso text-cream text-[10px] font-semibold rounded-lg hover:bg-espresso-500 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reservation history */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-caramel" /> Table Bookings
            </h3>
            {mockReservations.length === 0 ? (
              <EmptyState title="No bookings yet" description="Book a table for a fine dining experience!" />
            ) : (
              <div className="space-y-3">
                {mockReservations.map((res) => (
                  <div key={res.id} className="p-4 rounded-xl border border-border flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-serif font-bold text-sm">{formatDate(res.date)}</p>
                      <p className="text-xs text-muted-foreground">{res.timeSlot} • {res.partySize} guests</p>
                      <p className="text-[10px] font-mono text-muted-foreground">Code: {res.bookingCode}</p>
                    </div>
                    <StatusBadge status={res.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="pt-24 text-center min-h-[50vh]">Loading account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
