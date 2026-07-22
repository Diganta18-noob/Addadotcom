"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Sparkles, Coffee, Globe, PhoneCall, Copy } from "lucide-react";
import toast from "react-hot-toast";

export interface InvoiceFooterProps {
  loyaltyPoints?: number;
  invoiceNumber: string;
  invoiceBaseUrl?: string;
  websiteUrl?: string;
  supportPhone?: string;
  termsText?: string;
}

export function InvoiceFooter({
  loyaltyPoints = 0,
  invoiceNumber,
  invoiceBaseUrl,
  websiteUrl = "www.addadotcom.cafe",
  supportPhone = "+91 98765 43210",
  termsText = "Bills once printed cannot be modified. Subject to local jurisdiction. E. & O.E.",
}: InvoiceFooterProps) {
  const qrUrl = `${invoiceBaseUrl || "https://addadotcom.vercel.app"}/invoice/${invoiceNumber}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(qrUrl)
        .then(() => toast.success("Invoice link copied!"))
        .catch(() => toast.error("Failed to copy link"));
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-dashed border-caramel/40 text-center font-sans">
      {/* Thank you & Loyalty */}
      <div className="space-y-1">
        <h3 className="font-serif text-lg font-bold text-espresso dark:text-caramel flex items-center justify-center gap-1.5">
          <Coffee className="w-4 h-4 text-caramel" />
          Thank You for Visiting!
        </h3>
        <p className="text-xs text-muted-foreground italic">
          We hope to see you again soon for another delicious experience
        </p>

        {loyaltyPoints > 0 && (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              You earned <strong>{loyaltyPoints}</strong> loyalty points on this visit!
            </span>
          </div>
        )}
      </div>

      {/* QR Code & Digital Receipt Link */}
      <div
        aria-label="QR code for digital invoice receipt"
        className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2 bg-muted/20 border border-border/60 rounded-xl p-3 max-w-md mx-auto print:bg-white print:border-gray-200"
      >
        <div className="bg-white p-1.5 rounded-lg border border-border/80 shadow-xs shrink-0 print:border-gray-300">
          <QRCodeSVG value={qrUrl} size={72} level="M" />
        </div>
        <div className="text-left text-xs space-y-0.5 max-w-xs">
          <p className="font-bold text-foreground">Scan for Digital Receipt</p>
          <p className="text-muted-foreground text-[11px]">
            Scan with any camera app to view your itemized e-receipt & leave feedback online.
          </p>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-caramel hover:text-caramel-300 underline transition-colors pt-0.5 print:hidden cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            Copy invoice link
          </button>
        </div>
      </div>

      {/* Socials & Support */}
      <div className="text-xs text-muted-foreground space-y-1 print:hidden">
        <div className="flex items-center justify-center gap-4 font-medium">
          <span className="flex items-center gap-1 hover:text-caramel transition-colors">
            <Globe className="w-3.5 h-3.5 text-caramel" /> {websiteUrl}
          </span>
          <span className="flex items-center gap-1 hover:text-caramel transition-colors">
            <PhoneCall className="w-3.5 h-3.5 text-caramel" /> {supportPhone}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <span>Instagram: @addadotcom.cafe</span>
          <span>•</span>
          <span>Facebook: @addadotcom</span>
        </div>
      </div>

      {/* Terms */}
      <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground space-y-1">
        <p>{termsText}</p>
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
          Powered by AddaDotCom POS System • All Rights Reserved
        </p>
      </div>
    </div>
  );
}
