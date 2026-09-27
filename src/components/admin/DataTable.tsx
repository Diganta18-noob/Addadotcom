"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export interface ColumnDef<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
}

interface BulkAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "destructive";
  onClick: (selectedItems: T[]) => void | Promise<void>;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  bulkActions?: BulkAction<T>[];
  pageSize?: number;
  searchFilter?: (item: T, query: string) => boolean;
  searchQuery?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries matching the current criteria.",
  emptyActionLabel,
  onEmptyAction,
  bulkActions = [],
  pageSize = 10,
  searchFilter,
  searchQuery = "",
  className,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // 1. Filter data based on query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchFilter) return data;
    return data.filter((item) => searchFilter(item, searchQuery.trim()));
  }, [data, searchQuery, searchFilter]);

  // 2. Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    const col = columns.find((c) => c.id === sortColumn);
    if (!col || !col.accessorKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = a[col.accessorKey!];
      const valB = b[col.accessorKey!];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const comp = valA < valB ? -1 : 1;
      return sortDirection === "asc" ? comp : -comp;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // 3. Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Selection handlers
  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedKeys.has(keyExtractor(item)));

  const handleSelectAll = () => {
    const next = new Set(selectedKeys);
    if (isAllSelected) {
      paginatedData.forEach((item) => next.delete(keyExtractor(item)));
    } else {
      paginatedData.forEach((item) => next.add(keyExtractor(item)));
    }
    setSelectedKeys(next);
  };

  const handleToggleRow = (key: string) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedKeys(next);
  };

  const selectedItems = useMemo(() => {
    return data.filter((item) => selectedKeys.has(keyExtractor(item)));
  }, [data, selectedKeys, keyExtractor]);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Bulk Action Bar */}
      {bulkActions.length > 0 && selectedKeys.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-espresso text-cream text-xs font-semibold shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-caramel text-espresso font-bold flex items-center justify-center text-[11px]">
              {selectedKeys.size}
            </span>
            <span>selected items</span>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => action.onClick(selectedItems)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2",
                    action.variant === "destructive"
                      ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      : "bg-white/10 hover:bg-white/20 text-cream"
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {action.label}
                </button>
              );
            })}
            <button
              onClick={() => setSelectedKeys(new Set())}
              className="text-cream-200/60 hover:text-cream text-xs px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="w-full bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold">
                {bulkActions.length > 0 && (
                  <th className="w-12 px-4 py-3.5">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        isAllSelected
                          ? "bg-espresso text-cream border-espresso dark:bg-caramel dark:text-espresso"
                          : "border-border/80 bg-card"
                      )}
                      aria-label="Select all rows"
                    >
                      {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </th>
                )}
                {columns.map((col) => {
                  const isSorted = sortColumn === col.id;
                  return (
                    <th
                      key={col.id}
                      className={cn(
                        "px-4 py-3.5 whitespace-nowrap",
                        col.hideOnMobile && "hidden md:table-cell",
                        col.sortable && "cursor-pointer select-none hover:text-foreground",
                        col.className
                      )}
                      onClick={col.sortable ? () => handleSort(col.id) : undefined}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-muted-foreground/60">
                            {isSorted ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-3.5 h-3.5 text-caramel font-bold" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-caramel font-bold" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="animate-pulse">
                    {bulkActions.length > 0 && (
                      <td className="px-4 py-4">
                        <div className="w-4 h-4 rounded bg-muted" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "px-4 py-4",
                          col.hideOnMobile && "hidden md:table-cell"
                        )}
                      >
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0)}
                    className="p-8 text-center"
                  >
                    <EmptyState
                      icon={FolderOpen}
                      title={emptyTitle}
                      description={emptyDescription}
                      actionLabel={emptyActionLabel}
                      onAction={onEmptyAction}
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const key = keyExtractor(item);
                  const isSelected = selectedKeys.has(key);

                  return (
                    <tr
                      key={key}
                      className={cn(
                        "transition-colors duration-150",
                        isSelected
                          ? "bg-caramel/10 dark:bg-caramel/15"
                          : "hover:bg-muted/40"
                      )}
                    >
                      {bulkActions.length > 0 && (
                        <td className="w-12 px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleRow(key)}
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-espresso text-cream border-espresso dark:bg-caramel dark:text-espresso"
                                : "border-border/80 bg-card"
                            )}
                            aria-label={`Select row ${key}`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        </td>
                      )}
                      {columns.map((col) => {
                        return (
                          <td
                            key={col.id}
                            className={cn(
                              "px-4 py-3.5 align-middle",
                              col.hideOnMobile && "hidden md:table-cell",
                              col.className
                            )}
                          >
                            {col.cell
                              ? col.cell(item)
                              : col.accessorKey
                              ? String(item[col.accessorKey] ?? "—")
                              : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-muted/20 border-t border-border/80 text-xs text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {sortedData.length}
              </span>{" "}
              records
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-2.5 py-1 rounded-lg border border-border/80 bg-card text-foreground font-semibold">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
