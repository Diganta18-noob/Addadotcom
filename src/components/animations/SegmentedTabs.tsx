"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface SegmentedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  pillClassName?: string;
  layoutId?: string;
}

export function SegmentedTabs({
  tabs,
  activeTab,
  onChange,
  className,
  pillClassName,
  layoutId = "segmented-pill",
}: SegmentedTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex p-1.5 rounded-full bg-muted/60 backdrop-blur-md border border-border/80 shadow-inner",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 z-10 flex items-center gap-2 outline-none select-none",
              isActive
                ? "text-cream-50 dark:text-neutral-900"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "absolute inset-0 rounded-full bg-espresso dark:bg-caramel shadow-md z-[-1]",
                  pillClassName
                )}
              />
            )}
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-caramel/30 text-caramel dark:bg-espresso/30 dark:text-espresso"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
