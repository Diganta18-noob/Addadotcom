"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency, generateBillNumber } from "@/lib/utils";
import { StatusBadge } from "@/components/shared";
import {
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  Minus,
  Trash2,
  Percent,
  Tag,
  Split,
  Download,
  Printer,
  Calculator,
  CheckCircle,
  X,
  ChevronDown,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface BillItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
  variant?: string;
}

interface Discount {
  label: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  amount: number;
}

interface Payment {
  method: "CASH" | "CARD" | "UPI";
  amount: number;
}

interface TableData {
  id: string;
  number: number;
  capacity: number;
  zone: string;
  status: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  type: string;
  tableId: string | null;
  status: string;
  items: any;
  notes: string | null;
}

export default function AdminBilling() {
  const [isMounted, setIsMounted] = useState(false);
  const [tables, setTables] = useState<TableData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Current active order for selected table
  const [activeOrder, setActiveOrder] = useState<OrderData | null>(null);

  // Bill States
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [billPaid, setBillPaid] = useState(false);
  const [billNumber, setBillNumber] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(true);
  const [serviceChargeRate, setServiceChargeRate] = useState(5); // 5%
  const [cgstRate] = useState(2.5);
  const [sgstRate] = useState(2.5);

  // Payment UI
  const [showPayment, setShowPayment] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<"CASH" | "CARD" | "UPI">("CASH");

  // Split UI
  const [splitMode, setSplitMode] = useState<"none" | "equal" | "items">("none");
  const [splitCount, setSplitCount] = useState(2);

  // Receipt UI
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch initial data using pure async/await with explicit error handling (No Promise.all)
  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // 1. Fetch tables
    try {
      const tablesRes = await fetch("/api/tables");
      if (!tablesRes.ok) throw new Error(`Tables API error: ${tablesRes.status}`);
      const tablesData = await tablesRes.json();
      if (tablesData.success && Array.isArray(tablesData.data)) {
        setTables(tablesData.data);
        setSelectedTableId((prev) => prev || (tablesData.data.length > 0 ? tablesData.data[0].id : ""));
      }
    } catch (error) {
      console.error("Error fetching tables in billing:", error);
    }

    // 2. Fetch orders
    try {
      const ordersRes = await fetch("/api/orders?today=true");
      if (!ordersRes.ok) throw new Error(`Orders API error: ${ordersRes.status}`);
      const ordersData = await ordersRes.json();
      if (ordersData.success && Array.isArray(ordersData.data)) {
        const parsed = ordersData.data.map((order: any) => ({
          ...order,
          items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
        }));
        setOrders(parsed);
      }
    } catch (error) {
      console.error("Error fetching orders in billing:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, [fetchData]);

  // Update billing state when selected table or orders change
  useEffect(() => {
    if (!selectedTableId || orders.length === 0) {
      setActiveOrder(null);
      setBillItems([]);
      setBillPaid(false);
      return;
    }

    // Find the active DINE_IN order for this table
    const tableOrder = orders.find(
      (o) =>
        o.tableId === selectedTableId &&
        o.type === "DINE_IN" &&
        !["COMPLETED", "CANCELLED"].includes(o.status)
    );

    if (tableOrder) {
      setActiveOrder(tableOrder);
      const itemsList = Array.isArray(tableOrder.items) ? tableOrder.items : [];
      const mappedItems: BillItem[] = itemsList.map((item: any, idx: number) => ({
        id: item.menuItemId || String(idx),
        name: item.menuItemName,
        qty: item.qty,
        unitPrice: item.unitPrice,
        total: item.totalPrice || item.unitPrice * item.qty,
        variant: item.variant || undefined,
      }));
      setBillItems(mappedItems);
      setBillPaid(tableOrder.status === "COMPLETED");
    } else {
      setActiveOrder(null);
      setBillItems([]);
      setBillPaid(false);
    }

    // Generate/reset bill number
    setBillNumber(generateBillNumber());
    setDiscounts([]);
    setPayments([]);
    setCashAmount("");
    setPromoCode("");
    setShowPayment(false);
    setShowReceipt(false);
  }, [selectedTableId, orders]);

  // Calculations
  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const discountTotal = discounts.reduce((sum, d) => sum + d.amount, 0);
  const afterDiscount = Math.max(0, subtotal - discountTotal);
  const serviceCharge = serviceChargeEnabled ? Math.round(afterDiscount * (serviceChargeRate / 100) * 100) / 100 : 0;
  const taxableAmount = afterDiscount + serviceCharge;
  const cgst = Math.round(taxableAmount * (cgstRate / 100) * 100) / 100;
  const sgst = Math.round(taxableAmount * (sgstRate / 100) * 100) / 100;
  const rawTotal = afterDiscount + serviceCharge + cgst + sgst;
  const roundingAdj = Math.round(rawTotal) - rawTotal;
  const grandTotal = Math.round(rawTotal);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, grandTotal - totalPaid);

  const updateItemQty = (id: string, delta: number) => {
    setBillItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = Math.max(0, item.qty + delta);
          if (newQty === 0) return item;
          return { ...item, qty: newQty, total: newQty * item.unitPrice };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addDiscount = (type: "PERCENTAGE" | "FIXED", value: number, label: string) => {
    const amount = type === "PERCENTAGE"
      ? Math.round(subtotal * (value / 100) * 100) / 100
      : Math.min(value, subtotal);

    setDiscounts((prev) => [...prev, { label, type, value, amount }]);
    toast.success(`Discount applied: ${label}`);
  };

  const applyPromo = () => {
    if (!promoCode) return;
    const code = promoCode.toUpperCase();
    if (code === "WELCOME10") {
      addDiscount("PERCENTAGE", 10, "WELCOME10 (10%)");
    } else if (code === "FIRST50") {
      addDiscount("FIXED", 50, "FIRST50 (₹50 off)");
    } else {
      toast.error("Invalid promo code");
    }
    setPromoCode("");
  };

  const recordPayment = async () => {
    if (!activeOrder) {
      toast.error("No active order for this table to pay");
      return;
    }

    const amount = currentPaymentMethod === "CASH"
      ? parseFloat(cashAmount) || balance
      : balance;

    if (amount <= 0) return;

    const newPayments = [...payments, { method: currentPaymentMethod, amount: Math.min(amount, balance) }];
    setPayments(newPayments);
    setCashAmount("");

    const newBalance = balance - Math.min(amount, balance);
    if (newBalance <= 0) {
      // POST the full payment to database
      setLoading(true);
      try {
        const res = await fetch("/api/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: activeOrder.id,
            subtotal,
            discounts: discounts.map((d) => ({
              label: d.label,
              type: d.type,
              value: d.value,
              amount: d.amount,
            })),
            serviceCharge,
            serviceChargeRate,
            taxes: [
              { name: "CGST", rate: cgstRate, amount: cgst },
              { name: "SGST", rate: sgstRate, amount: sgst },
            ],
            total: grandTotal,
            roundingAdj,
            payments: newPayments,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setBillPaid(true);
          toast.success("Bill paid in full and saved!");
          fetchData(); // Refresh tables and orders
        } else {
          toast.error("Failed to save bill transaction");
        }
      } catch (error) {
        toast.error("Error connecting to billing system");
      } finally {
        setLoading(false);
      }
    } else {
      toast.success(`${currentPaymentMethod} payment of ${formatCurrency(amount)} recorded`);
    }
  };

  const changeAmount = currentPaymentMethod === "CASH" && cashAmount
    ? Math.max(0, parseFloat(cashAmount) - balance)
    : 0;

  const selectedTableNumber = tables.find((t) => t.id === selectedTableId)?.number || "?";

  if (loading && tables.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-10 bg-muted/60 rounded-xl w-64" />
            <div className="h-64 bg-muted/40 rounded-2xl border border-border" />
            <div className="h-40 bg-muted/40 rounded-2xl border border-border" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-muted/50 rounded-2xl border border-border" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Bill Builder */}
        <div className="lg:col-span-3 space-y-6">
          {/* Table selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Table:</span>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-caramel/50"
              >
                {tables.map((table) => {
                  const hasOrder = orders.some(
                    (o) =>
                      o.tableId === table.id &&
                      o.type === "DINE_IN" &&
                      !["COMPLETED", "CANCELLED"].includes(o.status)
                  );
                  return (
                    <option key={table.id} value={table.id}>
                      T{table.number} {hasOrder ? "• (Occupied)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <StatusBadge status={billPaid ? "PAID" : activeOrder ? "UNPAID" : "NO ACTIVE ORDER"} size="md" />
            <button
              onClick={() => { setLoading(true); fetchData(); }}
              className="ml-auto px-3 py-2 bg-muted border border-border rounded-lg text-sm hover:bg-muted/80 transition-colors"
              title="Refresh console"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>

          {/* Items Table */}
          {billItems.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-semibold text-base mb-1">No Active Order</h3>
              <p className="text-sm text-muted-foreground">
                Table {selectedTableNumber} currently has no active dine-in orders.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Item</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase w-32">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase w-24">Price</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase w-24">Total</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {billItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{item.name}</p>
                          {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateItemQty(item.id, -1)}
                              className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted"
                              disabled={billPaid}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-semibold w-6 text-center text-sm">{item.qty}</span>
                            <button
                              onClick={() => updateItemQty(item.id, 1)}
                              className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted"
                              disabled={billPaid}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">{formatCurrency(item.total)}</td>
                        <td className="px-2 py-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors"
                            disabled={billPaid}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Discounts */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Percent className="w-4 h-4 text-caramel" /> Discounts & Promos
                </h3>

                {/* Quick discounts */}
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => addDiscount("PERCENTAGE", pct, `${pct}% Discount`)}
                      className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors"
                      disabled={billPaid}
                    >
                      {pct}% Off
                    </button>
                  ))}
                  <button
                    onClick={() => addDiscount("FIXED", 100, "₹100 Off")}
                    className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors"
                    disabled={billPaid}
                  >
                    ₹100 Off
                  </button>
                </div>

                {/* Promo code */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    disabled={billPaid}
                  />
                  <button
                    onClick={applyPromo}
                    className="px-4 py-2 bg-espresso text-cream rounded-lg text-sm font-medium hover:bg-espresso-500 transition-colors"
                    disabled={billPaid}
                  >
                    Apply
                  </button>
                </div>

                {/* Active discounts */}
                {discounts.length > 0 && (
                  <div className="space-y-1">
                    {discounts.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-green-600 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {d.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">-{formatCurrency(d.amount)}</span>
                          <button
                            onClick={() => setDiscounts((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-red-500"
                            disabled={billPaid}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Split Bill */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Split className="w-4 h-4 text-caramel" /> Split Bill
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSplitMode("none")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      splitMode === "none" ? "bg-espresso text-cream" : "bg-muted"
                    )}
                  >
                    No Split
                  </button>
                  <button
                    onClick={() => setSplitMode("equal")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      splitMode === "equal" ? "bg-espresso text-cream" : "bg-muted"
                    )}
                  >
                    Split Equally
                  </button>
                </div>
                {splitMode === "equal" && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Split between:</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSplitCount(Math.max(2, splitCount - 1))} className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold w-6 text-center">{splitCount}</span>
                      <button onClick={() => setSplitCount(splitCount + 1)} className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted">
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-sm text-muted-foreground">people</span>
                    </div>
                    <span className="text-sm font-semibold text-caramel">
                      {formatCurrency(Math.ceil(grandTotal / splitCount))} each
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Bill Summary */}
        {billItems.length > 0 && (
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold">Bill Summary</h3>
                  <span className="font-mono text-xs text-muted-foreground">{isMounted ? billNumber : ""}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discounts</span>
                      <span>-{formatCurrency(discountTotal)}</span>
                    </div>
                  )}
                  {serviceChargeEnabled && (
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Service Charge ({serviceChargeRate}%)</span>
                        <button
                          onClick={() => setServiceChargeEnabled(!serviceChargeEnabled)}
                          className="text-xs text-red-500 hover:text-red-600"
                          disabled={billPaid}
                        >
                          remove
                        </button>
                      </div>
                      <span>{formatCurrency(serviceCharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST ({cgstRate}%)</span>
                    <span>{formatCurrency(cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST ({sgstRate}%)</span>
                    <span>{formatCurrency(sgst)}</span>
                  </div>
                  {roundingAdj !== 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Rounding</span>
                      <span>{roundingAdj > 0 ? "+" : ""}{roundingAdj.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="font-serif text-xl font-bold">Grand Total</span>
                    <span className="font-sans text-xl font-bold text-caramel">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* Payments recorded */}
                {payments.length > 0 && (
                  <div className="space-y-1 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Payments</p>
                    {payments.map((p, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="capitalize">{p.method.toLowerCase()}</span>
                        <span className="text-green-600">{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                    {!billPaid && (
                      <div className="flex justify-between text-sm font-semibold pt-1 border-t border-dashed border-border">
                        <span>Balance Due</span>
                        <span className="text-red-500">{formatCurrency(balance)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment buttons */}
                {!billPaid ? (
                  <div className="space-y-3 pt-3">
                    <div className="flex gap-2">
                      {(["CASH", "CARD", "UPI"] as const).map((method) => {
                        const icons = { CASH: Banknote, CARD: CreditCard, UPI: Smartphone };
                        const Icon = icons[method];
                        return (
                          <button
                            key={method}
                            onClick={() => setCurrentPaymentMethod(method)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                              currentPaymentMethod === method
                                ? "border-caramel bg-caramel/10 text-caramel"
                                : "border-border hover:border-caramel/50"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {method}
                          </button>
                        );
                      })}
                    </div>

                    {currentPaymentMethod === "CASH" && (
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                          placeholder={`Amount (Balance: ${formatCurrency(balance)})`}
                          className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                        />
                        {cashAmount && parseFloat(cashAmount) > balance && (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <Calculator className="w-3.5 h-3.5" />
                            Change: {formatCurrency(changeAmount)}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={recordPayment}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-espresso text-cream rounded-xl font-semibold hover:bg-espresso-500 transition-all"
                    >
                      <Receipt className="w-4 h-4" />
                      Record {currentPaymentMethod} Payment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-3">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Bill Paid</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowReceipt(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <Printer className="w-4 h-4" /> Print
                      </button>
                      <button
                        onClick={() => {
                          toast.success("Receipt PDF downloaded!");
                          setShowReceipt(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-espresso text-cream rounded-xl text-sm font-medium hover:bg-espresso-500 transition-colors"
                      >
                        <Download className="w-4 h-4" /> PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowReceipt(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-[320px] bg-white text-black p-6 rounded-xl shadow-2xl font-mono text-xs"
            >
              <button
                onClick={() => setShowReceipt(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Thermal Receipt */}
              <div className="text-center space-y-2 mb-4">
                <h2 className="text-lg font-bold">☕ AddaDotCom</h2>
                <p className="text-[10px] text-gray-500">
                  123 Café Street, Salt Lake Sector V<br />
                  Kolkata 700091 • +91 98765 43210
                </p>
                <div className="border-t border-dashed border-gray-300 pt-2">
                  <p className="font-bold">{billNumber}</p>
                  <p className="text-gray-500">{new Date().toLocaleString("en-IN")}</p>
                  <p>Table: {selectedTableNumber} • Cashier: Admin</p>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 py-2 space-y-1">
                {billItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.qty}× {item.name}{item.variant ? ` (${item.variant})` : ""}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-300 py-2 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatCurrency(discountTotal)}</span></div>
                )}
                {serviceCharge > 0 && (
                  <div className="flex justify-between"><span>Service ({serviceChargeRate}%)</span><span>{formatCurrency(serviceCharge)}</span></div>
                )}
                <div className="flex justify-between"><span>CGST ({cgstRate}%)</span><span>{formatCurrency(cgst)}</span></div>
                <div className="flex justify-between"><span>SGST ({sgstRate}%)</span><span>{formatCurrency(sgst)}</span></div>
                {roundingAdj !== 0 && (
                  <div className="flex justify-between"><span>Rounding</span><span>{roundingAdj.toFixed(2)}</span></div>
                )}
              </div>

              <div className="border-t border-dashed border-gray-300 py-2">
                <div className="flex justify-between text-base font-bold">
                  <span>TOTAL</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 py-2 space-y-1">
                {payments.map((p, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="capitalize">{p.method.toLowerCase()}</span>
                    <span>{formatCurrency(p.amount)}</span>
                  </div>
                ))}
                {changeAmount > 0 && (
                  <div className="flex justify-between font-bold">
                    <span>Change</span>
                    <span>{formatCurrency(changeAmount)}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-3 border-t border-dashed border-gray-300 space-y-1">
                <p className="font-bold">Thank you for dining with us!</p>
                <p className="text-[10px] text-gray-500">Visit again — www.addadotcom.cafe</p>
                <p className="text-[10px] text-gray-400">GST: 29AABCA1234B1Z5</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
