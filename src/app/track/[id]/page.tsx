"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { StatusBadge, MenuCardSkeleton } from "@/components/shared";
import {
  CheckCircle,
  Clock,
  ChevronRight,
  ArrowLeft,
  Coffee,
  ShoppingBag,
  UtensilsCrossed,
  Package,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED";

interface OrderData {
  id: string;
  orderNumber: string;
  type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  status: OrderStatus;
  notes?: string;
  total: number;
  items: Array<{
    menuItemName: string;
    qty: number;
    variant?: string;
  }>;
}

const statusSteps: { status: OrderStatus; label: string; description: string }[] = [
  { status: "PLACED", label: "Order Placed", description: "Your order is received and waiting for acceptance." },
  { status: "ACCEPTED", label: "Accepted", description: "The kitchen has accepted your order." },
  { status: "PREPARING", label: "Preparing", description: "Our chef is cooking your delicious meal." },
  { status: "READY", label: "Ready", description: "Food is ready for serving, pickup, or delivery." },
  { status: "COMPLETED", label: "Completed", description: "Thank you for dining with us!" },
];

export default function OrderTrackerPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  // Poll for updates in real-time or fall back to simulated updates
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          // fallback mock order for demo
          setOrder({
            id: params.id,
            orderNumber: params.id.startsWith("ORD") ? params.id : "ORD-20260717-X9Z8",
            type: "DINE_IN",
            status: "PREPARING",
            total: 658,
            items: [{ menuItemName: "Espresso Bloom", qty: 2, variant: "Large" }],
          });
        }
      } catch {
        setOrder({
          id: params.id,
          orderNumber: "ORD-20260717-X9Z8",
          type: "DINE_IN",
          status: "PREPARING",
          total: 658,
          items: [{ menuItemName: "Espresso Bloom", qty: 2, variant: "Large" }],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Setup polling every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (loading) {
    return (
      <div className="pt-24 max-w-xl mx-auto px-4 text-center">
        <MenuCardSkeleton />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 max-w-xl mx-auto px-4 text-center">
        <p className="text-red-500">Order not found.</p>
      </div>
    );
  }

  const currentStepIdx = statusSteps.findIndex((s) => s.status === order.status);

  return (
    <div className="pt-24 pb-16 max-w-xl mx-auto px-4 space-y-6">
      {/* Header link */}
      <Link href="/menu" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Menu
      </Link>

      {/* Main Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Live Order Tracking</span>
            <h2 className="font-mono text-xl font-bold mt-0.5">{order.orderNumber}</h2>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              Order Type: {order.type.replace("_", " ")}
            </p>
          </div>
          <StatusBadge status={order.status} size="md" />
        </div>

        {/* Steps timeline */}
        <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={step.status} className="flex gap-4 relative">
                {/* Step dot */}
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 z-10",
                  isCompleted ? "bg-espresso border-espresso text-cream" : "bg-card border-border text-muted-foreground",
                  isCurrent && "pulse-dot"
                )}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                </div>

                {/* Step Content */}
                <div className="space-y-0.5 pt-0.5">
                  <p className={cn(
                    "text-sm font-semibold",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items Summary card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold flex items-center gap-2">
          <ShoppingBag className="w-4.5 h-4.5 text-caramel" /> Items Ordered
        </h3>
        <div className="divide-y divide-border">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2 text-sm first:pt-0 last:pb-0">
              <div>
                <span className="font-medium">{item.qty}× {item.menuItemName}</span>
                {item.variant && <span className="text-xs text-muted-foreground ml-1">({item.variant})</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-4 flex justify-between items-center text-sm font-bold">
          <span>Total Price</span>
          <span className="text-caramel font-serif text-base">{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
