"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  CalendarDays,
  Coffee,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import { useCartStore } from "@/store";
import { cn } from "@/lib/utils";

export function FloatingDock() {
  const [visible, setVisible] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 inset-x-0 mx-auto w-max z-40 hidden sm:block"
        >
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-espresso/90 dark:bg-card/90 backdrop-blur-xl border border-caramel/30 shadow-2xl shadow-black/40 text-cream">
            <Link
              href="/menu"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold hover:bg-caramel/20 hover:text-caramel transition-all"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-caramel" />
              <span>Menu</span>
            </Link>

            <Link
              href="/reserve"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold hover:bg-caramel/20 hover:text-caramel transition-all"
            >
              <CalendarDays className="w-3.5 h-3.5 text-caramel" />
              <span>Reserve</span>
            </Link>

            <Link
              href="/order"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-caramel text-espresso hover:bg-caramel-300 transition-all font-bold shadow-sm"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Order Online</span>
              {itemCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-espresso text-cream text-[10px] flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            <a
              href="https://maps.google.com/?q=Salt+Lake+Sector+V,+Kolkata,+West+Bengal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold hover:bg-white/10 transition-all text-cream-200/80 hover:text-cream"
              title="Get Directions"
            >
              <MapPin className="w-3.5 h-3.5 text-caramel" />
              <span className="hidden md:inline">Directions</span>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
