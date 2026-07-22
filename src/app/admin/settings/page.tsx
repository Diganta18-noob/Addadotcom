"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Settings,
  Coffee,
  Percent,
  CalendarRange,
  Users,
  Tag,
  Plus,
  Trash2,
  Save,
  Clock,
  Loader2,
  Building2,
  ShieldCheck,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";

interface Promo {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "taxes" | "reservations" | "staff" | "promos">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile State
  const [cafeName, setCafeName] = useState("AddaDotCom Cafe & Restaurant");
  const [tagline, setTagline] = useState("Artisanal Coffee & Gourmet Bistro");
  const [address, setAddress] = useState("124 Artisan Blvd, Connaught Place, New Delhi");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [email, setEmail] = useState("support@addadotcom.cafe");
  const [website, setWebsite] = useState("www.addadotcom.cafe");
  const [gstin, setGstin] = useState("07AAAAA0000A1Z5");
  const [fssai, setFssai] = useState("10021011000123");

  // Taxes & Charges State
  const [serviceCharge, setServiceCharge] = useState(5);
  const [gst, setGst] = useState(5); // 5% total (2.5% CGST + 2.5% SGST)
  const [deliveryFee, setDeliveryFee] = useState(49);
  const [minOrderDelivery, setMinOrderDelivery] = useState(200);

  // Reservation State
  const [slotDuration, setSlotDuration] = useState(90);
  const [bufferTime, setBufferTime] = useState(15);
  const [maxPartySize, setMaxPartySize] = useState(10);

  // Promo State
  const [promos, setPromos] = useState<Promo[]>([
    { id: "1", code: "WELCOME10", type: "PERCENTAGE", value: 10, minOrder: 150 },
    { id: "2", code: "FIRST50", type: "FIXED", value: 50, minOrder: 200 },
  ]);
  const [newPromo, setNewPromo] = useState<Partial<Promo>>({ code: "", type: "PERCENTAGE", value: 0, minOrder: 0 });

  // Staff State
  const [staffList, setStaffList] = useState<Staff[]>([
    { id: "1", name: "Admin Manager", email: "admin@addadotcom.cafe", role: "ADMIN" },
    { id: "2", name: "Rohan Das", email: "rohan@addadotcom.cafe", role: "MANAGER" },
    { id: "3", name: "Neha Sen", email: "neha@addadotcom.cafe", role: "STAFF" },
  ]);
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({ name: "", email: "", role: "STAFF" });

  // Fetch settings from GET /api/settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data)) {
          const map: Record<string, string> = {};
          json.data.forEach((s: any) => {
            map[s.key] = s.value;
          });

          if (map["cafe_name"]) setCafeName(map["cafe_name"]);
          if (map["cafe_tagline"]) setTagline(map["cafe_tagline"]);
          if (map["cafe_address"]) setAddress(map["cafe_address"]);
          if (map["cafe_phone"]) setPhone(map["cafe_phone"]);
          if (map["cafe_email"]) setEmail(map["cafe_email"]);
          if (map["cafe_website"]) setWebsite(map["cafe_website"]);
          if (map["cafe_gstin"]) setGstin(map["cafe_gstin"]);
          if (map["cafe_fssai"]) setFssai(map["cafe_fssai"]);
          if (map["service_charge_rate"]) setServiceCharge(parseFloat(map["service_charge_rate"]) || 5);
          if (map["gst_rate"]) setGst(parseFloat(map["gst_rate"]) || 5);
          if (map["delivery_fee"]) setDeliveryFee(parseFloat(map["delivery_fee"]) || 49);
          if (map["min_order_delivery"]) setMinOrderDelivery(parseFloat(map["min_order_delivery"]) || 200);
          if (map["slot_duration"]) setSlotDuration(parseInt(map["slot_duration"]) || 90);
          if (map["buffer_time"]) setBufferTime(parseInt(map["buffer_time"]) || 15);
          if (map["max_party_size"]) setMaxPartySize(parseInt(map["max_party_size"]) || 10);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = [
      { key: "cafe_name", value: cafeName, group: "general" },
      { key: "cafe_tagline", value: tagline, group: "general" },
      { key: "cafe_address", value: address, group: "general" },
      { key: "cafe_phone", value: phone, group: "general" },
      { key: "cafe_email", value: email, group: "general" },
      { key: "cafe_website", value: website, group: "general" },
      { key: "cafe_gstin", value: gstin, group: "general" },
      { key: "cafe_fssai", value: fssai, group: "general" },
      { key: "service_charge_rate", value: String(serviceCharge), group: "tax" },
      { key: "gst_rate", value: String(gst), group: "tax" },
      { key: "delivery_fee", value: String(deliveryFee), group: "general" },
      { key: "min_order_delivery", value: String(minOrderDelivery), group: "general" },
      { key: "slot_duration", value: String(slotDuration), group: "reservation" },
      { key: "buffer_time", value: String(bufferTime), group: "reservation" },
      { key: "max_party_size", value: String(maxPartySize), group: "reservation" },
    ];

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Settings saved & updated across the platform!");
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to settings API");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.value) return;

    const promo: Promo = {
      id: String(Date.now()),
      code: newPromo.code.toUpperCase(),
      type: newPromo.type || "PERCENTAGE",
      value: Number(newPromo.value),
      minOrder: Number(newPromo.minOrder || 0),
    };

