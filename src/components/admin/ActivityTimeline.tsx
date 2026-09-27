"use client";

import React from "react";
import {
  ClipboardList,
  CalendarDays,
  UtensilsCrossed,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  type: "order" | "reservation" | "menu" | "billing" | "system" | "inventory";
  title: string;
  description: string;
  time: string;
  badge?: string;
  badgeVariant?: "success" | "warning" | "info" | "neutral";
}

const iconMap = {
  order: ClipboardList,
  reservation: CalendarDays,
  menu: UtensilsCrossed,
  billing: Receipt,
  system: Sparkles,
  inventory: AlertCircle,
};

const colorMap = {
  order: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  reservation: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  menu: "bg-caramel/15 text-caramel border-caramel/30",
  billing: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  system: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  inventory: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export function ActivityTimeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-muted-foreground">
        No recent operational activity recorded.
      </div>
    );
  }

  return (
    <div className={cn("relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80", className)}>
      {items.map((item) => {
        const Icon = iconMap[item.type] || Clock;
        const colorClasses = colorMap[item.type] || "bg-muted text-muted-foreground border-border";

        return (
          <div key={item.id} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={cn(
                "absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center bg-card shadow-xs group-hover:scale-110 transition-transform",
                colorClasses
              )}
            >
              <Icon className="w-2.5 h-2.5" />
            </div>

            {/* Event Details */}
            <div className="bg-card/60 hover:bg-card border border-border/60 rounded-xl p-3 transition-colors shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-foreground truncate">
                  {item.title}
                </span>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap font-mono">
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              {item.badge && (
                <div className="mt-2">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                      item.badgeVariant === "success" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      item.badgeVariant === "warning" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                      item.badgeVariant === "info" && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                      (!item.badgeVariant || item.badgeVariant === "neutral") && "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {item.badge}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
