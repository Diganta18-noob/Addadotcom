"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingCart,
  Sun,
  Moon,
  User,
  Coffee,
  UtensilsCrossed,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import { useCartStore, useUIStore } from "@/store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/reserve", label: "Reserve" },
  { href: "/order", label: "Order" },
  { href: "/#about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, toggleCart, isDarkMode, toggleDarkMode } = useUIStore();
  
  const rawItemCount = useCartStore((s) => s.getItemCount());
  const itemCount = mounted ? rawItemCount : 0;
  const isDarkModeVal = mounted ? isDarkMode : false;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    const aboutSec = document.getElementById("about");
    if (aboutSec) observer.observe(aboutSec);

    return () => {
      if (aboutSec) observer.unobserve(aboutSec);
    };
  }, [pathname]);

  const isLinkActive = (href: string) => {
    if (href === "/#about") {
      return activeSection === "about";
    }
    if (href === "/") {
      return pathname === "/" && activeSection !== "about";
    }
    return pathname === href;
  };

  // White text/transparent background only on home page when not scrolled
  const isDarkHeader = pathname === "/" && !scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isDarkHeader
            ? "bg-transparent"
            : "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-espresso flex items-center justify-center group-hover:bg-espresso-500 transition-colors">
                <Coffee className="w-5 h-5 text-caramel" />
              </div>
              <span className={cn(
                "font-serif text-xl font-bold transition-colors",
                isDarkHeader ? "text-white drop-shadow-lg" : "text-foreground"
              )}>
                AddaDotCom
              </span>
            </Link>

            {/* Desktop Navigation (xl screens and above) */}
            <div className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-full transition-all",
                    isLinkActive(link.href)
                      ? "text-caramel"
                      : isDarkHeader
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                  {isLinkActive(link.href) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-caramel"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={cn(
                  "p-2 rounded-full transition-all",
                  isDarkHeader
                    ? "hover:bg-white/10 text-white/80"
                    : "hover:bg-muted text-foreground/70"
                )}
                aria-label="Toggle dark mode"
              >
                {isDarkModeVal ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className={cn(
                  "relative p-2 rounded-full transition-all",
                  isDarkHeader
                    ? "hover:bg-white/10 text-white/80"
                    : "hover:bg-muted text-foreground/70"
                )}
                aria-label={`Cart (${itemCount} items)`}
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-caramel text-espresso text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </button>

              {/* User/Account */}
              <Link
                href="/account"
                className={cn(
                  "p-2 rounded-full transition-all hidden sm:block",
                  isDarkHeader
                    ? "hover:bg-white/10 text-white/80"
                    : "hover:bg-muted text-foreground/70"
                )}
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Admin Link */}
              <Link
                href="/admin"
                className={cn(
                  "hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all",
                  isDarkHeader
                    ? "border-white/30 text-white/70 hover:bg-white/10"
                    : "border-border text-foreground/60 hover:bg-muted"
                )}
              >
                Admin
              </Link>

              {/* Mobile/Tablet Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className={cn(
                  "xl:hidden p-2 rounded-full transition-all",
                  isDarkHeader
                    ? "hover:bg-white/10 text-white/80"
                    : "hover:bg-muted text-foreground/70"
                )}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 xl:hidden"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMobileMenu} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-background shadow-xl border-l border-border"
            >
              <div className="p-6 pt-20 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                      isLinkActive(link.href)
                        ? "bg-caramel/10 text-caramel"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border pt-4 mt-4">
                  <Link
                    href="/account"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground/70 hover:bg-muted"
                  >
                    <User className="w-5 h-5" />
                    Account
                  </Link>
                  <Link
                    href="/admin"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground/70 hover:bg-muted"
                  >
                    <ClipboardList className="w-5 h-5" />
                    Admin Panel
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Mobile Bottom Bar ──────────────────────────────────────

const bottomLinks = [
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/reserve", label: "Reserve", icon: CalendarDays },
  { href: "/order", label: "Order", icon: ClipboardList },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

export function MobileBottomBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const rawItemCount = useCartStore((s) => s.getItemCount());
  const itemCount = mounted ? rawItemCount : 0;
  const { openCart } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 xl:hidden bg-background/95 backdrop-blur-md border-t border-border safe-bottom">
      <nav className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {bottomLinks.map((link) => {
          const isCart = link.href === "/cart";
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <button
              key={link.href}
              onClick={() => {
                if (isCart) {
                  openCart();
                } else {
                  router.push(link.href);
                }
              }}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px]",
                isActive
                  ? "text-caramel"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={link.label}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-caramel text-espresso text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{link.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottom-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-caramel"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Footer ─────────────────────────────────────────────────

export function Footer() {
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-espresso text-cream-100 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-caramel/20 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-caramel" />
              </div>
              <span className="font-serif text-xl font-bold text-cream">AddaDotCom</span>
            </div>
            <p className="text-cream-200/70 text-sm leading-relaxed">
              Where every cup tells a story and every meal brings people together.
              Experience the warmth of authentic café culture.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-caramel">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-200/70 hover:text-caramel transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-caramel">Opening Hours</h3>
            <ul className="space-y-2 text-sm text-cream-200/70">
              <li className="flex justify-between">
                <span>Mon – Fri</span>
                <span>7:00 AM – 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>8:00 AM – 11:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>8:00 AM – 10:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-caramel">Contact</h3>
            <ul className="space-y-2 text-sm text-cream-200/70">
              <li>123 Café Street, Salt Lake Sector V</li>
              <li>Kolkata, West Bengal 700091</li>
              <li>+91 98765 43210</li>
              <li>hello@addadotcom.cafe</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream-200/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-cream-200/50">
            © {new Date().getFullYear()} AddaDotCom. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-cream-200/50">
            <Link href="/privacy" className="hover:text-caramel transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-caramel transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-caramel transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
