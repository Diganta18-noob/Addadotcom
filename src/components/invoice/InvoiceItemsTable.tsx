"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";

export interface InvoiceItem {
  menuItemId?: string;
  menuItemName: string;
  qty: number;
  unitPrice: number;
  totalPrice?: number;
  variant?: string;
  addons?: any[];
  discountAmount?: number;
  taxAmount?: number;
  isVeg?: boolean;
}

export interface InvoiceItemsTableProps {
  items: InvoiceItem[];
}

export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  const getItemNameAndTag = (name: string) => {
    const isVegTag = name.toUpperCase().includes("VEG") && !name.toUpperCase().includes("NON-VEG");
    const isNonVegTag = name.toUpperCase().includes("NON-VEG") || name.toUpperCase().includes("CHICKEN") || name.toUpperCase().includes("MUTTON") || name.toUpperCase().includes("EGG");
    const cleanName = name.replace(/\[(VEG|NON-VEG)\]/gi, "").trim();

    return { cleanName, isVegTag, isNonVegTag };
  };

  const totalQty = items.reduce((sum, item) => sum + (item.qty || 1), 0);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-border/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/60 border-b border-border/80 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
            <tr>
              <th className="py-2.5 px-3 w-8 text-center">#</th>
              <th className="py-2.5 px-3">Item & Details</th>
              <th className="py-2.5 px-3 text-center w-14">Qty</th>
              <th className="py-2.5 px-3 text-right w-20">Price</th>
              <th className="py-2.5 px-3 text-right w-20 hidden sm:table-cell">Discount</th>
              <th className="py-2.5 px-3 text-right w-20 hidden sm:table-cell">Tax</th>
              <th className="py-2.5 px-3 text-right w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map((item, idx) => {
              const { cleanName, isVegTag, isNonVegTag } = getItemNameAndTag(item.menuItemName || item.menuItemId || "Item");
              const lineTotal = item.totalPrice || item.unitPrice * (item.qty || 1);
              const addonsList = Array.isArray(item.addons)
                ? item.addons.map((a: any) => (typeof a === "string" ? a : a.name)).filter(Boolean)
                : [];

              return (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-muted/10" : "bg-transparent"}
                >
                  <td className="py-2.5 px-3 text-center text-muted-foreground font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      {/* Dietary Dot */}
                      {(item.isVeg !== undefined ? item.isVeg : isVegTag) ? (
                        <span className="w-2.5 h-2.5 rounded-full border border-green-600 bg-green-500/20 flex items-center justify-center shrink-0" title="Vegetarian">
                          <span className="w-1 h-1 rounded-full bg-green-600" />
                        </span>
                      ) : isNonVegTag ? (
                        <span className="w-2.5 h-2.5 rounded-full border border-red-600 bg-red-500/20 flex items-center justify-center shrink-0" title="Non-Vegetarian">
                          <span className="w-1 h-1 rounded-full bg-red-600" />
                        </span>
                      ) : null}
                      <span>{cleanName}</span>
                    </div>

                    {/* Variant */}
                    {item.variant && (
                      <p className="text-[11px] text-muted-foreground italic pl-4">
                        Option: {item.variant}
                      </p>
                    )}

                    {/* Addons */}
                    {addonsList.length > 0 && (
                      <p className="text-[10px] text-caramel pl-4">
                        + Addons: {addonsList.join(", ")}
                      </p>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center font-semibold font-mono text-foreground">
                    {item.qty || 1}
                  </td>

                  <td className="py-2.5 px-3 text-right text-muted-foreground font-mono">
                    {formatCurrency(item.unitPrice || 0)}
                  </td>

                  <td className="py-2.5 px-3 text-right text-green-600 font-mono hidden sm:table-cell">
                    {item.discountAmount && item.discountAmount > 0
                      ? `-${formatCurrency(item.discountAmount)}`
                      : "—"}
                  </td>

                  <td className="py-2.5 px-3 text-right text-muted-foreground font-mono hidden sm:table-cell">
                    {item.taxAmount && item.taxAmount > 0
                      ? formatCurrency(item.taxAmount)
                      : "—"}
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold text-foreground font-mono">
                    {formatCurrency(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-[11px] text-muted-foreground px-2 font-medium">
        <span>Total Items: <strong className="text-foreground">{items.length}</strong> ({totalQty} total qty)</span>
        <span>All prices inclusive of applicable base taxes</span>
      </div>
    </div>
  );
}
