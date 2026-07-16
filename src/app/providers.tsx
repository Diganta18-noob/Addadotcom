"use client";

import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useUIStore } from "@/store";
import { Navbar, MobileBottomBar, Footer } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { usePathname } from "next/navigation";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useUIStore();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // Apply dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
          },
        }}
      />
      <CartDrawer />
      {!isAdmin && <Navbar />}
      <main className={isAdmin ? "" : "min-h-screen"}>
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <MobileBottomBar />}
    </>
  );
}
