"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge, EmptyState } from "@/components/shared";
import {
  User,
  ShoppingBag,
  CalendarDays,
  Award,
  LogOut,
  MapPin,
  RefreshCw,
  Lock,
  ArrowRight,
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

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  
  // Profile settings
  const [name, setName] = useState("Digan");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [loyaltyPoints, setLoyaltyPoints] = useState(1435);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput && passwordInput) {
      setIsLoggedIn(true);
      toast.success("Successfully logged in!");
    } else {
      toast.error("Please enter email and password");
    }
  };

  const handleReorder = (order: OrderHistory) => {
    toast.success(`Items from ${order.orderNumber} added to cart!`);
  };

  if (!isLoggedIn) {
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
              Sign in to manage your orders, reservations & loyalty points
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1 block">Email address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
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
              className="w-full py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors flex items-center justify-center gap-1.5"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: User details card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-espresso text-cream flex items-center justify-center text-2xl font-bold mx-auto border-4 border-caramel/20">
              D
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold">{name}</h2>
              <p className="text-xs text-muted-foreground">hello@addadotcom.cafe</p>
              <p className="text-xs text-muted-foreground mt-0.5">{phone}</p>
            </div>

            {/* Loyalty points banner */}
            <div className="p-4 rounded-xl bg-caramel/10 border border-caramel/20 flex items-center justify-center gap-3">
              <Award className="w-6 h-6 text-caramel flex-shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Loyalty Points</p>
                <p className="font-serif font-bold text-lg text-caramel">{loyaltyPoints} pts</p>
                <p className="text-[9px] text-muted-foreground">Redeem points for meal discounts</p>
              </div>
            </div>

            <button
              onClick={() => setIsLoggedIn(false)}
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
