"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid3X3,
  ClipboardList,
  Receipt,
  CalendarDays,
  Package,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Coffee,
  LogOut,
  Users,
  ChefHat,
  Star,
  Zap,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/kitchen", label: "Kitchen Display (KDS)", icon: ChefHat },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/tables", label: "Tables & QR", icon: Grid3X3 },
  { href: "/admin/history", label: "Order History", icon: ClipboardList },
  { href: "/admin/billing", label: "Billing / POS", icon: Receipt },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/reviews", label: "Customer Reviews", icon: Star },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/automation", label: "Automation Engine", icon: Zap },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      data-sidebar="true"
      className={cn(
        "fixed left-0 top-0 bottom-0 z-30 bg-espresso text-cream-100 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-cream-200/10 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-caramel/20 flex items-center justify-center flex-shrink-0">
          <Coffee className="w-4 h-4 text-caramel" />
        </div>
        {!collapsed && (
          <span className="font-serif text-lg font-bold text-cream whitespace-nowrap">
            AddaDotCom
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-caramel/20 text-caramel"
                  : "text-cream-200/60 hover:text-cream hover:bg-cream-200/5"
              )}
              title={collapsed ? link.label : undefined}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-caramel")} />
              {!collapsed && <span className="whitespace-nowrap">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-cream-200/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cream-200/60 hover:text-cream hover:bg-cream-200/5 transition-all"
          title={collapsed ? "Back to Site" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-espresso border border-cream-200/20 rounded-full flex items-center justify-center hover:bg-espresso-500 transition-colors shadow-md"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-cream-200/70" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-cream-200/70" />
        )}
      </button>
    </aside>
  );
}

// ─── Admin Topbar ───────────────────────────────────────────

interface AdminTopbarProps {
  sidebarCollapsed: boolean;
  onOpenCommand?: () => void;
}

export function AdminTopbar({ sidebarCollapsed, onOpenCommand }: AdminTopbarProps) {
  const pathname = usePathname();

  // Derive page title from pathname
  const getPageTitle = () => {
    const segment = pathname?.split("/").filter(Boolean).pop() || "dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header
      data-topbar="true"
      className={cn(
        "fixed top-0 right-0 z-20 h-16 bg-background/80 backdrop-blur-xl border-b border-border/80 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 shadow-sm",
        sidebarCollapsed ? "left-16" : "left-64"
      )}
    >
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-xl font-bold tracking-tight">{getPageTitle()}</h1>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live Sync
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Skiper Command Palette Trigger Button */}
        {onOpenCommand && (
          <button
            onClick={onOpenCommand}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-border/80 bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all shadow-xs"
            title="Open Command Palette (⌘K / Ctrl+K)"
          >
            <span className="text-caramel font-mono text-xs">⌘</span>
            <span className="hidden sm:inline">Search pages & actions...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[9px] font-mono">⌘K</kbd>
          </button>
        )}

        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border/80 bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <span>View Café</span>
          <span className="text-caramel font-bold">↗</span>
        </Link>

        <div className="flex items-center gap-3 pl-2 border-l border-border/60">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground">Admin Portal</p>
            <p className="text-[11px] text-muted-foreground">admin@addadotcom.cafe</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-espresso flex items-center justify-center border border-caramel/20 shadow-sm">
            <Users className="w-4 h-4 text-caramel" />
          </div>
        </div>
      </div>
    </header>
  );
}
