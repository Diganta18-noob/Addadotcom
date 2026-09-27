"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  CalendarDays,
  UtensilsCrossed,
  Package,
  ClipboardList,
  Sparkles,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isHot?: boolean;
}

const quickActions: QuickAction[] = [
  { href: "/order", label: "+ New Order", icon: ShoppingBag, badge: "POS", isHot: true },
  { href: "/admin/reservations", label: "+ New Booking", icon: CalendarDays },
  { href: "/admin/menu", label: "+ Add Dish", icon: UtensilsCrossed },
  { href: "/admin/inventory", label: "+ Stock Intake", icon: Package },
  { href: "/admin/orders", label: "Active Orders", icon: ClipboardList },
];

export function AdminQuickBar() {
  const pathname = usePathname();

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-card/70 backdrop-blur-xl border border-border/80 shadow-sm min-w-max">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-caramel border-r border-border/60">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Actions</span>
        </div>

        {quickActions.map((action) => {
          const Icon = action.icon;
          const isActive = pathname === action.href;

          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none group",
                isActive
                  ? "bg-espresso text-cream shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5 transition-transform group-hover:scale-110", isActive && "text-caramel")} />
              <span>{action.label}</span>

              {action.badge && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase",
                    action.isHot
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-pulse"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {action.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
