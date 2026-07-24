"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMotionReduced } from "@/lib/motion-safe";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(stagger = 0.1) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current || isMotionReduced()) return;
    const items = ref.current.querySelectorAll("[data-reveal]");
    if (items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [stagger]);

  return ref;
}
