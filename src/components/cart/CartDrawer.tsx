"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore, useUIStore } from "@/store";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";

export function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getItemCount,
  } = useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-caramel" />
                <h2 className="font-serif text-lg font-semibold">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 bg-caramel/10 text-caramel text-xs font-bold rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add some delicious items from our menu!
                  </p>
                  <Link
                    href="/menu"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-espresso text-cream rounded-full text-sm font-medium hover:bg-espresso-500 transition-colors"
                  >
                    Browse Menu
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4 p-3 rounded-xl border border-border bg-card"
                    >
                      {/* Image placeholder */}
                      <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                        {item.menuItemImage ? (
                          <img
                            src={item.menuItemImage}
                            alt={item.menuItemName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            ☕
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate">
                          {item.menuItemName}
                        </h4>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.variant}
                          </p>
                        )}
                        {item.addons && item.addons.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            +{item.addons.map((a) => a.name).join(", ")}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-xs text-caramel mt-0.5 italic">
                            &quot;{item.note}&quot;
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-caramel">
                            {formatCurrency(item.totalPrice)}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-semibold w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors ml-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-6 py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-bold font-serif">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxes and charges calculated at checkout
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Clear
                  </button>
                  <Link
                    href="/order"
                    onClick={closeCart}
                    className="flex-[2] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-espresso text-cream rounded-xl text-sm font-medium hover:bg-espresso-500 transition-colors"
                  >
                    Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
