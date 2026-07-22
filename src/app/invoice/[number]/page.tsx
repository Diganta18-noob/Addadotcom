"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { InvoiceDocument, InvoiceData } from "@/components/invoice/InvoiceDocument";
import { DownloadPDFButton } from "@/components/invoice/InvoicePDF";
import { Printer, Loader2, AlertCircle, Coffee, ArrowLeft, RefreshCw } from "lucide-react";

export default function PublicInvoicePage() {
  const params = useParams();
  const number = params?.number as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = async () => {
    if (!number) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/public?number=${encodeURIComponent(number)}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setInvoice(data.data);
      } else {
        setError(data.message || "Invoice not found or unavailable.");
      }
    } catch (err) {
      console.error("Error fetching public invoice:", err);
      setError("Unable to load invoice at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [number]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-foreground flex flex-col items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      {/* Header bar (Hidden on print) */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 print:hidden">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-caramel transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cafe Menu
        </Link>
        <div className="flex items-center gap-1.5 font-serif font-bold text-sm text-caramel">
          <Coffee className="w-4 h-4" /> AddaDotCom Digital Receipt
        </div>
      </div>

      {loading ? (
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-12 w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
          <Loader2 className="w-10 h-10 animate-spin text-caramel" />
          <p className="text-sm text-neutral-300 font-semibold">Retrieving Digital Receipt...</p>
        </div>
      ) : error || !invoice ? (
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-8 sm:p-12 w-full max-w-2xl text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-white">Invoice Not Found</h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              {error || "We couldn't find a paid digital receipt matching this invoice code."}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={fetchInvoice}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-caramel text-espresso rounded-xl text-xs font-bold hover:bg-caramel-300 transition-colors"
            >
              Visit Homepage
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-4 print:space-y-0">
          {/* Action Toolbar (Hidden on Print) */}
          <div className="bg-neutral-800/90 backdrop-blur-md border border-neutral-700/80 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg print:hidden">
            <div className="text-xs">
              <span className="text-neutral-400">Invoice: </span>
              <strong className="text-white font-mono">{invoice.invoiceNumber}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <DownloadPDFButton invoice={invoice} />
            </div>
          </div>

          {/* Invoice Document Wrapper */}
          <div className="shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
            <InvoiceDocument invoice={invoice} />
          </div>
        </div>
      )}
    </div>
  );
}
