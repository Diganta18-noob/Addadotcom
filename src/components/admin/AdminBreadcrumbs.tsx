"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeMetaMap: Record<string, { label: string; section?: string }> = {
  "/admin": { label: "Overview", section: "Operations" },
  "/admin/kitchen": { label: "Kitchen KDS", section: "Operations" },
  "/admin/billing": { label: "Billing & POS", section: "Operations" },
  "/admin/tables": { label: "Tables & QR Codes", section: "Operations" },
  "/admin/orders": { label: "Live Orders", section: "Management" },
  "/admin/history": { label: "Order History", section: "Management" },
  "/admin/menu": { label: "Menu Catalogue", section: "Management" },
  "/admin/reservations": { label: "Table Reservations", section: "Management" },
  "/admin/inventory": { label: "Stock & Ingredients", section: "Management" },
  "/admin/reviews": { label: "Customer Reviews", section: "Insights" },
  "/admin/reports": { label: "Financial Reports", section: "Insights" },
  "/admin/analytics": { label: "Analytics & Traffic", section: "Insights" },
  "/admin/automation": { label: "Automation Rules", section: "System" },
  "/admin/settings": { label: "Café Settings", section: "System" },
};

export function AdminBreadcrumbs() {
  const pathname = usePathname() || "/admin";
  const current = routeMetaMap[pathname] || {
    label: pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard",
  };

  const isRoot = pathname === "/admin";

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs">
      <Link
        href="/admin"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus-visible:outline-2 focus-visible:outline-accent"
        title="Admin Home"
      >
        <Home className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="sr-only">Admin Home</span>
      </Link>

      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" aria-hidden="true" />

      {current.section && !isRoot && (
        <>
          <span className="text-muted-foreground/80 font-medium hidden sm:inline-block">
            {current.section}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 hidden sm:inline-block" aria-hidden="true" />
        </>
      )}

      <span
        aria-current="page"
        className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-none capitalize"
      >
        {current.label}
      </span>
    </nav>
  );
}
