"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { InvoiceDocument, InvoiceData } from "./InvoiceDocument";
import { DownloadPDFButton } from "./InvoicePDF";

export interface InvoiceModalProps {
  orderId: string | null;
  onClose: () => void;
}

export function InvoiceModal({ orderId, onClose }: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch invoice details when orderId changes
  useEffect(() => {
    if (!orderId) {
      setInvoice(null);
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${orderId}/invoice`);
        const data = await res.json();
        if (data.success && data.data) {
          setInvoice(data.data);
        } else {
          setError(data.message || "Failed to load tax invoice");
        }
      } catch (err) {
        setError("Error connecting to invoice server");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [orderId]);

  // Handle Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const copyInvoiceNumber = () => {
    if (!invoice?.invoiceNumber) return;
    navigator.clipboard.writeText(invoice.invoiceNumber);
    setCopied(true);
    toast.success(`Copied ${invoice.invoiceNumber} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!orderId) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-modal-title"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static"
      >
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none"
        >
          {/* Sticky Modal Header (no text overlap!) */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40 shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-caramel animate-pulse" />
              <h2 id="invoice-modal-title" className="font-serif font-bold text-base text-foreground">
                Tax Invoice Preview
              </h2>
              {invoice && (
                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                  {invoice.invoiceNumber}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close invoice"
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 print:p-0 print:overflow-visible">
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-caramel mx-auto" />
                <p className="text-sm font-semibold text-muted-foreground">
                  Generating Tax Invoice & Financial Statements...
                </p>
              </div>
            ) : error ? (
              <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
                <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
                <h3 className="font-serif text-lg font-bold">Invoice Unavailable</h3>
                <p className="text-xs text-muted-foreground">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-muted border border-border rounded-xl text-xs font-semibold hover:bg-muted/80"
                >
                  Close Window
                </button>
              </div>
            ) : invoice ? (
              <InvoiceDocument invoice={invoice} />
            ) : null}
          </div>

          {/* Sticky Action Footer (Hidden on print) */}
          {invoice && !loading && !error && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-border bg-muted/40 shrink-0 print:hidden">
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                Cashier: <strong className="text-foreground">{invoice.staffName}</strong>
              </span>

              <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
                <button
                  onClick={copyInvoiceNumber}
                  className="px-3 py-2 bg-muted border border-border rounded-xl text-xs font-semibold hover:bg-muted/80 transition-colors flex items-center gap-1.5"
                  title="Copy Invoice Number"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden xs:inline">{copied ? "Copied!" : "Copy #"}</span>
                </button>

                <DownloadPDFButton invoice={invoice} />

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-caramel text-espresso rounded-xl text-xs font-bold hover:bg-caramel-300 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
