"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag,
  MapPin,
  Clock,
  UtensilsCrossed,
  Truck,
  Package,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Tag,
  X,
  Check,
  Coffee,
} from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store";
import { cn, formatCurrency, generateOrderNumber } from "@/lib/utils";
import toast from "react-hot-toast";
import { LoadingButton } from "@/components/shared";
import { useSSE } from "@/lib/useSSE";

const orderTypeConfig = [
  { value: "DINE_IN" as const, label: "Dine-in", icon: UtensilsCrossed, description: "Eat at the café" },
  { value: "TAKEAWAY" as const, label: "Takeaway", icon: Package, description: "Pick up your order" },
  { value: "DELIVERY" as const, label: "Delivery", icon: Truck, description: "Get it delivered" },
];

const tipOptions = [0, 20, 50, 100];

export default function OrderPage() {
  const {
    items,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    deliveryAddress,
    setDeliveryAddress,
    deliveryFee,
    setDeliveryFee,
    pickupTime,
    setPickupTime,
    orderNotes,
    setOrderNotes,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromo,
    tipAmount,
    setTipAmount,
    getSubtotal,
    getTaxes,
    getServiceCharge,
    getTotal,
    removeItem,
    updateQuantity,
    clearCart,
    activeOrder,
    setActiveOrder,
    clearActiveOrder,
  } = useCartStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [promoInput, setPromoInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COUNTER" | "COD">("ONLINE");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [liveOrderStatus, setLiveOrderStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [realtimeTables, setRealtimeTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const qrTableParam = searchParams?.get("table");
  const isQRMode = searchParams?.get("qr") === "1";

  React.useEffect(() => {
    if (qrTableParam && isQRMode) {
      setOrderType("DINE_IN");
      setTableNumber(qrTableParam);
      // Auto advance to step 2 if coming from QR code
      setCurrentStep(2);
    }
  }, [qrTableParam, isQRMode, setOrderType, setTableNumber]);

  const fetchTables = React.useCallback(async () => {
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRealtimeTables(data.data);
      }
    } catch {}
  }, []);

  useSSE({
    "table-updated": (data) => {
      if (data?.tableId && data?.status) {
        setRealtimeTables((prev) =>
          prev.map((t) => (t.id === data.tableId || t.number === data.tableNumber ? { ...t, status: data.status } : t))
        );
      }
      fetchTables();
    },
    "new-order": () => fetchTables(),
    "bill-paid": () => fetchTables(),
    "order-updated": (data) => {
      if (
        data?.orderId === currentOrder?.id ||
        data?.orderNumber === currentOrder?.orderNumber
      ) {
        if (data.status) {
          setLiveOrderStatus(data.status);
          const msgs: Record<string, string> = {
            ACCEPTED: "✅ Kitchen accepted your order!",
            PREPARING: "👨‍🍳 Your order is being prepared...",
            READY: "🔔 Your order is ready!",
          };
          if (msgs[data.status]) toast.success(msgs[data.status], { duration: 5000 });
        }
      }
    },
  });

  React.useEffect(() => {
    if (orderType === "DINE_IN") {
      setLoadingTables(true);
      fetchTables().finally(() => setLoadingTables(false));
    }
  }, [orderType, fetchTables]);

  const subtotal = getSubtotal();
  const taxes = getTaxes();
  const serviceCharge = getServiceCharge();
  const total = getTotal();

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    const code = promoInput.toUpperCase().trim();

    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const { code: validCode, type, value, maxDiscount } = data.data;
        let discount = 0;
        if (type === "PERCENTAGE") {
          discount = Math.min(subtotal * (value / 100), maxDiscount || subtotal);
        } else {
          discount = Math.min(value, subtotal);
        }
        setPromoCode(validCode, discount);
        toast.success(`Promo applied: -${formatCurrency(discount)}`);
      } else {
        toast.error(data.message || "Invalid or expired promo code");
      }
    } catch {
      if (code === "WELCOME10") {
        setPromoCode(code, Math.min(subtotal * 0.1, 200));
        toast.success("10% discount applied!");
      } else if (code === "FIRST50") {
        setPromoCode(code, Math.min(50, subtotal));
        toast.success("₹50 discount applied!");
      } else {
        toast.error("Invalid promo code");
      }
    }
    setPromoInput("");
  };

  const validateStep2 = (): boolean => {
    if (orderType === "DINE_IN" && !tableNumber) {
      toast.error("Please select your table number");
      return false;
    }
    if (orderType === "DELIVERY" && !deliveryAddress.trim()) {
      toast.error("Please enter your delivery address");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    setLoading(true);

    const selectedTableObj = realtimeTables.find((t) => t.number.toString() === tableNumber);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: orderType,
          tableId: selectedTableObj?.id || null,
          tableNumber: tableNumber || null,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            menuItemName: i.menuItemName,
            qty: i.quantity,
            variant: i.variant,
            addons: i.addons || [],
            note: i.note || "",
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
          })),
          notes: orderNotes || null,
          deliveryAddress: orderType === "DELIVERY" ? deliveryAddress : null,
          deliveryFee: orderType === "DELIVERY" ? 49 : 0,
          pickupTime: orderType === "TAKEAWAY" && pickupTime ? pickupTime : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const created = data.data;
        setOrderNumber(created.orderNumber);
        setActiveOrder({
          id: created.id,
          orderNumber: created.orderNumber,
          type: created.type,
          status: created.status || "PLACED",
          tableNumber: tableNumber || null,
          total: created.total || total,
          createdAt: created.createdAt,
          items: items.map((i) => ({
            menuItemName: i.menuItemName,
            qty: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
          })),
        });
        setOrderPlaced(true);
        clearCart();
        toast.success("Order placed successfully!");
      } else {
        console.error("Order API error:", data);
        toast.error(data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Order network error:", err);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentOrder = activeOrder || (orderPlaced ? { orderNumber, status: "PLACED", id: orderNumber } : null);
  const currentStatus = liveOrderStatus || currentOrder?.status || "PLACED";

  if (orderPlaced || (activeOrder && items.length === 0)) {
    const displayOrderNum = currentOrder?.orderNumber || orderNumber;
    const trackId = currentOrder?.id || displayOrderNum;

    return (
      <div className="pt-20 pb-24 lg:pb-12 min-h-screen flex items-center justify-center bg-muted/20 px-4">
        <div className="w-full max-w-md mx-auto py-8 space-y-6">
          {/* Animated Checkmark Header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
            className="relative w-24 h-24 mx-auto"
          >
            {/* Pulsing ring behind */}
            <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
            {/* Solid circle */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Headline with stagger */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-1 text-center"
          >
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Order Placed! 🎉
            </h1>
            <p className="text-muted-foreground text-sm">
              Your kitchen has been notified and is getting started
            </p>
          </motion.div>

          {/* Order Identity Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full rounded-2xl bg-gradient-to-br from-espresso to-espresso/80 text-cream p-5 space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-cream/60 text-xs uppercase tracking-wider font-semibold">Order ID</span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
              </span>
            </div>
            <p className="font-mono text-2xl font-bold text-caramel tracking-wider">
              {displayOrderNum}
            </p>
            <div className="flex items-center gap-3 text-xs text-cream/70 flex-wrap pt-1">
              {activeOrder?.tableNumber && (
                <span className="flex items-center gap-1">
                  🪑 Table {activeOrder.tableNumber}
                </span>
              )}
              <span className="flex items-center gap-1">
                🛍 {activeOrder?.type?.replace("_", " ") || "DINE IN"}
              </span>
              {(currentOrder as any)?.items?.length > 0 && (
                <span className="flex items-center gap-1">
                  📦 {(currentOrder as any).items.length} item{(currentOrder as any).items.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-cream/10">
              <Clock className="w-3.5 h-3.5 text-caramel" />
              <span className="text-xs text-cream/80">
                Est. ready in <strong className="text-caramel">~15 minutes</strong>
              </span>
            </div>
          </motion.div>

          {/* Order Progress Stepper */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="w-full bg-card border border-border/80 rounded-2xl p-4 shadow-xs"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">
              Order Progress
            </p>

            {(() => {
              const steps = [
                { key: "PLACED", label: "Placed", icon: "📋" },
                { key: "ACCEPTED", label: "Accepted", icon: "✅" },
                { key: "PREPARING", label: "Preparing", icon: "👨‍🍳" },
                { key: "READY", label: "Ready", icon: "🔔" },
              ];
              const statusOrder = ["PLACED", "ACCEPTED", "PREPARING", "READY", "SERVED", "COMPLETED"];
              const currentIdx = statusOrder.indexOf(currentStatus);

              return (
                <div className="flex items-center justify-between px-1">
                  {steps.map((step, i) => {
                    const stepIdx = statusOrder.indexOf(step.key);
                    const isDone = currentIdx > stepIdx;
                    const isActive = currentIdx === stepIdx;
                    return (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <motion.div
                            animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition-all duration-500",
                              isDone
                                ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-500/30"
                                : isActive
                                ? "bg-caramel border-caramel text-espresso shadow-md shadow-caramel/30 font-bold"
                                : "bg-muted border-border text-muted-foreground"
                            )}
                          >
                            {isDone ? "✓" : step.icon}
                          </motion.div>
                          <span
                            className={cn(
                              "text-[10px] font-bold text-center",
                              isDone ? "text-green-600" : isActive ? "text-caramel font-extrabold" : "text-muted-foreground"
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                        {i < steps.length - 1 && (
                          <div
                            className={cn(
                              "flex-1 h-0.5 mx-1.5 transition-all duration-700 rounded-full",
                              currentIdx > stepIdx ? "bg-green-500" : "bg-border"
                            )}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })()}
          </motion.div>

          {/* Items Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="w-full rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Your Order
            </p>
            <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
              {(currentOrder as any)?.items && (currentOrder as any).items.length > 0 ? (
                (currentOrder as any).items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium truncate flex-1 pr-2">
                      {item.menuItemName}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-muted-foreground text-xs font-semibold">×{item.qty || item.quantity}</span>
                      <span className="font-semibold text-caramel font-mono text-xs">
                        {formatCurrency(item.totalPrice || item.unitPrice * (item.qty || item.quantity))}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Order confirmed ✓
                </p>
              )}
            </div>
            {(currentOrder as any)?.total && (
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-sm font-bold">Total</span>
                <span className="font-serif font-bold text-caramel text-base">
                  {formatCurrency((currentOrder as any).total)}
                </span>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="w-full space-y-3"
          >
            {trackId && (
              <Link
                href={`/track/${trackId}`}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-caramel text-espresso font-bold rounded-2xl text-sm hover:bg-caramel/90 active:scale-[0.98] transition-all shadow-lg shadow-caramel/20 group"
              >
                <span className="w-2 h-2 rounded-full bg-espresso/60 animate-pulse" />
                Track Live Order Progress
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  clearActiveOrder();
                  setOrderPlaced(false);
                  setCurrentStep(1);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card text-sm font-semibold hover:bg-muted active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                New Order
              </button>
              <Link
                href="/menu"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-espresso text-cream text-sm font-semibold hover:bg-espresso/90 active:scale-[0.98] transition-all"
              >
                <UtensilsCrossed className="w-4 h-4" />
                Browse Menu
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-20 pb-24 lg:pb-12 min-h-screen flex items-center justify-center">
        <div className="text-center px-4 space-y-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Add some delicious items first!</p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-espresso text-cream rounded-full text-sm font-semibold hover:bg-espresso-500 transition-colors"
          >
            Browse Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 lg:pb-12 min-h-screen bg-muted/20">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-espresso to-espresso/85 text-cream py-8 sm:py-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-1">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Express Checkout</h1>
          <p className="text-cream-200/70 text-sm">Order in 3 quick steps with instant tracking</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Numbered Step Progress Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-8 bg-card border border-border p-3 sm:p-4 rounded-2xl shadow-xs">
          {[
            { n: 1, label: "1. Your Cart", desc: `${items.length} item${items.length > 1 ? "s" : ""}` },
            { n: 2, label: "2. Order Details", desc: orderType === "DINE_IN" ? (tableNumber ? `Table ${tableNumber}` : "Dine-in") : orderType === "TAKEAWAY" ? "Takeaway" : "Delivery" },
            { n: 3, label: "3. Payment", desc: "Pay & Place Order" },
          ].map(({ n, label, desc }, idx) => {
            const isCompleted = currentStep > n;
            const isActive = currentStep === n;

            return (
              <React.Fragment key={n}>
                <button
                  type="button"
                  onClick={() => {
                    if (n === 1) setCurrentStep(1);
                    if (n === 2 && currentStep === 3) setCurrentStep(2);
                  }}
                  disabled={!isCompleted && !isActive}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all",
                    isActive
                      ? "bg-espresso text-cream shadow-md scale-[1.02]"
                      : isCompleted
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 cursor-pointer"
                      : "bg-muted/40 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                      isActive
                        ? "bg-caramel text-espresso font-black"
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? "✓" : n}
                  </span>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold leading-tight">{label}</p>
                    <p className={cn("text-[10px]", isActive ? "text-cream-200/80" : "text-muted-foreground")}>
                      {desc}
                    </p>
                  </div>
                </button>

                {idx < 2 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 rounded-full transition-colors",
                      currentStep > n ? "bg-green-500" : "bg-border"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content Animated Switch */}
        <AnimatePresence mode="wait">
          {/* STEP 1: YOUR CART */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid lg:grid-cols-5 gap-8"
            >
              {/* Cart Item Cards */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-caramel" /> Review Your Cart Items
                  </h2>
                  <button
                    onClick={() => clearCart()}
                    className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-2xl border border-border/80 bg-card hover:border-caramel/40 transition-all shadow-xs"
                    >
                      {/* Image 80x80 */}
                      <div className="w-20 h-20 rounded-xl bg-muted shrink-0 overflow-hidden relative border border-border/50">
                        {item.menuItemImage ? (
                          <Image src={item.menuItemImage} alt={item.menuItemName} fill sizes="80px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-espresso/5">
                            <Coffee className="w-8 h-8 text-caramel/60" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-foreground leading-snug">
                              {item.menuItemName}
                            </h4>
                            <span className="text-sm font-bold text-caramel font-mono shrink-0">
                              {formatCurrency(item.totalPrice)}
                            </span>
                          </div>
                          {item.variant && <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.variant}</p>}
                          {item.addons && item.addons.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              +{item.addons.map((a: any) => a.name).join(", ")}
                            </p>
                          )}
                          {item.note && <p className="text-xs text-caramel italic mt-1">&quot;{item.note}&quot;</p>}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
                          <span className="text-xs text-muted-foreground">
                            Price: {formatCurrency(item.unitPrice)}
                          </span>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-muted/60 border border-border/60 rounded-lg p-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Summary for Step 1 */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm sticky top-24">
                  <h3 className="font-serif text-lg font-bold">Cart Summary</h3>

                  {/* Promo Input */}
                  <div>
                    {promoCode ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">{promoCode}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-700 dark:text-green-400">
                            -{formatCurrency(promoDiscount)}
                          </span>
                          <button onClick={clearPromo} className="text-green-500 hover:text-green-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="Promo code (e.g. WELCOME10)"
                          className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 uppercase font-mono"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="px-4 py-2 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm pt-3 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items Subtotal</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Promo Discount ({promoCode})</span>
                        <span>-{formatCurrency(promoDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>Taxes & Fees</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-caramel text-espresso rounded-xl font-bold text-base hover:bg-caramel-300 transition-all shadow-md active:scale-[0.98]"
                  >
                    Continue to Order Details <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ORDER DETAILS */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid lg:grid-cols-5 gap-8"
            >
              {/* Order Options */}
              <div className="lg:col-span-3 space-y-6">
                {/* 1. Order Type Selection */}
                <section className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
                  <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-caramel" /> Select Order Type
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {orderTypeConfig.map((type) => {
                      const Icon = type.icon;
                      const isSelected = orderType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => {
                            setOrderType(type.value);
                            setDeliveryFee(type.value === "DELIVERY" ? 49 : 0);
                          }}
                          className={cn(
                            "p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2",
                            isSelected
                              ? "border-caramel bg-caramel/10 shadow-md ring-2 ring-caramel/40"
                              : "border-border hover:border-caramel/50 hover:bg-muted/30"
                          )}
                        >
                          <Icon className={cn("w-6 h-6", isSelected ? "text-caramel" : "text-muted-foreground")} />
                          <div>
                            <div className="text-sm font-bold">{type.label}</div>
                            <div className="text-[10px] text-muted-foreground">{type.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* 2. Type-specific Fields */}
                {orderType === "DINE_IN" && (
                  <section className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-bold">Select Your Table</h3>
                      <span className="text-xs text-muted-foreground">Required for dine-in</span>
                    </div>

                    {loadingTables ? (
                      <div className="text-xs text-muted-foreground animate-pulse py-4 text-center">
                        Loading real-time table availability...
                      </div>
                    ) : realtimeTables.length === 0 ? (
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="Enter table number (e.g. 5)"
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-caramel/50"
                      />
                    ) : (
                      <div className="space-y-4">
                        <select
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-caramel/50"
                        >
                          <option value="">-- Select an Available Table --</option>
                          {realtimeTables.map((t) => (
                            <option key={t.id} value={t.number.toString()} disabled={t.status !== "FREE"}>
                              Table {t.number} ({t.zone}) - {t.capacity} Seats {t.status === "FREE" ? "🟢 Available" : `🔴 (${t.status})`}
                            </option>
                          ))}
                        </select>

                        {/* Interactive Table Cards Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                          {realtimeTables.map((t) => {
                            const isFree = t.status === "FREE";
                            const isSelected = tableNumber === t.number.toString();
                            return (
                              <button
                                type="button"
                                key={t.id}
                                disabled={!isFree}
                                onClick={() => setTableNumber(t.number.toString())}
                                className={cn(
                                  "p-3 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center justify-center gap-1",
                                  isSelected
                                    ? "border-caramel bg-caramel text-espresso font-black shadow-md scale-105"
                                    : isFree
                                    ? "border-green-500/40 bg-green-500/10 hover:border-green-500 hover:bg-green-500/20 text-foreground"
                                    : "border-border bg-muted/40 text-muted-foreground opacity-50 cursor-not-allowed"
                                )}
                              >
                                <span className="font-bold text-sm">Table {t.number}</span>
                                <span className="text-[10px] opacity-80">{t.capacity} Seats</span>
                                <span className="text-[9px] font-extrabold mt-0.5">
                                  {isSelected ? "✓ Selected" : isFree ? "🟢 Free" : "🔴 Occupied"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {orderType === "TAKEAWAY" && (
                  <section className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                    <h3 className="font-serif text-base font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-caramel" /> Pickup Time
                    </h3>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    />
                    <p className="text-xs text-muted-foreground">Standard preparation time: 15-20 minutes</p>
                  </section>
                )}

                {orderType === "DELIVERY" && (
                  <section className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                    <h3 className="font-serif text-base font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-caramel" /> Delivery Address *
                    </h3>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter complete delivery address with street, apartment number, and landmark"
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 resize-none"
                      rows={3}
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/60">
                      <Truck className="w-4 h-4 text-caramel shrink-0" />
                      <span>Flat delivery fee: <strong>{formatCurrency(49)}</strong></span>
                    </div>
                  </section>
                )}

                {/* 3. Special Notes */}
                <section className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                  <h3 className="font-serif text-base font-bold">Special Instructions / Notes</h3>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Less spicy, extra napkins, allergies, etc."
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 resize-none"
                    rows={2}
                  />
                </section>
              </div>

              {/* Step 2 Sidebar & Actions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm sticky top-24">
                  <h3 className="font-serif text-lg font-bold">Order Summary</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Order Type</span>
                      <span className="font-bold text-foreground capitalize">{orderType.toLowerCase().replace("_", "-")}</span>
                    </div>
                    {orderType === "DINE_IN" && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Selected Table</span>
                        <span className="font-bold text-caramel">{tableNumber ? `Table ${tableNumber}` : "Not selected"}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Cart Items</span>
                      <span className="font-bold text-foreground">{items.length} items</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border font-bold text-base">
                      <span>Est. Total</span>
                      <span className="text-caramel">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (validateStep2()) {
                          setCurrentStep(3);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-caramel text-espresso rounded-xl font-bold text-base hover:bg-caramel-300 transition-all shadow-md active:scale-[0.98]"
                    >
                      Continue to Payment <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setCurrentStep(1)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors text-muted-foreground"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Cart
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PAYMENT */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid lg:grid-cols-5 gap-8"
            >
              {/* Payment Details */}
              <div className="lg:col-span-3 space-y-6">
                {/* Payment Mode Selection */}
                <section className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
                  <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-caramel" /> Select Payment Method
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: "ONLINE" as const, label: "Pay Online / UPI", icon: CreditCard, sub: "Instant payment" },
                      { value: "COUNTER" as const, label: "Pay at Counter", icon: Banknote, sub: "Pay cash/card later" },
                      ...(orderType === "DELIVERY"
                        ? [{ value: "COD" as const, label: "Cash on Delivery", icon: Banknote, sub: "Pay upon arrival" }]
                        : []),
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.value;
                      return (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setPaymentMethod(method.value)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border transition-all text-center",
                            isSelected
                              ? "border-caramel bg-caramel/10 ring-2 ring-caramel/40 shadow-sm"
                              : "border-border hover:border-caramel/50"
                          )}
                        >
                          <Icon className={cn("w-5 h-5", isSelected ? "text-caramel" : "text-muted-foreground")} />
                          <span className="text-xs font-bold">{method.label}</span>
                          <span className="text-[10px] text-muted-foreground">{method.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Tip Options */}
                {orderType !== "DELIVERY" && (
                  <section className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                    <h3 className="font-serif text-base font-bold">Add a Staff Tip</h3>
                    <div className="flex gap-3">
                      {tipOptions.map((tip) => (
                        <button
                          key={tip}
                          type="button"
                          onClick={() => setTipAmount(tip)}
                          className={cn(
                            "flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all",
                            tipAmount === tip
                              ? "border-caramel bg-caramel text-espresso shadow-xs"
                              : "border-border hover:border-caramel/50"
                          )}
                        >
                          {tip === 0 ? "No Tip" : formatCurrency(tip)}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Line Items Pinned Summary */}
                <section className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                  <h3 className="font-serif text-base font-bold">Items Review ({items.length})</h3>
                  <div className="divide-y divide-border/60">
                    {items.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-foreground">{item.menuItemName}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                        </div>
                        <span className="font-mono font-bold text-caramel">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar Full Order Summary for Step 3 */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm sticky top-24">
                  <h3 className="font-serif text-lg font-bold">Final Order Summary</h3>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold text-foreground">{formatCurrency(subtotal)}</span>
                    </div>

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Promo Discount ({promoCode})</span>
                        <span className="font-mono">-{formatCurrency(promoDiscount)}</span>
                      </div>
                    )}

                    {serviceCharge > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Service Charge (5%)</span>
                        <span className="font-mono">{formatCurrency(serviceCharge)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span>CGST (2.5%)</span>
                      <span className="font-mono">{formatCurrency(taxes.cgst)}</span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>SGST (2.5%)</span>
                      <span className="font-mono">{formatCurrency(taxes.sgst)}</span>
                    </div>

                    {orderType === "DELIVERY" && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Fee</span>
                        <span className="font-mono">{formatCurrency(49)}</span>
                      </div>
                    )}

                    {tipAmount > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Staff Tip</span>
                        <span className="font-mono">{formatCurrency(tipAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-3 border-t border-border font-bold text-lg">
                      <span>Grand Total</span>
                      <span className="text-caramel font-mono text-xl">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <LoadingButton
                      onClick={handlePlaceOrder}
                      loading={loading}
                      loadingText="Placing Order..."
                      className="w-full px-6 py-4 bg-espresso text-cream rounded-xl font-bold text-base hover:bg-espresso-500 transition-all shadow-md active:scale-[0.98]"
                    >
                      Place Order & Pay
                      <ArrowRight className="w-5 h-5" />
                    </LoadingButton>

                    <button
                      onClick={() => setCurrentStep(2)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors text-muted-foreground"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Details
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-muted-foreground leading-tight">
                    By placing this order, you agree to our terms of service and privacy policy.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
