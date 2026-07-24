"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { isMotionReduced } from "@/lib/motion-safe";

interface HeroTitleProps {
  text: string;
  className?: string;
  delay?: number;
}

export function HeroTitle({ text, className, delay = 0.4 }: HeroTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current || isMotionReduced()) return;
    const chars = containerRef.current.querySelectorAll(".char");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { y: 80, opacity: 0, rotateX: -90 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.04,
          delay,
          ease: "back.out(1.7)",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [delay, text]);

  const chars = text.split("");

  return (
    <h1 ref={containerRef} className={className} style={{ perspective: "800px" }}>
      {chars.map((char, i) => (
        <span
          key={i}
          className="char inline-block"
          style={{ opacity: typeof window !== "undefined" && isMotionReduced() ? 1 : 0 }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h1>
  );
}
