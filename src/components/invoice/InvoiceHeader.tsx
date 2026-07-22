"use client";

import React from "react";
import { MapPin, Phone, Mail, Building2, Shield } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export interface CafeDetails {
  name: string;
  tagline?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  gstin: string;
  fssai?: string;
}

export interface InvoiceHeaderProps {
  cafeDetails: CafeDetails;
  invoiceNumber: string;
  orderNumber: string;
  createdAt: string;
  type: string;
  tableNumber?: number | null;
}

export function InvoiceHeader({
  cafeDetails,
  invoiceNumber,
  orderNumber,
  createdAt,
  type,
  tableNumber,
}: InvoiceHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        {/* Left: Cafe Branding & Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-espresso text-caramel flex items-center justify-center font-serif font-bold text-lg shadow-sm border border-caramel/30 shrink-0">
              {getInitials(cafeDetails.name || "AddaDotCom")}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-espresso dark:text-caramel tracking-tight">
                {cafeDetails.name}
              </h1>
              <p className="text-xs text-muted-foreground italic font-medium">
                {cafeDetails.tagline || "Artisan Coffee, Gourmet Kitchen & Good Times"}
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-1 font-sans">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-caramel shrink-0" />
              <span>{cafeDetails.address}</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-caramel shrink-0" />
                <span>{cafeDetails.phone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-caramel shrink-0" />
                <span>{cafeDetails.email}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
              <p className="flex items-center gap-1.5 font-semibold text-foreground/80">
                <Building2 className="w-3.5 h-3.5 text-espresso dark:text-caramel shrink-0" />
                <span>GSTIN: {cafeDetails.gstin}</span>
              </p>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>FSSAI Lic #: {cafeDetails.fssai || "12824999000123"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Invoice Metadata */}
        <div className="text-left sm:text-right space-y-1.5 shrink-0">
          <div className="inline-block px-3 py-1 bg-caramel/10 border border-caramel/30 rounded-full">
            <span className="font-serif font-bold text-xs tracking-wider text-caramel uppercase">
              Tax Invoice
            </span>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Invoice No.</p>
            <p className="font-mono font-bold text-base text-foreground tracking-tight">
              {invoiceNumber}
            </p>
          </div>

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Order #: <strong className="text-foreground">{orderNumber}</strong></p>
            <p>{formatDate(createdAt)} • {formatTime(createdAt)}</p>
            <div className="pt-1 flex sm:justify-end items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-espresso/10 text-espresso dark:bg-caramel/20 dark:text-caramel uppercase">
                {type.replace("_", " ")}
              </span>
              {tableNumber && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-caramel/15 text-espresso dark:text-caramel">
                  Table {tableNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Divider */}
      <div className="relative pt-2">
        <div className="h-0.5 bg-gradient-to-r from-espresso/20 via-caramel/40 to-espresso/20" />
        <div className="h-px bg-espresso/10 mt-0.5" />
      </div>
    </div>
  );
}
