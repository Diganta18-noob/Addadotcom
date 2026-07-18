"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
  Minus,
  Plus,
  Trash2,
  Tag,
  X,
} from "lucide-react";
import { useCartStore } from "@/store";
import { cn, formatCurrency, generateOrderNumber } from "@/lib/utils";
import toast from "react-hot-toast";

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

  const [promoInput, setPromoInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COUNTER" | "COD">("ONLINE");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [liveOrderStatus, setLiveOrderStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [realtimeTables, setRealtimeTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  React.useEffect(() => {
    if (orderType === "DINE_IN") {
      setLoadingTables(true);
      fetch("/api/tables")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setRealtimeTables(data.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingTables(false));
    }
  }, [orderType]);

  // Sync live order status periodically if an active order exists
  React.useEffect(() => {
    const targetId = activeOrder?.id || activeOrder?.orderNumber;
    if (targetId) {
      const fetchStatus = async () => {
        try {
          const res = await fetch(`/api/orders/${targetId}`);
          const data = await res.json();
          if (data.success && data.data?.status) {
            setLiveOrderStatus(data.data.status);
          }
        } catch (err) {}
      };
      fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [activeOrder]);

  const subtotal = getSubtotal();
  const taxes = getTaxes();
  const serviceCharge = getServiceCharge();
  const total = getTotal();

  const handleApplyPromo = () => {
    if (!promoInput) return;
    const code = promoInput.toUpperCase();
    if (code === "WELCOME10") {
      const discount = subtotal * 0.1;
      setPromoCode(code, Math.min(discount, 200));
      toast.success("10% discount applied! (Max ₹200)");
    } else if (code === "FIRST50") {
      setPromoCode(code, Math.min(50, subtotal));
      toast.success("₹50 discount applied!");
    } else {
      toast.error("Invalid promo code");
    }
    setPromoInput("");
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (orderType === "DINE_IN" && !tableNumber) {
      toast.error("Please enter your table number");
      return;
    }
    if (orderType === "DELIVERY" && !deliveryAddress) {
      toast.error("Please enter your delivery address");
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
      <div className="pt-20 pb-24 lg:pb-12 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center px-4 space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold">Active Order</h1>
          <p className="text-muted-foreground">
            Your order has been placed and is being prepared!
          </p>

          <div className="p-5 rounded-xl bg-caramel/10 border border-caramel/20">
            <p className="text-sm text-muted-foreground mb-1">Order Number / Code</p>
            <p className="font-mono text-2xl font-bold text-caramel tracking-wider">
              {displayOrderNum}
            </p>
            {activeOrder?.tableNumber && (
              <p className="text-xs text-muted-foreground mt-2">
                Table Number: <span className="font-bold text-foreground">{activeOrder.tableNumber}</span>
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-border bg-card text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Status</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-caramel/10 text-caramel">
                {currentStatus}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 pulse-dot" />
              <span className="text-sm font-medium">Order Received</span>
            </div>
            <div className="ml-1.5 border-l-2 border-border pl-5 space-y-3 py-1 text-sm">
              <div className={cn("flex items-center gap-3", ["ACCEPTED", "PREPARING", "READY", "SERVED", "COMPLETED"].includes(currentStatus) ? "text-foreground font-semibold" : "text-muted-foreground")}>
                <div className="w-2 h-2 rounded-full bg-border" />
                <span>Accepted by kitchen</span>
              </div>
              <div className={cn("flex items-center gap-3", ["PREPARING", "READY", "SERVED", "COMPLETED"].includes(currentStatus) ? "text-foreground font-semibold" : "text-muted-foreground")}>
                <div className="w-2 h-2 rounded-full bg-border" />
                <span>Preparing your order</span>
              </div>
              <div className={cn("flex items-center gap-3", ["READY", "SERVED", "COMPLETED"].includes(currentStatus) ? "text-foreground font-semibold" : "text-muted-foreground")}>
                <div className="w-2 h-2 rounded-full bg-border" />
                <span>Ready for pickup / serve</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {trackId && (
              <Link
                href={`/track/${trackId}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-caramel text-espresso font-bold rounded-xl text-sm hover:bg-caramel-400 transition-colors"
              >
                Track Live Order Progress <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  clearActiveOrder();
                  setOrderPlaced(false);
                }}
                className="flex-1 px-4 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors text-center"
              >
                Place New Order
              </button>
              <Link
                href="/menu"
                className="flex-1 px-4 py-3 bg-espresso text-cream rounded-xl text-sm font-medium hover:bg-espresso-500 transition-colors text-center"
              >
                Browse Menu
              </Link>
            </div>
          </div>
        </motion.div>
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
    <div className="pt-20 pb-24 lg:pb-12">
      {/* Header */}
      <div className="bg-espresso text-cream py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">Checkout</h1>
          <p className="text-cream-200/70 mt-2">Review and place your order</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Order Details */}
          <div className="lg:col-span-3 space-y-8">
            {/* Order Type */}
            <section>
              <h2 className="font-serif text-lg font-bold mb-4">Order Type</h2>
              <div className="grid grid-cols-3 gap-3">
                {orderTypeConfig.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => {
                        setOrderType(type.value);
                        if (type.value === "DELIVERY") setDeliveryFee(49);
                        else setDeliveryFee(0);
                      }}
                      className={cn(
                        "p-4 rounded-xl border text-center transition-all hover:-translate-y-0.5",
                        orderType === type.value
                          ? "border-caramel bg-caramel/10 shadow-md"
                          : "border-border hover:border-caramel/50"
                      )}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-sm font-semibold">{type.label}</div>
                      <div className="text-[10px] text-muted-foreground">{type.description}</div>
                    </button>
                  );
                })}
              </div>

              {/* Conditional fields */}
              {orderType === "DINE_IN" && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium block">Select Table Number *</label>
                  {loadingTables ? (
                    <div className="text-xs text-muted-foreground animate-pulse py-2">
                      Loading real-time table availability...
                    </div>
                  ) : realtimeTables.length === 0 ? (
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Enter table number (e.g. 5)"
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    />
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-caramel/50"
                      >
                        <option value="">-- Select an Available Table --</option>
                        {realtimeTables.map((t) => (
                          <option key={t.id} value={t.number.toString()} disabled={t.status !== "FREE"}>
                            Table {t.number} ({t.zone}) - {t.capacity} Seats {t.status === "FREE" ? "🟢 Available" : `🔴 (${t.status})`}
                          </option>
                        ))}
                      </select>

                      {/* Interactive table cards */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                                "p-2.5 rounded-xl border text-center text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1",
                                isSelected
                                  ? "border-caramel bg-caramel text-espresso font-bold shadow-md scale-105"
                                  : isFree
                                  ? "border-green-500/40 bg-green-500/10 hover:border-green-500 hover:bg-green-500/20"
                                  : "border-border bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"
                              )}
                            >
                              <span className="font-bold text-sm">Table {t.number}</span>
                              <span className="text-[10px] opacity-80">{t.capacity} Seats</span>
                              <span className="text-[9px] font-bold">
                                {isSelected ? "✓ Selected" : isFree ? "🟢 Free" : "🔴 Occupied"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {orderType === "TAKEAWAY" && (
                <div className="mt-4">
                  <label className="text-sm font-medium mb-1.5 block">Pickup Time</label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                  />
                </div>
              )}
              {orderType === "DELIVERY" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Delivery Address *</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Full address with landmark"
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 resize-none"
                      rows={3}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Delivery fee: {formatCurrency(49)} • Min order: {formatCurrency(200)}
                  </p>
                </div>
              )}
            </section>

            {/* Cart Items */}
            <section>
              <h2 className="font-serif text-lg font-bold mb-4">
                Your Items ({items.length})
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                    <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      {item.menuItemImage ? (
                        <img src={item.menuItemImage} alt={item.menuItemName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">☕</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold">{item.menuItemName}</h4>
                      {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
                      {item.addons.length > 0 && (
                        <p className="text-xs text-muted-foreground">+{item.addons.map(a => a.name).join(", ")}</p>
                      )}
                      {item.note && <p className="text-xs text-caramel italic">&quot;{item.note}&quot;</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-caramel">{formatCurrency(item.totalPrice)}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted">
                            <Plus className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeItem(item.id)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-100 text-muted-foreground hover:text-red-500 ml-1">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Order notes */}
            <section>
              <h2 className="font-serif text-lg font-bold mb-4">Order Notes</h2>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any special requests for your order..."
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 resize-none"
                rows={2}
              />
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="font-serif text-lg font-bold mb-4">Payment</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: "ONLINE" as const, label: "Pay Online", icon: CreditCard },
                  { value: "COUNTER" as const, label: "Pay at Counter", icon: Banknote },
                  ...(orderType === "DELIVERY" ? [{ value: "COD" as const, label: "Cash on Delivery", icon: Banknote }] : []),
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border transition-all",
                        paymentMethod === method.value
                          ? "border-caramel bg-caramel/10"
                          : "border-border hover:border-caramel/50"
                      )}
                    >
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 p-6 rounded-2xl border border-border bg-card space-y-6">
              <h2 className="font-serif text-lg font-bold">Order Summary</h2>

              {/* Promo Code */}
              <div>
                {promoCode ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">{promoCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
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
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-espresso text-cream rounded-lg text-sm font-medium hover:bg-espresso-500 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Tip */}
              {orderType !== "DELIVERY" && (
                <div>
                  <p className="text-sm font-medium mb-2">Add a tip</p>
                  <div className="flex gap-2">
                    {tipOptions.map((tip) => (
                      <button
                        key={tip}
                        onClick={() => setTipAmount(tip)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium border transition-all",
                          tipAmount === tip
                            ? "border-caramel bg-caramel/10 text-caramel"
                            : "border-border hover:border-caramel/50"
                        )}
                      >
                        {tip === 0 ? "None" : formatCurrency(tip)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Promo ({promoCode})</span>
                    <span>-{formatCurrency(promoDiscount)}</span>
                  </div>
                )}
                {serviceCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Charge (5%)</span>
                    <span>{formatCurrency(serviceCharge)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST (2.5%)</span>
                  <span>{formatCurrency(taxes.cgst)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST (2.5%)</span>
                  <span>{formatCurrency(taxes.sgst)}</span>
                </div>
                {orderType === "DELIVERY" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>{formatCurrency(49)}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tip</span>
                    <span>{formatCurrency(tipAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-serif text-lg font-bold">Total</span>
                  <span className="font-serif text-xl font-bold text-caramel">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-espresso text-cream rounded-xl font-semibold hover:bg-espresso-500 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Placing Order..." : "Place Order"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-center text-muted-foreground">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
