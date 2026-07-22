"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";
import { StatusBadge, SearchInput, EmptyState } from "@/components/shared";
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  CalendarDays,
  User,
  Phone,
  RefreshCw,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Reservation {
  id: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  date: string;
  timeSlot: string;
  status: "PENDING" | "CONFIRMED" | "SEATED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
  table?: { number: number } | null;
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "today">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newRes, setNewRes] = useState<Partial<Reservation>>({
    guestName: "",
    guestPhone: "",
    partySize: 2,
    date: new Date().toISOString().split("T")[0],
    timeSlot: "19:00",
    notes: "",
  });

  const fetchReservations = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservations?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      const data = await res.json();
      if (data.success) {
        setReservations(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchReservations();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchReservations]);

  const handleStatusChange = async (id: string, status: Reservation["status"]) => {
    const prev = reservations.find((r) => r.id === id);
    if (!prev) return;

    // Optimistic update
    setReservations((prevRes) =>
      prevRes.map((r) => (r.id === id ? { ...r, status } : r))
    );

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) {
        setReservations((prevRes) =>
          prevRes.map((r) => (r.id === id ? { ...r, status: prev.status } : r))
        );
        toast.error(data.error || "Failed to update reservation status");
        return;
      }
      toast.success(`Reservation status updated to ${status.toLowerCase()}`);
    } catch {
      setReservations((prevRes) =>
        prevRes.map((r) => (r.id === id ? { ...r, status: prev.status } : r))
      );
      toast.error("Failed to update reservation status");
    }
  };

  const handleAddReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.guestName || !newRes.guestPhone || !newRes.date || !newRes.timeSlot) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: newRes.guestName,
          guestPhone: newRes.guestPhone,
          date: newRes.date,
          timeSlot: newRes.timeSlot,
          partySize: newRes.partySize,
          notes: newRes.notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Reservation created successfully");
        setIsAdding(false);
        setNewRes({
          guestName: "",
          guestPhone: "",
          partySize: 2,
          date: new Date().toISOString().split("T")[0],
          timeSlot: "19:00",
          notes: "",
        });
        fetchReservations();
      } else {
        toast.error(data.error || "Failed to create reservation");
      }
    } catch {
      toast.error("Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch = r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.guestPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (activeTab === "pending") return r.status === "PENDING";
    if (activeTab === "confirmed") return r.status === "CONFIRMED";
    if (activeTab === "today") {
      const rDateStr = new Date(r.date).toISOString().split("T")[0];
      return rDateStr === todayStr;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          {(["all", "pending", "confirmed", "today"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                activeTab === tab ? "bg-espresso text-cream" : "bg-muted hover:bg-muted/80"
              )}
            >
              {tab === "all" ? "All Bookings" : tab}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => { setLoading(true); fetchReservations(); }}
            className="px-3 py-2 bg-muted border border-border rounded-lg text-sm hover:bg-muted/80 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> Book Table
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-md">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by guest name or phone..."
        />
      </div>

      {loading && reservations.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-caramel" />
          <span className="ml-3 text-muted-foreground">Loading reservations...</span>
        </div>
      ) : (
        /* Grid of Reservations */
        filteredReservations.length === 0 ? (
          <EmptyState title="No bookings found" description={reservations.length === 0 ? "Bookings placed by customers will appear here" : "Try selecting a different filter or search term."} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReservations.map((res) => (
              <motion.div
                key={res.id}
                layout
                className="rounded-2xl border border-border bg-card p-5 space-y-4 hover:shadow-md transition-shadow relative"
              >
                {/* Top Row: Name and status */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-serif font-bold text-base">{res.guestName}</h3>
                    <p className="text-xs text-muted-foreground">{res.guestPhone}</p>
                  </div>
                  <StatusBadge status={res.status} />
                </div>

                {/* Middle Row: Time details */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="w-3.5 h-3.5 text-caramel" />
                    <span className="font-medium text-foreground">{formatDate(res.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-caramel" />
                    <span className="font-medium text-foreground">{res.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-caramel" />
                    <span className="font-medium text-foreground">{res.partySize} guests</span>
                  </div>
                  {res.table?.number && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="font-bold text-caramel font-serif text-[10px]">T</span>
                      <span className="font-medium text-foreground">Table {res.table.number}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {res.notes && (
                  <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl italic">
                    📝 {res.notes}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {res.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(res.id, "CONFIRMED")}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(res.id, "CANCELLED")}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </button>
                    </>
                  )}
                  {res.status === "CONFIRMED" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(res.id, "SEATED")}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-espresso text-cream rounded-xl text-xs font-semibold hover:bg-espresso-500 transition-colors"
                      >
                        Seat Party
                      </button>
                      <button
                        onClick={() => handleStatusChange(res.id, "NO_SHOW")}
                        className="px-3 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors text-muted-foreground"
                      >
                        No Show
                      </button>
                    </>
                  )}
                  {res.status === "SEATED" && (
                    <button
                      onClick={() => handleStatusChange(res.id, "COMPLETED")}
                      className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-muted text-foreground border border-border rounded-xl text-xs font-semibold hover:bg-muted/80 transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Book Table Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg bg-background p-6 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-serif text-xl font-bold mb-4">Book a Table</h3>

              <form onSubmit={handleAddReservation} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Guest Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={newRes.guestName}
                      onChange={(e) => setNewRes((prev) => ({ ...prev, guestName: e.target.value }))}
                      placeholder="Guest full name"
                      className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={newRes.guestPhone}
                      onChange={(e) => setNewRes((prev) => ({ ...prev, guestPhone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold mb-1 block">Date *</label>
                    <input
                      type="date"
                      value={newRes.date}
                      onChange={(e) => setNewRes((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Time *</label>
                    <select
                      value={newRes.timeSlot}
                      onChange={(e) => setNewRes((prev) => ({ ...prev, timeSlot: e.target.value }))}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    >
                      {["12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "21:00"].map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Party Size *</label>
                  <select
                    value={newRes.partySize}
                    onChange={(e) => setNewRes((prev) => ({ ...prev, partySize: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((size) => (
                      <option key={size} value={size}>{size} {size === 1 ? "person" : "people"}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Notes / Special Requests</label>
                  <textarea
                    value={newRes.notes}
                    onChange={(e) => setNewRes((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="E.g. vegetarian preference, wheelchair access, high chair..."
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors"
                  >
                    Create Reservation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
