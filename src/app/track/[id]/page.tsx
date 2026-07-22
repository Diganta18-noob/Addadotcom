"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSSE } from "@/lib/useSSE";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import {
  Coffee,
  Check,
  Clock,
  UtensilsCrossed,
  Package,
  Truck,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  BellRing,
} from "lucide-react";

type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";

const steps: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "PLACED", label: "Placed", icon: "📋" },
  { key: "ACCEPTED", label: "Accepted", icon: "✅" },
  { key: "PREPARING", label: "Preparing", icon: "👨‍🍳" },
  { key: "READY", label: "Ready", icon: "🔔" },
  { key: "SERVED", label: "Served", icon: "🍽️" },
];

export default function TrackOrderPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const parsed = {
          ...data.data,
          items: typeof data.data.items === "string" ? JSON.parse(data.data.items) : data.data.items,
        };
        setOrder(parsed);

        if (parsed.status === "READY" && !showCelebration) {
          setShowCelebration(true);
          playChime();
        }
      } else {
        setError(data.message || "Order not found");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Unable to connect to order tracking service");
    } finally {
      setLoading(false);
    }
  };

  useSSE({
    "order-updated": (data) => {
      if (data.orderId === id || data.orderNumber === id) {
        setOrder((prev: any) => (prev ? { ...prev, status: data.status } : prev));
        if (data.status === "READY") {
          setShowCelebration(true);
          playChime();
        }
      }
    },
  });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-background flex flex-col items-center justify-center p-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-caramel mb-3" />
        <p className="font-serif font-bold text-lg">Connecting to Live Kitchen Stream...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-card border border-border p-8 rounded-3xl space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-serif text-2xl font-bold">Order Not Found</h2>
          <p className="text-xs text-muted-foreground">{error || "Please check your order code or link."}</p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-espresso text-cream rounded-xl text-xs font-bold hover:bg-espresso-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = steps.findIndex((s) => s.key === order.status);
  const items = Array.isArray(order.items) ? order.items : [];
  const maxPrepTime = Math.max(...items.map((i: any) => i.prepTime || 12), 10);
  const totalAmount = items.reduce((sum: number, i: any) => sum + (i.totalPrice || (i.unitPrice * (i.qty || 1)) || 0), 0);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-muted/20 text-foreground flex flex-col items-center justify-center p-4">
      {/* Celebration Modal when Ready */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowCelebration(false)} />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-card border-2 border-caramel p-8 rounded-3xl text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-caramel/20 border-2 border-caramel flex items-center justify-center mx-auto text-3xl animate-bounce">
                🎉
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Your Order is Ready!</h2>
              <p className="text-xs text-muted-foreground">
                Order <strong className="text-caramel font-mono">{order.orderNumber}</strong> is hot & fresh!
                {order.type === "DINE_IN" ? " Our staff is bringing it to your table." : " Please collect it from the counter."}
              </p>
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3 bg-caramel text-espresso font-bold text-xs rounded-xl hover:bg-caramel-300 transition-colors shadow-md"
              >
                Awesome, Got It!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg space-y-4">
        {/* Top Back Nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/order"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Link>
          <div className="flex items-center gap-1.5 font-serif font-bold text-sm text-caramel">
            <Coffee className="w-4 h-4" /> Live Tracker
          </div>
        </div>

        {/* Main Status Ticket Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          {/* Header info */}
          <div className="text-center space-y-2 border-b border-border pb-5">
            <span className="px-3 py-1 bg-caramel/10 border border-caramel/30 text-caramel rounded-full text-[10px] font-bold uppercase tracking-widest inline-block">
              {order.type.replace("_", " ")} {order.table?.number ? `• TABLE ${order.table.number}` : ""}
            </span>

            <h1 className="font-serif text-3xl font-black tracking-tight">{order.orderNumber}</h1>

            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Placed at {formatTime(order.createdAt)}
            </p>
          </div>

          {/* Stepper Display */}
          <div className="space-y-4 py-2">
            {steps.map((step, idx) => {
              const isDone = idx < currentStepIdx || order.status === "COMPLETED";
              const isCurrent = idx === currentStepIdx && order.status !== "COMPLETED";

              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all",
                      isDone
                        ? "bg-espresso text-cream shadow-sm"
                        : isCurrent
                        ? "bg-caramel text-espresso border-4 border-caramel/30 animate-pulse shadow-md"
                        : "border-2 border-border text-muted-foreground bg-muted/40"
                    )}
                  >
                    {isDone ? <Check className="w-5 h-5" /> : step.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={cn("text-sm font-bold", isCurrent ? "text-caramel font-serif text-base" : isDone ? "text-foreground" : "text-muted-foreground")}>
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-caramel bg-caramel/10 px-2 py-0.5 rounded-full border border-caramel/20">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {step.key === "PLACED" && "Order received by kitchen"}
                      {step.key === "ACCEPTED" && "Order accepted by chef"}
                      {step.key === "PREPARING" && `Preparing your meal (~${maxPrepTime} mins)`}
                      {step.key === "READY" && "Ready at the counter"}
                      {step.key === "SERVED" && "Served & enjoyed!"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Itemized list summary */}
          <div className="bg-muted/40 border border-border p-4 rounded-2xl space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Summary</p>
            <div className="space-y-1">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="font-medium">{item.qty || 1}× {item.menuItemName || item.name}</span>
                  <span className="font-mono text-muted-foreground">{formatCurrency(item.totalPrice || item.unitPrice * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border/80 pt-2 flex justify-between font-bold text-sm">
              <span>Total</span>
              <span className="font-serif text-caramel">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
