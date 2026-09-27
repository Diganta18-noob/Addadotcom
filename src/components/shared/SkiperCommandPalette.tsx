"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Command,
  LayoutDashboard,
  ChefHat,
  Receipt,
  Grid3X3,
  ClipboardList,
  UtensilsCrossed,
  Package,
  BarChart3,
  Zap,
  CalendarDays,
  Star,
  Settings,
  X,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommandItem {
  id: string;
  title: string;
  category: "Admin Navigation" | "Operations" | "Quick Actions";
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  keywords?: string[];
  badge?: string;
}

interface SkiperCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SkiperCommandPalette({ isOpen, onClose }: SkiperCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commandItems: CommandItem[] = useMemo(
    () => [
      // Admin Navigation
      {
        id: "nav-dashboard",
        title: "Overview Dashboard",
        category: "Admin Navigation",
        icon: LayoutDashboard,
        href: "/admin",
        keywords: ["home", "stats", "kpi", "sales", "overview"],
      },
      {
        id: "nav-kitchen",
        title: "Kitchen Display System (KDS)",
        category: "Admin Navigation",
        icon: ChefHat,
        href: "/admin/kitchen",
        badge: "Live",
        keywords: ["kds", "cook", "chef", "tickets", "food", "kitchen"],
      },
      {
        id: "nav-orders",
        title: "Orders Manager",
        category: "Admin Navigation",
        icon: ClipboardList,
        href: "/admin/orders",
        keywords: ["tickets", "pending", "status", "active", "filter"],
      },
      {
        id: "nav-billing",
        title: "POS & Billing Terminal",
        category: "Admin Navigation",
        icon: Receipt,
        href: "/admin/billing",
        badge: "POS",
        keywords: ["cashier", "checkout", "invoice", "receipt", "payment", "upi", "card"],
      },
      {
        id: "nav-tables",
        title: "Table Layout & QR Codes",
        category: "Admin Navigation",
        icon: Grid3X3,
        href: "/admin/tables",
        keywords: ["dine in", "seats", "floor", "qr", "table status", "room"],
      },
      {
        id: "nav-menu",
        title: "Menu Items & Categories",
        category: "Admin Navigation",
        icon: UtensilsCrossed,
        href: "/admin/menu",
        keywords: ["dishes", "food", "beverages", "pricing", "chai", "coffee"],
      },
      {
        id: "nav-inventory",
        title: "Inventory & Stock Tracking",
        category: "Admin Navigation",
        icon: Package,
        href: "/admin/inventory",
        keywords: ["ingredients", "milk", "coffee beans", "low stock", "supplies"],
      },
      {
        id: "nav-analytics",
        title: "Sales Analytics & Metrics",
        category: "Admin Navigation",
        icon: BarChart3,
        href: "/admin/analytics",
        keywords: ["charts", "growth", "revenue", "trends", "hourly", "monthly"],
      },
      {
        id: "nav-automation",
        title: "Restaurant Automation Engine",
        category: "Admin Navigation",
        icon: Zap,
        href: "/admin/automation",
        badge: "Auto",
        keywords: ["triggers", "workflows", "webhooks", "alerts", "rules"],
      },
      {
        id: "nav-reservations",
        title: "Table Reservations",
        category: "Admin Navigation",
        icon: CalendarDays,
        href: "/admin/reservations",
        keywords: ["booking", "guests", "schedule", "calendar"],
      },
      {
        id: "nav-reviews",
        title: "Customer Reviews & Feedback",
        category: "Admin Navigation",
        icon: Star,
        href: "/admin/reviews",
        keywords: ["ratings", "feedback", "sentiment", "customer"],
      },
      {
        id: "nav-settings",
        title: "System & Cafe Settings",
        category: "Admin Navigation",
        icon: Settings,
        href: "/admin/settings",
        keywords: ["preferences", "config", "tax", "profile", "password"],
      },
      // Operations & Shortcuts
      {
        id: "op-new-order",
        title: "Place New Customer Order",
        category: "Operations",
        icon: ShoppingBag,
        href: "/order",
        keywords: ["cart", "takeaway", "delivery", "pos"],
      },
      {
        id: "op-customer-menu",
        title: "View Public Menu Page",
        category: "Operations",
        icon: ExternalLink,
        href: "/menu",
        keywords: ["guest", "browse", "customer view"],
      },
      {
        id: "op-toggle-theme",
        title: "Toggle Dark / Light Theme",
        category: "Quick Actions",
        icon: Moon,
        action: () => {
          const isDark = document.documentElement.classList.contains("dark");
          if (isDark) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
          } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
          }
        },
        keywords: ["dark mode", "light mode", "theme", "night", "day"],
      },
    ],
    []
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return commandItems;
    const q = query.toLowerCase();
    return commandItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }, [commandItems, query]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onClose();
      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [onClose, router]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? (filteredItems.length || 1) - 1 : prev - 1
        );
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleSelect, onClose]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          {/* Backdrop with SceneAI blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-card/95 border border-caramel/30 shadow-2xl shadow-caramel/10 backdrop-blur-2xl z-10"
          >
            {/* Top Glowing Ambient Edge (SceneAI style) */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-caramel to-transparent" />

            {/* Top Search Input */}
            <div className="relative flex items-center border-b border-border/60 px-4 py-3.5">
              <Search className="w-5 h-5 text-caramel mr-3 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search admin pages, kitchen tickets, billing, tables..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground uppercase border border-border">
                ESC
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                  <p>No matching shortcuts or pages found for &quot;{query}&quot;</p>
                  <p className="text-[11px] text-muted-foreground/60">Try searching for &quot;kitchen&quot;, &quot;pos&quot;, or &quot;tables&quot;</p>
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left group",
                        isSelected
                          ? "bg-caramel/15 text-foreground border border-caramel/40 shadow-xs"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                            isSelected
                              ? "bg-caramel text-espresso font-bold shadow-md shadow-caramel/30"
                              : "bg-muted text-muted-foreground group-hover:text-caramel"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate font-semibold">{item.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-caramel/20 text-caramel border border-caramel/30">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                          {item.category}
                        </span>
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-caramel" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Palette Footer (Skiper UI style) */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-t border-border/60 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[9px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[9px]">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[9px]">↵</kbd>
                  to select
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-caramel font-semibold">
                <Command className="w-3.5 h-3.5" />
                <span>Skiper Palette</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Global Hook to manage Command Palette open/close with Cmd+K listener
 */
export function useSkiperCommand() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
