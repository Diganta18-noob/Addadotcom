"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/animations/NumberTicker";
import { CardSpotlight } from "@/components/animations/CardSpotlight";
import { BorderBeam } from "@/components/animations/BorderBeam";

interface VengenceKpiCardProps {
  label: string;
  rawValue?: number;
  prefix?: string;
  suffix?: string;
  fallbackValue?: string;
  change: string;
  positive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  delay?: number;
  isLive?: boolean;
  hasBeam?: boolean;
  beamColor?: string;
}

export function VengenceKpiCard({
  label,
  rawValue,
  prefix = "",
  suffix = "",
  fallbackValue,
  change,
  positive = true,
  icon: Icon,
  color,
  delay = 0,
  isLive = false,
  hasBeam = false,
  beamColor = "#D4A056",
}: VengenceKpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
    >
      <CardSpotlight
        spotlightColor="rgba(212, 160, 86, 0.12)"
        className={cn(
          "relative h-full p-6 bg-card/90 backdrop-blur-xl border border-border/70 hover:border-caramel/40 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl group overflow-hidden"
        )}
      >
        {/* Top Edge Neon Accent Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-caramel/40 to-transparent group-hover:via-caramel transition-all duration-500" />

        {/* Optional Border Beam for featured card */}
        {hasBeam && (
          <BorderBeam
            size={180}
            duration={10}
            colorFrom={beamColor}
            colorTo="#7A5650"
            borderWidth={1.5}
          />
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
              {isLive && (
                <span className="relative flex h-2 w-2" title="Live real-time metric">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>

            <div className="text-2xl sm:text-3xl font-bold font-serif text-foreground tracking-tight pt-1">
              {rawValue !== undefined ? (
                <NumberTicker
                  value={rawValue}
                  prefix={prefix}
                  suffix={suffix}
                  delay={delay}
                />
              ) : (
                <span>{fallbackValue}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 pt-2">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold",
                  positive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {positive ? (
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                )}
                {change}
              </span>
            </div>
          </div>

          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-border/60 transition-transform duration-300 group-hover:scale-105 shadow-xs",
              color
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardSpotlight>
    </motion.div>
  );
}