    setPromos((prev) => [...prev, promo]);
    setNewPromo({ code: "", type: "PERCENTAGE", value: 0, minOrder: 0 });
    toast.success("Promo code created");
  };

  const handleDeletePromo = (id: string) => {
    setPromos((prev) => prev.filter((p) => p.id !== id));
    toast.success("Promo code deleted");
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) return;

    const member: Staff = {
      id: String(Date.now()),
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role || "STAFF",
    };

    setStaffList((prev) => [...prev, member]);
    setNewStaff({ name: "", email: "", role: "STAFF" });
    toast.success("Staff account created");
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    toast.success("Staff account removed");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-caramel" />
        <span className="ml-3 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar navigation tabs */}
      <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
        {[
          { key: "profile", label: "Cafe Profile", icon: Coffee },
          { key: "taxes", label: "Taxes & Charges", icon: Percent },
          { key: "reservations", label: "Reservations Rules", icon: CalendarRange },
          { key: "staff", label: "Staff Directory", icon: Users },
          { key: "promos", label: "Promo Codes", icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap lg:w-full",
                activeTab === tab.key
                  ? "bg-espresso text-cream shadow-sm"
                  : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Settings Panel */}
      <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
        {activeTab === "profile" && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-caramel" /> Cafe Brand Identity & Legal Details
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Cafe / Restaurant Name *</label>
                  <input
                    type="text"
                    value={cafeName}
                    onChange={(e) => setCafeName(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Brand Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Full Registered Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Primary Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Official Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Website Domain</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div>
                  <label className="text-xs font-semibold mb-1 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-caramel" /> GSTIN Registration Number
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-caramel" /> FSSAI License Number
                  </label>
                  <input
                    type="text"
                    value={fssai}
                    onChange={(e) => setFssai(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
            </button>
          </form>
        )}

        {activeTab === "taxes" && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <h3 className="font-serif text-lg font-bold">Tax Config & Charges</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Statutory GST Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={gst}
                    onChange={(e) => setGst(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Split equally into CGST (2.5%) and SGST (2.5%) on tax invoices.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Dine-in Service Charge (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Flat Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Min. Order for Free Delivery (₹)</label>
                  <input
                    type="number"
                    value={minOrderDelivery}
                    onChange={(e) => setMinOrderDelivery(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Tax Settings
            </button>
          </form>
        )}

        {activeTab === "reservations" && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <h3 className="font-serif text-lg font-bold">Reservation Rules</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Slot Duration (Min)</label>
                  <input
                    type="number"
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Buffer Time (Min)</label>
                  <input
                    type="number"
                    value={bufferTime}
                    onChange={(e) => setBufferTime(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Max Party Size</label>
                  <input
                    type="number"
                    value={maxPartySize}
                    onChange={(e) => setMaxPartySize(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Rules
            </button>
          </form>
        )}

        {activeTab === "promos" && (
          <div className="space-y-6">
            <h3 className="font-serif text-lg font-bold">Promo Code Directory</h3>

            {/* Create Promo Code form */}
            <form onSubmit={handleAddPromo} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-muted/40 p-4 border border-border rounded-xl">
              <div>
                <label className="text-[10px] font-semibold mb-1 block">Promo Code</label>
                <input
                  type="text"
                  placeholder="NEWYEAR20"
                  value={newPromo.code || ""}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold mb-1 block">Type</label>
                <select
                  value={newPromo.type || "PERCENTAGE"}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold mb-1 block">Discount Value</label>
                <input
                  type="number"
                  placeholder="20"
                  value={newPromo.value || ""}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-mono"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 bg-espresso text-cream text-xs font-semibold rounded-lg hover:bg-espresso-500 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Create
                </button>
              </div>
            </form>

            {/* Promo Codes list */}
            <div className="space-y-2">
              {promos.map((promo) => (
                <div key={promo.id} className="flex justify-between items-center p-3 rounded-xl border border-border bg-card">
                  <div>
                    <span className="px-2 py-0.5 bg-caramel/10 text-caramel border border-caramel/30 rounded font-mono text-xs font-bold uppercase">
                      {promo.code}
                    </span>
                    <span className="text-xs text-muted-foreground ml-3">
                      Discount: {promo.type === "PERCENTAGE" ? `${promo.value}%` : formatCurrency(promo.value)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeletePromo(promo.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="space-y-6">
            <h3 className="font-serif text-lg font-bold">Staff Accounts Directory</h3>

            {/* Add Staff form */}
            <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-muted/40 p-4 border border-border rounded-xl">
              <div>
                <label className="text-[10px] font-semibold mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="Karan Roy"
                  value={newStaff.name || ""}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold mb-1 block">Email</label>
                <input
                  type="email"
                  placeholder="karan@addadotcom.cafe"
                  value={newStaff.email || ""}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 bg-espresso text-cream text-xs font-semibold rounded-lg hover:bg-espresso-500 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Invite
                </button>
              </div>
            </form>

            {/* Staff list */}
            <div className="space-y-2">
              {staffList.map((staff) => (
                <div key={staff.id} className="flex justify-between items-center p-3 rounded-xl border border-border bg-card">
                  <div>
                    <p className="text-sm font-semibold">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">{staff.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-muted text-[10px] rounded-full text-muted-foreground font-semibold uppercase">
                      {staff.role}
                    </span>
                    {staff.email !== "admin@addadotcom.cafe" && (
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
