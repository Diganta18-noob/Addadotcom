"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrudLayoutProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  isLoading?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  saveLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  error?: string | null;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CrudLayout({
  title,
  description,
  backHref,
  backLabel = "Back",
  isLoading = false,
  isSaving = false,
  onSave,
  saveLabel = "Save Changes",
  onDelete,
  deleteLabel = "Delete",
  error = null,
  sidebar,
  children,
  className,
}: CrudLayoutProps) {
  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto pb-12", className)}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-1 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>{backLabel}</span>
            </Link>
          )}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors disabled:opacity-50 h-10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleteLabel}</span>
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-espresso text-cream hover:bg-espresso-500 transition-colors shadow-sm disabled:opacity-50 h-10 focus-visible:outline-2 focus-visible:outline-accent"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-caramel" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-caramel" />
                  <span>{saveLabel}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-xs text-destructive flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Area */}
        <div className={cn("space-y-6", sidebar ? "lg:col-span-8" : "lg:col-span-12")}>
          {children}
        </div>

        {/* Sidebar / Metadata Area */}
        {sidebar && (
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
}
