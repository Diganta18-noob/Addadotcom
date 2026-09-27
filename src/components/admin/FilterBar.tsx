"use client";

import React from "react";
import { Search, X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  displayValue?: string;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
  children?: React.ReactNode; // Extra filter selects or buttons
  className?: string;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  activeFilters,
  onRemoveFilter,
  onClearAll,
  children,
  className,
}: FilterBarProps) {
  const hasActiveFilters = activeFilters.length > 0 || searchQuery.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-xs h-11"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter slot (Dropdowns, date ranges, etc.) */}
        {children && (
          <div className="flex items-center gap-2 flex-wrap">{children}</div>
        )}

        {/* Clear all action */}
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-colors h-11 self-start sm:self-auto shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Filters:
          </span>
          {activeFilters.map((filter) => (
            <span
              key={`${filter.id}-${filter.value}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-caramel/15 text-foreground border border-caramel/30 animate-in fade-in zoom-in-95 duration-150"
            >
              <span className="text-muted-foreground text-[11px]">{filter.label}:</span>
              <span className="font-semibold">{filter.displayValue || filter.value}</span>
              <button
                onClick={() => onRemoveFilter(filter.id)}
                className="hover:text-destructive p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label={`Remove filter ${filter.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
