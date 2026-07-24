"use client";

import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useUIStore } from "@/store";
import { Navbar, MobileBottomBar, Footer } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { usePathname } from "next/navigation";

import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { PageTransition } from "@/components/animations/PageTransition";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useUIStore();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const publicContent = (
    <SmoothScrollProvider>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MobileBottomBar />
    </SmoothScrollProvider>
  );

  const adminContent = (
    <>
      <CartDrawer />
      <main>{children}</main>
    </>
  );

  return (
    <SessionProvider>
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
      {isAdmin ? adminContent : publicContent}
    </SessionProvider>
  );
}
