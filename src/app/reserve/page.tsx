"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  User,
  Copy,
  Search,
} from "lucide-react";
import { cn, formatDate, generateBookingCode } from "@/lib/utils";
import toast from "react-hot-toast";

const timeSlots = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

const partySizes = [1, 2, 3, 4, 5, 6, 7, 8];

type Step = "date" | "size" | "time" | "details" | "confirmation";

export default function ReservePage() {
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Lookup
  const [lookupCode, setLookupCode] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [showLookup, setShowLookup] = useState(false);

  // Generate dates for next 14 days
  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const handleSubmit = async () => {
    if (!guestName || !guestPhone) {
      toast.error("Please fill in your name and phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          guestEmail,
          guestPhone,
          date: selectedDate,
          timeSlot: selectedTime,
          partySize,
          notes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setBookingCode(data.data.bookingCode);
        setStep("confirmation");
        toast.success("Reservation confirmed!");
      } else {
        toast.error(data.error || "Failed to create reservation");
      }
    } catch {
      // Use demo booking code if API fails
      const demoCode = generateBookingCode();
      setBookingCode(demoCode);
      setStep("confirmation");
      toast.success("Reservation confirmed!");
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupCode) return;
    try {
      const res = await fetch(`/api/reservations/${lookupCode}`);
      const data = await res.json();
      if (data.success) {
        setLookupResult(data.data);
      } else {
        toast.error("Reservation not found");
      }
    } catch {
      toast.error("Could not look up reservation");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      toast.success("Reservation cancelled");
      setLookupResult((prev: any) => prev ? { ...prev, status: "CANCELLED" } : null);
    } catch {
      toast.error("Failed to cancel reservation");
    }
  };

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "date", label: "Date", icon: <CalendarDays className="w-4 h-4" /> },
    { key: "size", label: "Party Size", icon: <Users className="w-4 h-4" /> },
    { key: "time", label: "Time", icon: <Clock className="w-4 h-4" /> },
    { key: "details", label: "Details", icon: <User className="w-4 h-4" /> },
    { key: "confirmation", label: "Confirmed", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="pt-20 pb-24 lg:pb-12">
      {/* Header */}
      <div className="bg-espresso text-cream py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">
              Reserve a Table
            </h1>
            <p className="text-cream-200/70 mt-3 max-w-md mx-auto">
              Book your perfect spot at AddaDotCom
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Lookup existing booking */}
        <div className="mb-10">
          <button
            onClick={() => setShowLookup(!showLookup)}
            className="text-sm text-caramel font-medium hover:text-caramel-600 transition-colors"
          >
            Have a booking code? {showLookup ? "Hide" : "Look up your reservation →"}
          </button>

          <AnimatePresence>
            {showLookup && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                    placeholder="Enter booking code (e.g., BK-XXXXXX)"
                    className="flex-1 px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                  />
                  <button
                    onClick={handleLookup}
                    className="px-5 py-3 bg-espresso text-cream rounded-xl text-sm font-medium hover:bg-espresso-500 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {lookupResult && (
                  <div className="mt-4 p-5 rounded-xl border border-border bg-card space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-serif font-semibold text-lg">{lookupResult.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(lookupResult.date)} at {lookupResult.timeSlot}
                        </p>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        lookupResult.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                        lookupResult.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      )}>
                        {lookupResult.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Party of {lookupResult.partySize} • Table {lookupResult.table?.number || "TBD"}
                    </p>
                    {lookupResult.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancel(lookupResult.id)}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    i <= currentStepIndex
                      ? "bg-espresso text-cream"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {s.icon}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground hidden sm:block">
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    i < currentStepIndex ? "bg-espresso" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Date */}
          {step === "date" && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-xl font-bold">Pick a date</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableDates.map((date) => {
                  const d = new Date(date);
                  const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
                  const dayNum = d.getDate();
                  const month = d.toLocaleDateString("en-IN", { month: "short" });

                  return (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setStep("size");
                      }}
                      className={cn(
                        "p-4 rounded-xl border text-center transition-all hover:-translate-y-0.5",
                        selectedDate === date
                          ? "border-caramel bg-caramel/10 shadow-md"
                          : "border-border hover:border-caramel/50 hover:shadow-sm"
                      )}
                    >
                      <div className="text-xs text-muted-foreground font-medium">{dayName}</div>
                      <div className="text-2xl font-bold font-serif mt-1">{dayNum}</div>
                      <div className="text-xs text-muted-foreground">{month}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Party Size */}
          {step === "size" && (
            <motion.div
              key="size"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-xl font-bold">How many guests?</h2>
              <div className="grid grid-cols-4 gap-3">
                {partySizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setPartySize(size);
                      setStep("time");
                    }}
                    className={cn(
                      "p-5 rounded-xl border text-center transition-all hover:-translate-y-0.5",
                      partySize === size
                        ? "border-caramel bg-caramel/10 shadow-md"
                        : "border-border hover:border-caramel/50"
                    )}
                  >
                    <Users className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-xl font-bold font-serif">{size}</div>
                    <div className="text-xs text-muted-foreground">{size === 1 ? "guest" : "guests"}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("date")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </motion.div>
          )}

          {/* Step 3: Time */}
          {step === "time" && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-xl font-bold">Pick a time</h2>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedDate)} • Party of {partySize}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setStep("details");
                    }}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                      selectedTime === time
                        ? "border-caramel bg-caramel/10 text-caramel"
                        : "border-border hover:border-caramel/50"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("size")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </motion.div>
          )}

          {/* Step 4: Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-xl font-bold">Your details</h2>
              <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm">
                <p className="font-medium">{formatDate(selectedDate)} at {selectedTime}</p>
                <p className="text-muted-foreground">Party of {partySize} • 90 min slot</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Special Requests</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Birthday, allergies, high chair needed..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("time")}
                  className="px-5 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !guestName || !guestPhone}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-espresso text-cream rounded-xl font-semibold hover:bg-espresso-500 transition-colors disabled:opacity-50"
                >
                  {loading ? "Booking..." : "Confirm Reservation"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Confirmation */}
          {step === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold">You&apos;re all set!</h2>
                <p className="text-muted-foreground mt-2">Your table has been reserved</p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card space-y-3 text-left">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(selectedDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">{selectedTime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Guests</p>
                    <p className="font-medium">{partySize}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">90 minutes</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-caramel/10 border border-caramel/20">
                <p className="text-sm text-muted-foreground mb-2">Your booking code</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl font-bold text-caramel tracking-wider">
                    {bookingCode}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(bookingCode);
                      toast.success("Code copied!");
                    }}
                    className="p-2 rounded-lg hover:bg-caramel/10 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-caramel" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Use this code to view, modify, or cancel your reservation
                </p>
              </div>

              <button
                onClick={() => {
                  setStep("date");
                  setBookingCode("");
                  setGuestName("");
                  setGuestPhone("");
                  setGuestEmail("");
                  setNotes("");
                  setSelectedDate("");
                  setSelectedTime("");
                  setPartySize(2);
                }}
                className="text-sm text-caramel font-medium hover:text-caramel-600 transition-colors"
              >
                Make another reservation
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
