"use client";

import React from "react";
import { InvoiceHeader, CafeDetails } from "./InvoiceHeader";
import { InvoiceCustomerInfo, CustomerDetails } from "./InvoiceCustomerInfo";
import { InvoiceItemsTable, InvoiceItem } from "./InvoiceItemsTable";
import { InvoiceTotals, Financials } from "./InvoiceTotals";
import { InvoiceFooter } from "./InvoiceFooter";

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  orderId: string;
  transactionId: string;
  createdAt: string;
  type: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  staffName: string;
  tableNumber: number | null;
  tableZone?: string | null;
  customerDetails: CustomerDetails;
  cafeDetails: CafeDetails;
  items: InvoiceItem[];
  financials: Financials;
  loyaltyPoints?: number;
}

export interface InvoiceDocumentProps {
  invoice: InvoiceData;
  className?: string;
}

export function InvoiceDocument({ invoice, className = "" }: InvoiceDocumentProps) {
  const isPaid = invoice.paymentStatus?.toUpperCase() === "PAID";

  // Simple deterministic hash for invoice verification code
  const verificationHash = (invoice.orderId || invoice.invoiceNumber)
    .split("")
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000, 0)
    .toString()
    .padStart(6, "0");

  return (
    <div
      data-invoice-print="true"
      className={`bg-white text-gray-900 font-sans p-6 rounded-2xl border border-gray-200 shadow-sm print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full relative overflow-hidden space-y-6 ${className}`}
    >
      {/* Subtle "PAID" Ink Watermark */}
      {isPaid && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-30 pointer-events-none select-none z-0 opacity-[0.04] print:opacity-[0.06]">
          <span className="font-serif font-black text-9xl tracking-widest text-emerald-800 uppercase">
            PAID
          </span>
        </div>
      )}

      {/* Section 1: Restaurant Brand Header */}
      <div className="relative z-10">
        <InvoiceHeader
          cafeDetails={invoice.cafeDetails}
          invoiceNumber={invoice.invoiceNumber}
          orderNumber={invoice.orderNumber}
          createdAt={invoice.createdAt}
          type={invoice.type}
          tableNumber={invoice.tableNumber}
        />
      </div>

      {/* Section 2: Customer & Order Info */}
      <div className="relative z-10">
        <InvoiceCustomerInfo
          customerDetails={invoice.customerDetails}
          staffName={invoice.staffName}
          tableNumber={invoice.tableNumber}
          tableZone={invoice.tableZone}
          type={invoice.type}
          paymentMethod={invoice.paymentMethod}
          paymentStatus={invoice.paymentStatus}
          transactionId={invoice.transactionId}
        />
      </div>

      {/* Section 3: Itemized Products Table */}
      <div className="relative z-10">
        <InvoiceItemsTable items={invoice.items} />
      </div>

      {/* Section 4: Financial Breakdown & GST Summary */}
      <div className="relative z-10">
        <InvoiceTotals
          financials={invoice.financials}
          paymentMethod={invoice.paymentMethod}
          paymentStatus={invoice.paymentStatus}
        />
      </div>

      {/* Section 5: Brand Footer, Loyalty & QR */}
      <div className="relative z-10">
        <InvoiceFooter
          loyaltyPoints={invoice.loyaltyPoints || 25}
          invoiceNumber={invoice.invoiceNumber}
        />
      </div>

      {/* Section 6: Verification Code Strip */}
      <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-[9px] text-gray-400 font-mono relative z-10">
        <span>Doc ID: {invoice.invoiceNumber}</span>
        <span>Verification Code: Hash-{verificationHash}</span>
      </div>
    </div>
  );
}
