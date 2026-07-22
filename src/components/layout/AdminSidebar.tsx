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
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/tables", label: "Tables", icon: Grid3X3 },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/billing", label: "Billing / POS", icon: Receipt },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
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
}

export function AdminTopbar({ sidebarCollapsed }: AdminTopbarProps) {
  const pathname = usePathname();

  // Derive page title from pathname
  const getPageTitle = () => {
    const segment = pathname?.split("/").filter(Boolean).pop() || "dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-20 h-16 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-64"
      )}
    >
      <div>
        <h1 className="font-serif text-xl font-semibold">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">Admin User</p>
          <p className="text-xs text-muted-foreground">admin@addadotcom.cafe</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-espresso flex items-center justify-center">
          <Users className="w-4 h-4 text-caramel" />
        </div>
      </div>
    </header>
  );
}
