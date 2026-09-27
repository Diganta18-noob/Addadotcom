"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MotionBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.25,
  className,
  ...props
}: MotionBoxProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({
  children,
  direction = "left",
  delay = 0,
  className,
  ...props
}: MotionBoxProps & { direction?: "left" | "right" | "top" | "bottom" }) {
  const shouldReduceMotion = useReducedMotion();

  const getInitial = () => {
    if (shouldReduceMotion) return { opacity: 1 };
    switch (direction) {
      case "left":
        return { opacity: 0, x: -16 };
      case "right":
        return { opacity: 0, x: 16 };
      case "top":
        return { opacity: 0, y: -16 };
      case "bottom":
        return { opacity: 0, y: 16 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({
  children,
  className,
  staggerDelay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({
  children,
  className,
  y = -2,
  ...props
}: MotionBoxProps & { y?: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y, transition: { duration: 0.15, ease: "easeOut" } }}
      className={cn("transition-shadow", className)}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
