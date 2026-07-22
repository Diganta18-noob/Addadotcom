"use client";

import React from "react";
import { User, Utensils, CreditCard, Banknote, Smartphone, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomerDetails {
  name?: string;
  email?: string;
  phone?: string;
}

export interface InvoiceCustomerInfoProps {
  customerDetails?: CustomerDetails | null;
  staffName?: string;
  tableNumber?: number | null;
  tableZone?: string | null;
  type: string;
  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string;
}

export function InvoiceCustomerInfo({
  customerDetails,
  staffName = "Staff Member",
  tableNumber,
  tableZone,
  type,
  paymentMethod = "CASH",
  paymentStatus = "UNPAID",
  transactionId,
}: InvoiceCustomerInfoProps) {
  const getPaymentIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case "CARD":
        return <CreditCard className="w-3.5 h-3.5 text-caramel shrink-0" />;
      case "UPI":
        return <Smartphone className="w-3.5 h-3.5 text-caramel shrink-0" />;
      default:
        return <Banknote className="w-3.5 h-3.5 text-caramel shrink-0" />;
    }
  };

  const isPaid = paymentStatus?.toUpperCase() === "PAID";

  return (
    <div className="bg-muted/30 dark:bg-muted/20 border border-border/70 rounded-xl p-3.5 text-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Column 1: Customer */}
      <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-border/50 pb-3 sm:pb-0 sm:pr-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <User className="w-3 h-3 text-caramel" /> Customer Details
        </p>
        <p className="font-bold text-foreground text-sm truncate">
          {customerDetails?.name && customerDetails.name !== "N/A"
            ? customerDetails.name
            : "Walk-in Guest"}
        </p>
        {customerDetails?.phone && customerDetails.phone !== "N/A" && (
          <p className="text-muted-foreground font-mono">{customerDetails.phone}</p>
        )}
        {customerDetails?.email && customerDetails.email !== "N/A" && (
          <p className="text-muted-foreground truncate">{customerDetails.email}</p>
        )}
      </div>

      {/* Column 2: Order Info & Staff */}
      <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-border/50 pb-3 sm:pb-0 sm:pr-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Utensils className="w-3 h-3 text-caramel" /> Dining Info
        </p>
        <p className="font-semibold text-foreground">
          {type.replace("_", " ")}
          {tableNumber ? ` • Table ${tableNumber}` : ""}
          {tableZone ? ` (${tableZone})` : ""}
        </p>
        <p className="text-muted-foreground">
          Billed by: <strong className="text-foreground font-medium">{staffName}</strong>
        </p>
      </div>

      {/* Column 3: Payment */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-caramel" /> Payment Summary
        </p>
        <div className="flex items-center gap-2 pt-0.5">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1",
              isPaid
                ? "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
            )}
          >
            {isPaid ? "PAID IN FULL" : paymentStatus}
          </span>
          <span className="font-bold text-foreground uppercase inline-flex items-center gap-1">
            {getPaymentIcon(paymentMethod)}
            {paymentMethod}
          </span>
        </div>
        {transactionId && (
          <p className="text-[10px] text-muted-foreground font-mono pt-0.5 truncate">
            Txn Ref: {transactionId}
          </p>
        )}
      </div>
    </div>
  );
}
