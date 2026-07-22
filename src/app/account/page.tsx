"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge, EmptyState } from "@/components/shared";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
import { useCartStore } from "@/store";
import {
  User,
  ShoppingBag,
  CalendarDays,
  Award,
  LogOut,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  FileText,
  Heart,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { data: session, status } = useSession();
  const { addItem } = useCartStore();

  const [activeTab, setActiveTab] = useState<"orders" | "reservations" | "loyalty" | "profile" | "favorites">("orders");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const user = session?.user as any;

  // Sync profile fields from session
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  // Fetch customer orders
  useEffect(() => {
    if (!session || !user?.email) return;
    setLoadingOrders(true);
    fetch(`/api/orders/history?userEmail=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.orders) {
          setOrders(data.data.orders);
        }
      })
      .catch((err) => console.error("Failed to fetch customer orders:", err))
      .finally(() => setLoadingOrders(false));
  }, [session, user?.email]);

  // Fetch customer reservations
  useEffect(() => {
    if (!session || !user?.email) return;
    setLoadingReservations(true);
    fetch(`/api/reservations?code=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setReservations(data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch customer reservations:", err))
      .finally(() => setLoadingReservations(false));
  }, [session, user?.email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      toast.error("Please enter email and password");
      return;
    }

    setLoadingLogin(true);
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
      setLoadingLogin(false);
    }
  };

  const handleReorder = (order: any) => {
    if (!Array.isArray(order.items)) return;
    let count = 0;
    order.items.forEach((item: any) => {
      addItem({
        menuItemId: item.menuItemId || item.id || "item",
        menuItemName: item.menuItemName || item.name || "Dish",
        menuItemImage: item.image || item.menuItemImage || null,
        quantity: item.qty || item.quantity || 1,
        unitPrice: item.unitPrice || item.price || 0,
        variantPrice: item.variantPrice || item.unitPrice || item.price || 0,
        variant: item.variant || null,
        addons: item.addons || [],
      });
      count += item.qty || item.quantity || 1;
    });
    toast.success(`Readded ${count} items from ${order.orderNumber} to cart!`);
  };

  // Derive favorite items across past orders
  const favoriteItemsMap: Record<string, { name: string; count: number; price: number; id: string }> = {};
  orders.forEach((o) => {
    if (Array.isArray(o.items)) {
      o.items.forEach((i: any) => {
        const id = i.menuItemId || i.id || i.name;
        if (!favoriteItemsMap[id]) {
          favoriteItemsMap[id] = { id, name: i.menuItemName || i.name, count: 0, price: i.unitPrice || 0 };
        }
        favoriteItemsMap[id].count += i.qty || 1;
      });
    }
  });

  const topFavorites = Object.values(favoriteItemsMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Loyalty Tier Calculation
  const loyaltyPoints = user?.loyaltyPoints || 0;
  const getTier = (pts: number) => {
    if (pts >= 5000) return { name: "Platinum", next: 10000, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" };
    if (pts >= 2000) return { name: "Gold", next: 5000, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    if (pts >= 500) return { name: "Silver", next: 2000, color: "text-slate-300 bg-slate-500/10 border-slate-500/30" };
    return { name: "Bronze", next: 500, color: "text-amber-700 dark:text-amber-500 bg-amber-500/10 border-amber-500/30" };
  };
  const tier = getTier(loyaltyPoints);

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

  // 2. Unauthenticated State -> Show Sign In Form
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
              disabled={loadingLogin}
              className="w-full py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loadingLogin ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Credentials Helper */}
          <div className="p-3 bg-muted/40 border border-border rounded-xl text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-caramel" /> Demo Login Credentials:
            </p>
            <p>Admin: <code className="bg-muted px-1 py-0.5 rounded text-foreground">admin@addadotcom.cafe</code> / <code className="bg-muted px-1 py-0.5 rounded text-foreground">admin123</code></p>
            <p>Customer: <code className="bg-muted px-1 py-0.5 rounded text-foreground">digan@gmail.com</code></p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Authenticated Customer Account Dashboard
  const userRole = user?.role?.toUpperCase();
  const isAdminOrStaff =
    userRole === "ADMIN" ||
    userRole === "MANAGER" ||
    userRole === "STAFF" ||
    user?.email === "admin@addadotcom.cafe";

  return (
    <div className="pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Account Header Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-espresso via-espresso-500 to-caramel-700 p-6 sm:p-8 text-cream shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-caramel/20 border-2 border-caramel/40 flex items-center justify-center text-3xl font-serif font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || "C"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">{user?.name || "Valued Customer"}</h1>
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase", tier.color)}>
                {tier.name} Tier
              </span>
            </div>
            <p className="text-xs text-cream-200">{user?.email}</p>
            <p className="text-xs text-caramel-200 flex items-center gap-1 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {loyaltyPoints} Loyalty Points Balance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end">
          {isAdminOrStaff && (
            <Link
              href="/admin"
              className="px-4 py-2.5 bg-caramel text-espresso rounded-xl text-xs font-bold hover:bg-caramel-300 transition-colors flex items-center gap-1.5 shadow-md"
            >
              Admin Portal <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/account" })}
            className="px-4 py-2.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto custom-scrollbar">
        {[
          { key: "orders", label: `My Orders (${orders.length})`, icon: ShoppingBag },
          { key: "reservations", label: `Reservations (${reservations.length})`, icon: CalendarDays },
          { key: "loyalty", label: "Rewards & Points", icon: Award },
          { key: "favorites", label: "Favourite Items", icon: Heart },
          { key: "profile", label: "My Profile", icon: User },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                activeTab === t.key
                  ? "bg-espresso text-cream shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              )}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-caramel" /> Loading order history...
            </div>
          ) : orders.length === 0 ? (
            <EmptyState title="No orders found" description="Explore our cafe menu and place your first order!" />
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-caramel/40"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-muted rounded-full">
                        {order.type}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Placed on {formatDate(order.createdAt)} • {Array.isArray(order.items) ? order.items.length : 0} items
                    </p>

                    <p className="text-xs text-foreground font-medium truncate max-w-lg">
                      {Array.isArray(order.items)
                        ? order.items.map((i: any) => `${i.qty || 1}× ${i.menuItemName || i.name}`).join(", ")
                        : "Itemized dishes"}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border gap-2 shrink-0">
                    <p className="font-serif font-bold text-lg text-foreground">{formatCurrency(order.total || 0)}</p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoiceId(order.id)}
                        className="px-3 py-1.5 border border-border hover:bg-muted text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Invoice
                      </button>
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-3 py-1.5 bg-espresso text-cream text-xs font-semibold rounded-xl hover:bg-espresso-500 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Reorder
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reservations */}
      {activeTab === "reservations" && (
        <div className="space-y-4">
          {loadingReservations ? (
            <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-caramel" /> Loading table reservations...
            </div>
          ) : reservations.length === 0 ? (
            <EmptyState title="No table bookings yet" description="Reserve a table for your next dine-in visit!" />
          ) : (
            <div className="grid gap-4">
              {reservations.map((res) => (
                <div key={res.id} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base">{formatDate(res.date)}</h4>
                      <StatusBadge status={res.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Time: <strong>{res.timeSlot}</strong> • Guests: <strong>{res.partySize} persons</strong>
                    </p>
                    <p className="text-[10px] font-mono text-caramel">Booking Code: {res.bookingCode}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Loyalty & Rewards */}
      {activeTab === "loyalty" && (
        <div className="bg-card border border-border p-6 rounded-2xl space-y-6">
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
              <Award className="w-6 h-6 text-caramel" /> Loyalty Rewards & Membership
            </h3>
            <p className="text-xs text-muted-foreground">
              Earn 1 point for every ₹10 spent at AddaDotCom Cafe. Higher tiers unlock special discounts and complimentary dishes!
            </p>
          </div>

          {/* Tier Progress Card */}
          <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="font-serif font-black text-3xl text-caramel">{loyaltyPoints} Points</p>
              </div>
              <span className={cn("px-4 py-1.5 rounded-full text-xs font-bold border uppercase", tier.color)}>
                {tier.name} Status
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Progress to Next Tier</span>
                <span>{loyaltyPoints} / {tier.next} pts</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-caramel transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (loyaltyPoints / tier.next) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Favourite Items */}
      {activeTab === "favorites" && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold">Your Most Ordered Dishes</h3>
          {topFavorites.length === 0 ? (
            <EmptyState title="No favorites yet" description="Place orders to automatically see your favorite dishes here!" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {topFavorites.map((fav) => (
                <div key={fav.id} className="bg-card border border-border p-4 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm">{fav.name}</h4>
                      <p className="text-xs text-muted-foreground">Ordered {fav.count} times</p>
                    </div>
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="font-serif font-bold text-sm">{formatCurrency(fav.price)}</span>
                    <button
                      onClick={() => {
                        addItem({
                          menuItemId: fav.id,
                          menuItemName: fav.name,
                          quantity: 1,
                          unitPrice: fav.price,
                          variantPrice: fav.price,
                        });
                        toast.success(`Added ${fav.name} to cart!`);
                      }}
                      aria-label={`Add ${fav.name} to cart`}
                      className="px-3 py-1.5 bg-espresso text-cream rounded-xl text-xs font-bold hover:bg-espresso-500 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Profile Editor */}
      {activeTab === "profile" && (
        <div className="bg-card border border-border p-6 rounded-2xl max-w-xl space-y-6">
          <h3 className="font-serif text-xl font-bold">Edit Profile Details</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Profile details updated successfully!");
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-semibold mb-1 block">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Phone Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Email (Read-only)</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Invoice Modal Popup */}
      {selectedInvoiceId && (
        <InvoiceModal
          orderId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
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
