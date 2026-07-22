"use client";

import React, { useState, useEffect } from "react";
import { Document, Page, View, Text, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { InvoiceData } from "./InvoiceDocument";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: "#D4A056",
    paddingBottom: 12,
    marginBottom: 15,
  },
  brandTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#4B2E2B",
    marginBottom: 2,
  },
  brandSub: {
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 1,
  },
  invoiceBadge: {
    backgroundColor: "#FDF8F0",
    borderWidth: 1,
    borderColor: "#D4A056",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  invoiceBadgeText: {
    color: "#D4A056",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  metaText: {
    fontSize: 8,
    color: "#4B2E2B",
    textAlign: "right",
  },
  metaTextBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textAlign: "right",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  infoCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  cardValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  cardSub: {
    fontSize: 8,
    color: "#4B2E2B",
  },
  table: {
    width: "100%",
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#4B2E2B",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  colNo: { width: "6%" },
  colDesc: { width: "54%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  itemName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  itemSub: {
    fontSize: 7,
    color: "#6B7280",
  },
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  gstSummary: {
    width: "55%",
  },
  totalsBox: {
    width: "40%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    fontSize: 8,
    color: "#4B2E2B",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FDF8F0",
    borderWidth: 1,
    borderColor: "#D4A056",
    borderRadius: 6,
    padding: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  grandTotalText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#4B2E2B",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    textAlign: "center",
  },
  footerTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#4B2E2B",
    marginBottom: 2,
  },
  footerText: {
    fontSize: 7,
    color: "#6B7280",
  },
});

export function InvoicePDFDocument({ invoice }: { invoice: InvoiceData }) {
  const { cafeDetails, customerDetails, financials, items } = invoice;
  const subtotal = financials.subtotal || 0;
  const serviceCharge = financials.serviceCharge || 0;
  const cgst = Math.round(subtotal * 0.025 * 100) / 100;
  const sgst = Math.round(subtotal * 0.025 * 100) / 100;

  return (
    <Document title={`Invoice-${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>{cafeDetails.name || "AddaDotCom Cafe"}</Text>
            <Text style={styles.brandSub}>{cafeDetails.address}</Text>
            <Text style={styles.brandSub}>
              Ph: {cafeDetails.phone} | GSTIN: {cafeDetails.gstin}
            </Text>
          </View>

          <View>
            <View style={styles.invoiceBadge}>
              <Text style={styles.invoiceBadgeText}>TAX INVOICE</Text>
            </View>
            <Text style={styles.metaTextBold}>{invoice.invoiceNumber}</Text>
            <Text style={styles.metaText}>Order #: {invoice.orderNumber}</Text>
            <Text style={styles.metaText}>
              {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Customer & Order Metadata */}
        <View style={styles.infoCard}>
          <View style={styles.infoCol}>
            <Text style={styles.cardTitle}>Customer</Text>
            <Text style={styles.cardValue}>
              {customerDetails?.name && customerDetails.name !== "N/A"
                ? customerDetails.name
                : "Walk-in Guest"}
            </Text>
            <Text style={styles.cardSub}>{customerDetails?.phone || ""}</Text>
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.cardTitle}>Dining Type</Text>
            <Text style={styles.cardValue}>{invoice.type}</Text>
            <Text style={styles.cardSub}>
              {invoice.tableNumber ? `Table ${invoice.tableNumber}` : "Counter"}
            </Text>
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.cardTitle}>Payment</Text>
            <Text style={styles.cardValue}>{invoice.paymentStatus}</Text>
            <Text style={styles.cardSub}>{invoice.paymentMethod}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Item Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>

          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colNo}>{idx + 1}</Text>
              <View style={styles.colDesc}>
                <Text style={styles.itemName}>{item.menuItemName || item.menuItemId}</Text>
                {item.variant && <Text style={styles.itemSub}>Option: {item.variant}</Text>}
              </View>
              <Text style={styles.colQty}>{item.qty || 1}</Text>
              <Text style={styles.colPrice}>₹{(item.unitPrice || 0).toFixed(2)}</Text>
              <Text style={styles.colTotal}>
                ₹{(item.totalPrice || (item.unitPrice || 0) * (item.qty || 1)).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsContainer}>
          <View style={styles.gstSummary}>
            <Text style={styles.cardTitle}>Statutory GST Summary (SAC: 996331)</Text>
            <Text style={styles.footerText}>CGST (2.5%): ₹{cgst.toFixed(2)}</Text>
            <Text style={styles.footerText}>SGST (2.5%): ₹{sgst.toFixed(2)}</Text>
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text>Subtotal</Text>
              <Text>₹{subtotal.toFixed(2)}</Text>
            </View>
            {serviceCharge > 0 && (
              <View style={styles.totalsRow}>
                <Text>Service Charge (5%)</Text>
                <Text>₹{serviceCharge.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text>CGST (2.5%)</Text>
              <Text>₹{cgst.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>SGST (2.5%)</Text>
              <Text>₹{sgst.toFixed(2)}</Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalText}>Grand Total</Text>
              <Text style={styles.grandTotalText}>₹{financials.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Thank You for Dining with Us!</Text>
          <Text style={styles.footerText}>
            Bills once printed cannot be modified. Visit us online at www.addadotcom.cafe
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export interface DownloadPDFButtonProps {
  invoice: InvoiceData;
  className?: string;
}

export function DownloadPDFButton({ invoice, className }: DownloadPDFButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button
        disabled
        className={
          className ||
          "px-4 py-2 bg-espresso text-cream rounded-xl text-xs font-bold flex items-center gap-2 opacity-50"
        }
      >
        <Loader2 className="w-4 h-4 animate-spin" /> Preparing PDF...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<InvoicePDFDocument invoice={invoice} />}
      fileName={`invoice-${invoice.invoiceNumber}.pdf`}
      className={
        className ||
        "px-4 py-2 bg-espresso text-cream rounded-xl text-xs font-bold hover:bg-espresso-500 transition-colors flex items-center gap-2 shadow-sm"
      }
    >
      {({ loading }) =>
        loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" /> Download PDF
          </>
        )
      }
    </PDFDownloadLink>
  );
}
