"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";

export interface TaxDetail {
  name: string;
  rate: number;
  amount: number;
}

export interface DiscountDetail {
  label: string;
  amount: number;
}

export interface Financials {
  subtotal: number;
  discounts?: DiscountDetail[];
  serviceCharge?: number;
  serviceChargeRate?: number;
  deliveryFee?: number;
  taxes?: TaxDetail[];
  roundingAdj?: number;
  total: number;
  balance?: number;
}

export interface InvoiceTotalsProps {
  financials: Financials;
  paymentMethod?: string;
  paymentStatus?: string;
}

export function InvoiceTotals({
  financials,
  paymentMethod = "CASH",
  paymentStatus = "PAID",
}: InvoiceTotalsProps) {
  const {
    subtotal = 0,
    discounts = [],
    serviceCharge = 0,
    serviceChargeRate = 5,
    deliveryFee = 0,
    taxes = [],
    roundingAdj = 0,
    total = 0,
    balance = 0,
  } = financials;

  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);

  // Compute CGST and SGST for GST Summary table
  const cgstTax = taxes.find((t) => t.name.toUpperCase().includes("CGST")) || {
    name: "CGST",
    rate: 2.5,
    amount: Math.round(subtotal * 0.025 * 100) / 100,
  };

  const sgstTax = taxes.find((t) => t.name.toUpperCase().includes("SGST")) || {
    name: "SGST",
    rate: 2.5,
    amount: Math.round(subtotal * 0.025 * 100) / 100,
  };

  const isPaid = paymentStatus?.toUpperCase() === "PAID";

  return (
    <div className="space-y-4 pt-2">
      {/* Financial Lines Block */}
      <div className="max-w-xs ml-auto text-xs space-y-1.5 font-sans">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono">{formatCurrency(subtotal)}</span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount</span>
            <span className="font-mono">-{formatCurrency(totalDiscount)}</span>
          </div>
        )}

        {serviceCharge > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Service Charge ({serviceChargeRate}%)</span>
            <span className="font-mono">{formatCurrency(serviceCharge)}</span>
          </div>
        )}

        {deliveryFee > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            <span className="font-mono">{formatCurrency(deliveryFee)}</span>
          </div>
        )}

        {/* CGST & SGST */}
        <div className="flex justify-between text-muted-foreground">
          <span>CGST ({cgstTax.rate}%)</span>
          <span className="font-mono">{formatCurrency(cgstTax.amount)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>SGST ({sgstTax.rate}%)</span>
          <span className="font-mono">{formatCurrency(sgstTax.amount)}</span>
        </div>

        {roundingAdj !== 0 && (
          <div className="flex justify-between text-[11px] text-muted-foreground italic">
            <span>Rounding Adjustment</span>
            <span className="font-mono">{roundingAdj > 0 ? `+${roundingAdj.toFixed(2)}` : roundingAdj.toFixed(2)}</span>
          </div>
        )}

        {/* Highlighted Grand Total Box */}
        <div className="bg-caramel/10 border border-caramel/30 rounded-xl p-3 flex justify-between items-center my-2 shadow-sm">
          <div>
            <p className="font-serif font-bold text-base text-espresso dark:text-caramel">
              Grand Total
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-medium">
              Incl. all taxes & fees
            </p>
          </div>
          <span className="font-serif font-bold text-xl text-espresso dark:text-caramel font-mono">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Payment & Balance Status */}
        <div className="text-right text-[11px] space-y-0.5 pt-1">
          {isPaid ? (
            <p className="text-green-600 font-semibold">
              ✓ Paid in full via {paymentMethod}
            </p>
          ) : (
            <>
              <p className="text-muted-foreground">Amount Paid: {formatCurrency(total - balance)}</p>
              {balance > 0 && (
                <p className="text-red-500 font-bold">Balance Due: {formatCurrency(balance)}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Statutory GST Breakdown Table */}
      <div className="border-t border-border/60 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          GST Statutory Breakdown (SAC: 996331 — Food & Beverage Services)
        </p>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="py-1.5 px-2.5">HSN/SAC</th>
                <th className="py-1.5 px-2.5 text-right">Taxable Amount</th>
                <th className="py-1.5 px-2.5 text-right">CGST ({cgstTax.rate}%)</th>
                <th className="py-1.5 px-2.5 text-right">SGST ({sgstTax.rate}%)</th>
                <th className="py-1.5 px-2.5 text-right">Total Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              <tr>
                <td className="py-1.5 px-2.5 font-sans font-medium text-foreground">996331</td>
                <td className="py-1.5 px-2.5 text-right">{formatCurrency(subtotal - totalDiscount + serviceCharge)}</td>
                <td className="py-1.5 px-2.5 text-right">{formatCurrency(cgstTax.amount)}</td>
                <td className="py-1.5 px-2.5 text-right">{formatCurrency(sgstTax.amount)}</td>
                <td className="py-1.5 px-2.5 text-right font-bold text-foreground">
                  {formatCurrency(cgstTax.amount + sgstTax.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
