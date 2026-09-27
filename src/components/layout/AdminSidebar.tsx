"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid3X3,
  ClipboardList,
  History,
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
  FileText,
  Menu as MenuIcon,
  X,
  Search,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavGroup {
  groupName: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    groupName: "Operations",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/kitchen", label: "Kitchen KDS", icon: ChefHat },
      { href: "/admin/billing", label: "Billing & POS", icon: Receipt },
      { href: "/admin/tables", label: "Tables & QR", icon: Grid3X3 },
    ],
  },
  {
    groupName: "Restaurant Management",
    items: [
      { href: "/admin/orders", label: "Live Orders", icon: ClipboardList },
      { href: "/admin/history", label: "Order History", icon: History },
      { href: "/admin/menu", label: "Menu Catalogue", icon: UtensilsCrossed },
      { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
      { href: "/admin/inventory", label: "Inventory Stock", icon: Package },
    ],
  },
  {
    groupName: "Insights & Engagement",
    items: [
      { href: "/admin/reviews", label: "Customer Reviews", icon: Star },
      { href: "/admin/reports", label: "Financial Reports", icon: FileText },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    groupName: "System",
    items: [
      { href: "/admin/automation", label: "Automation Rules", icon: Zap },
      { href: "/admin/settings", label: "Café Settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const renderNavItems = (isMobileView = false) => {
    return navGroups.map((group) => (
      <div key={group.groupName} className="mb-4">
        {(!collapsed || isMobileView) && (
          <h4 className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-cream-200/40">
            {group.groupName}
          </h4>
        )}
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobileView ? onMobileClose : undefined}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group outline-none focus-visible:ring-2 focus-visible:ring-caramel",
                  isActive
                    ? "bg-caramel/20 text-caramel font-semibold shadow-xs"
                    : "text-cream-200/70 hover:text-cream hover:bg-cream-200/5",
                  collapsed && !isMobileView && "justify-center px-0 h-11 w-11 mx-auto"
                )}
                title={collapsed && !isMobileView ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-caramel rounded-r-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105",
                    isActive ? "text-caramel" : "text-cream-200/60 group-hover:text-cream"
                  )}
                />
                {(!collapsed || isMobileView) && (
                  <span className="truncate">{item.label}</span>
                )}
                {item.badge && (!collapsed || isMobileView) && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-md bg-caramel/30 text-cream font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <>
      {/* ── Desktop / Tablet Sidebar ────────────────────────────── */}
      <aside
        data-sidebar="true"
        aria-label="Admin Navigation"
        className={cn(
          "hidden lg:flex fixed left-0 top-0 bottom-0 z-30 bg-espresso text-cream-100 flex-col border-r border-cream-200/10 transition-all duration-300",
          collapsed ? "w-18" : "w-64"
        )}
      >
        {/* Logo / Brand Header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-cream-200/10 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-caramel/20 flex items-center justify-center flex-shrink-0 border border-caramel/30 shadow-xs">
            <Coffee className="w-5 h-5 text-caramel" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-serif text-base font-bold text-cream tracking-tight block truncate">
                AddaDotCom
              </span>
              <span className="text-[10px] text-cream-200/60 uppercase tracking-widest block font-sans">
                Command Center
              </span>
            </div>
          )}
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto custom-scrollbar">
          {renderNavItems(false)}
        </nav>

        {/* Footer / Back to Site */}
        <div className="p-2 border-t border-cream-200/10 space-y-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-cream-200/70 hover:text-cream hover:bg-cream-200/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-caramel",
              collapsed && "justify-center px-0 h-11 w-11 mx-auto"
            )}
            title={collapsed ? "Back to Café Website" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Back to Café</span>}
          </Link>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3.5 top-20 w-7 h-7 bg-espresso border border-cream-200/20 rounded-full flex items-center justify-center hover:bg-espresso-500 text-cream transition-colors shadow-md z-40 focus-visible:outline-2 focus-visible:outline-caramel"
          aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-cream-200/80" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-cream-200/80" />
          )}
        </button>
      </aside>

      {/* ── Mobile / Tablet Sliding Drawer ────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-espresso text-cream-100 z-50 flex flex-col shadow-2xl border-r border-cream-200/15"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-cream-200/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-caramel/20 flex items-center justify-center border border-caramel/30">
                    <Coffee className="w-5 h-5 text-caramel" />
                  </div>
                  <div>
                    <span className="font-serif text-base font-bold text-cream tracking-tight block">
                      AddaDotCom
                    </span>
                    <span className="text-[10px] text-cream-200/60 uppercase tracking-widest block font-sans">
                      Admin Portal
                    </span>
                  </div>
                </div>
                <button
                  onClick={onMobileClose}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-cream-200/70 hover:text-cream hover:bg-cream-200/10 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <nav className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar">
                {renderNavItems(true)}
              </nav>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-cream-200/10 space-y-1">
                <Link
                  href="/"
                  onClick={onMobileClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-cream-200/80 hover:text-cream hover:bg-cream-200/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Return to Café Website</span>
                </Link>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Admin Topbar ───────────────────────────────────────────

interface AdminTopbarProps {
  sidebarCollapsed: boolean;
  onOpenMobileNav: () => void;
  onOpenCommand?: () => void;
}

export function AdminTopbar({
  sidebarCollapsed,
  onOpenMobileNav,
  onOpenCommand,
}: AdminTopbarProps) {
  return (
    <header
      data-topbar="true"
      className={cn(
        "fixed top-0 right-0 z-20 h-16 bg-background/85 backdrop-blur-xl border-b border-border/80 flex items-center justify-between px-3 sm:px-6 transition-all duration-300 shadow-xs",
        // Desktop sidebar offset:
        sidebarCollapsed ? "lg:left-18" : "lg:left-64",
        "left-0"
      )}
    >
      {/* Left side: Hamburger on mobile + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
        {/* Mobile Hamburger Button (44x44px target) */}
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden w-11 h-11 rounded-xl flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Open mobile navigation menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="overflow-hidden">
          <AdminBreadcrumbs />
        </div>

        {/* Live SSE Pulse Badge */}
        <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live Engine
        </span>
      </div>

      {/* Right side: Global Search / Command, Public Link, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Palette Trigger Button (min 44px touch target) */}
        {onOpenCommand && (
          <button
            onClick={onOpenCommand}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-border/80 bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all shadow-xs h-10 focus-visible:outline-2 focus-visible:outline-accent"
            title="Open Command Palette (⌘K / Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-caramel" />
            <span className="hidden md:inline">Command Palette</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-card border border-border text-[9px] font-mono">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Café Live Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors h-10 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span>Café</span>
          <span className="text-caramel font-bold">↗</span>
        </Link>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border/60">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground leading-tight">Admin Portal</p>
            <p className="text-[11px] text-muted-foreground leading-tight">admin@addadotcom.cafe</p>
          </div>
          <div
            className="w-10 h-10 rounded-xl bg-espresso flex items-center justify-center border border-caramel/30 shadow-xs shrink-0"
            title="Logged in as Admin"
          >
            <Users className="w-4 h-4 text-caramel" />
          </div>
        </div>
      </div>
    </header>
  );
}
