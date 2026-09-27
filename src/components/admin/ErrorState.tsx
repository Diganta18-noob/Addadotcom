"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  message?: string;
  requestId?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = "Unable to synchronize data with the server. Please try again.",
  requestId,
  onRetry,
  className,
}: ErrorStateProps) {
  // Dual-layer guard: ensure no raw technical error or JSON parse error reaches the screen
  const isTechnical = /token|doctype|json|syntax|typeerror|failed to fetch|<|>/i.test(message);
  const displayMessage = isTechnical
    ? "Unable to synchronize data with the server. Please try again."
    : message;

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-destructive/20 bg-destructive/5 my-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-3 text-destructive shadow-xs">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-lg font-bold text-foreground mb-1">
        Data Synchronization Issue
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-2 leading-relaxed">
        {displayMessage}
      </p>
      {requestId && (
        <p className="text-[11px] font-mono text-muted-foreground/70 mb-5">
          Reference Code: <span className="select-all font-semibold">{requestId}</span>
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border/80 hover:bg-muted text-foreground text-xs font-semibold rounded-xl transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-accent"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
}
