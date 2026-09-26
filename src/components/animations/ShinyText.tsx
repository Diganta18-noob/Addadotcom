"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export function ShinyText({
  children,
  className,
  shimmerWidth = 100,
}: ShinyTextProps) {
  return (
    <span
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as React.CSSProperties
      }
      className={cn(
        "inline-block bg-[length:250%_100%] bg-clip-text text-transparent animate-shimmer",
        "bg-gradient-to-r from-neutral-800 via-caramel to-neutral-800 dark:from-neutral-200 dark:via-caramel dark:to-neutral-200",
        className
      )}
    >
      {children}
    </span>
  );
}
