"use client";

import React from "react";
import { LucideIcon, FolderOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 my-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center mb-3 text-muted-foreground shadow-xs">
        <Icon className="w-6 h-6 text-caramel/90" />
      </div>
      <h3 className="font-serif text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-espresso text-cream text-xs font-semibold rounded-xl hover:bg-espresso-500 transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
