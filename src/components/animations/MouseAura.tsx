"use client";

import React, { useEffect, useRef } from "react";
import { isMotionReduced } from "@/lib/motion-safe";

interface MouseAuraProps {
  color?: string;
  size?: number;
  opacity?: number;
}

export function MouseAura({
  color = "rgba(212, 160, 86, 0.08)",
  size = 450,
  opacity = 1,
}: MouseAuraProps) {
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMotionReduced()) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const updatePosition = () => {
      // Lerp smoothing (Animmaster physics)
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${currentX - size / 2}px, ${currentY - size / 2}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [size]);

  return (
    <div
      ref={auraRef}
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color} 0%, rgba(212, 160, 86, 0) 70%)`,
        opacity,
      }}
      className="pointer-events-none fixed top-0 left-0 z-40 rounded-full blur-2xl will-change-transform hidden md:block"
    />
  );
}
