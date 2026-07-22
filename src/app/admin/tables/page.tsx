"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared";
import { useSSE } from "@/lib/useSSE";
import { QRCodeSVG } from "qrcode.react";
import {
  Users,
  Receipt,
  Sparkles,
  RefreshCw,
  UserPlus,
  QrCode,
  Grid,
  Printer,
  Coffee,
} from "lucide-react";
import toast from "react-hot-toast";

type TableStatus = "FREE" | "RESERVED" | "OCCUPIED" | "BILL_REQUESTED" | "NEEDS_CLEANING";
type Zone = "INDOOR" | "OUTDOOR" | "TERRACE";

interface TableData {
  id: string;
  number: number;
  capacity: number;
  zone: Zone;
  status: TableStatus;
}

const statusColors: Record<TableStatus, string> = {
  FREE: "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800",
  RESERVED: "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800",
  OCCUPIED: "border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800",
  BILL_REQUESTED: "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800",
  NEEDS_CLEANING: "border-gray-300 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700",
};

export default function AdminTables() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<"ALL" | Zone>("ALL");
  const [activeTab, setActiveTab] = useState<"grid" | "qrcodes">("grid");
  const [origin, setOrigin] = useState("https://addadotcom.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();
      if (data.success) {
        setTables(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time SSE listener
  useSSE({
    "table-updated": () => fetchTables(),
    "bill-paid": () => fetchTables(),
  });

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const filteredTables = selectedZone === "ALL"
    ? tables
    : tables.filter((t) => t.zone === selectedZone);

  const updateStatus = async (id: string, status: TableStatus) => {
    const prev = tables.find((t) => t.id === id);
    if (!prev) return;

    setTables((prevList) => prevList.map((t) => (t.id === id ? { ...t, status } : t)));

    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) {
        setTables((prevList) => prevList.map((t) => (t.id === id ? { ...t, status: prev.status } : t)));
        toast.error("Failed to update table status");
        return;
      }
      toast.success(`Table ${prev.number} → ${status.replace("_", " ").toLowerCase()}`);
    } catch {
      setTables((prevList) => prevList.map((t) => (t.id === id ? { ...t, status: prev.status } : t)));
      toast.error("Failed to update table status");
    }
  };

  const handlePrintQRCodes = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const zoneCounts = {
    ALL: tables.length,
    INDOOR: tables.filter((t) => t.zone === "INDOOR").length,
    OUTDOOR: tables.filter((t) => t.zone === "OUTDOOR").length,
    TERRACE: tables.filter((t) => t.zone === "TERRACE").length,
  };

  const statusCounts = {
    FREE: tables.filter((t) => t.status === "FREE").length,
    OCCUPIED: tables.filter((t) => t.status === "OCCUPIED").length,
    RESERVED: tables.filter((t) => t.status === "RESERVED").length,
  };

  if (loading && tables.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-muted/60 rounded-xl" />
          <div className="h-20 bg-muted/60 rounded-xl" />
          <div className="h-20 bg-muted/60 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top View Toggle & Print Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("grid")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "grid" ? "bg-espresso text-cream shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Grid className="w-4 h-4" /> Live Table Grid
          </button>
          <button
            onClick={() => setActiveTab("qrcodes")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "qrcodes" ? "bg-espresso text-cream shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <QrCode className="w-4 h-4" /> Table QR Generator
          </button>
        </div>

        {activeTab === "qrcodes" && (
          <button
            onClick={handlePrintQRCodes}
            className="px-4 py-2 bg-espresso text-cream rounded-xl text-xs font-bold hover:bg-espresso-500 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Table Tent Cards
          </button>
        )}
      </div>

      {activeTab === "grid" ? (
        <>
          {/* Status Summary Cards */}
          <div className="grid grid-cols-3 gap-4 print:hidden">
            <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-4 text-center">
              <p className="text-2xl font-bold font-serif text-green-700 dark:text-green-400">{statusCounts.FREE}</p>
              <p className="text-sm text-green-600 dark:text-green-500 font-medium">Available</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 text-center">
              <p className="text-2xl font-bold font-serif text-amber-700 dark:text-amber-400">{statusCounts.OCCUPIED}</p>
              <p className="text-sm text-amber-600 dark:text-amber-500 font-medium">Occupied</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4 text-center">
              <p className="text-2xl font-bold font-serif text-blue-700 dark:text-blue-400">{statusCounts.RESERVED}</p>
              <p className="text-sm text-blue-600 dark:text-blue-500 font-medium">Reserved</p>
            </div>
          </div>

          {/* Zone filter */}
          <div className="flex items-center gap-2 print:hidden">
            {(["ALL", "INDOOR", "OUTDOOR", "TERRACE"] as const).map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedZone === zone ? "bg-espresso text-cream" : "bg-muted hover:bg-muted/80"
                )}
              >
                {zone === "ALL" ? "All" : zone.charAt(0) + zone.slice(1).toLowerCase()} ({zoneCounts[zone]})
              </button>
            ))}
            <button
              onClick={() => { setLoading(true); fetchTables(); }}
              className="ml-auto px-3 py-2 bg-muted border border-border rounded-lg text-sm hover:bg-muted/80 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredTables.map((table, i) => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "rounded-xl border-2 p-4 transition-all hover:shadow-lg cursor-pointer group",
                  statusColors[table.status]
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif text-lg font-bold">T{table.number}</span>
                  <StatusBadge status={table.status} />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Users className="w-3.5 h-3.5" />
                  <span>{table.capacity} seats</span>
                  <span className="text-xs">• {table.zone}</span>
                </div>

                <div className="space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {table.status === "FREE" && (
                    <>
                      <button
                        onClick={() => updateStatus(table.id, "OCCUPIED")}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-espresso text-cream rounded-lg text-xs font-medium hover:bg-espresso-500 transition-colors"
                      >
                        <UserPlus className="w-3 h-3" /> Seat Guests
                      </button>
                      <button
                        onClick={() => updateStatus(table.id, "RESERVED")}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <Sparkles className="w-3 h-3" /> Mark Reserved
                      </button>
                    </>
                  )}
                  {table.status === "OCCUPIED" && (
                    <button
                      onClick={() => updateStatus(table.id, "BILL_REQUESTED")}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                      <Receipt className="w-3 h-3" /> Request Bill
                    </button>
                  )}
                  {table.status === "BILL_REQUESTED" && (
                    <button
                      onClick={() => updateStatus(table.id, "NEEDS_CLEANING")}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-espresso text-cream rounded-lg text-xs font-medium hover:bg-espresso-500 transition-colors"
                    >
                      <Receipt className="w-3 h-3" /> Bill Paid
                    </button>
                  )}
                  {table.status === "NEEDS_CLEANING" && (
                    <button
                      onClick={() => updateStatus(table.id, "FREE")}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" /> Mark Clean
                    </button>
                  )}
                  {table.status === "RESERVED" && (
                    <button
                      onClick={() => updateStatus(table.id, "OCCUPIED")}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-espresso text-cream rounded-lg text-xs font-medium hover:bg-espresso-500 transition-colors"
                    >
                      <UserPlus className="w-3 h-3" /> Seat Party
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        /* QR Code Printable Tent Cards Section */
        <div className="space-y-6">
          <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between print:hidden">
            <div>
              <h3 className="font-serif text-lg font-bold">Printable Table QR Tent Cards</h3>
              <p className="text-xs text-muted-foreground">
                Place these QR cards on dining tables. Customers scan with any camera app to order directly from Table 1–12.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
            {tables.map((table) => {
              const qrUrl = `${origin}/order?table=${table.number}&qr=1`;
              return (
                <div
                  key={table.id}
                  className="bg-white text-gray-900 border-2 border-caramel/40 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 shadow-md print:shadow-none print:border-gray-300 print:p-4 break-inside-avoid"
                >
                  <div className="flex items-center justify-center gap-1.5 text-espresso font-serif font-bold text-sm">
                    <Coffee className="w-4 h-4 text-caramel" /> AddaDotCom Cafe
                  </div>

                  <div className="space-y-0.5">
                    <span className="font-serif text-3xl font-black tracking-tight text-espresso block">
                      TABLE {table.number}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-caramel block">
                      {table.zone} ZONE • {table.capacity} SEATS
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <QRCodeSVG value={qrUrl} size={130} level="H" includeMargin={true} />
                  </div>

                  <div className="space-y-0.5 pt-1">
                    <p className="font-bold text-xs text-gray-800">Scan Code to Order & Pay</p>
                    <p className="text-[10px] text-gray-500 italic max-w-[180px] mx-auto">
                      View menu, customize dishes & send orders straight to our kitchen
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
