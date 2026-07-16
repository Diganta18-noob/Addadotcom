import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartItemAddon } from "@/types";

interface CartStore {
  items: CartItem[];
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableNumber: string;
  deliveryAddress: string;
  deliveryFee: number;
  pickupTime: string;
  orderNotes: string;
  promoCode: string;
  promoDiscount: number;
  tipAmount: number;

  // Actions
  addItem: (item: Omit<CartItem, "id" | "totalPrice">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNote: (id: string, note: string) => void;
  clearCart: () => void;
  setOrderType: (type: "DINE_IN" | "TAKEAWAY" | "DELIVERY") => void;
  setTableNumber: (tableNumber: string) => void;
  setDeliveryAddress: (address: string) => void;
  setDeliveryFee: (fee: number) => void;
  setPickupTime: (time: string) => void;
  setOrderNotes: (notes: string) => void;
  setPromoCode: (code: string, discount: number) => void;
  clearPromo: () => void;
  setTipAmount: (amount: number) => void;

  // Computed
  getSubtotal: () => number;
  getTaxes: () => { cgst: number; sgst: number };
  getServiceCharge: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: "DINE_IN",
      tableNumber: "",
      deliveryAddress: "",
      deliveryFee: 0,
      pickupTime: "",
      orderNotes: "",
      promoCode: "",
      promoDiscount: 0,
      tipAmount: 0,

      addItem: (item) => {
        const id = `${item.menuItemId}-${item.variant || "default"}-${item.addons.map(a => a.name).join(",")}`;
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.id === id && i.note === item.note
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + item.quantity,
              totalPrice: (updated[existingIndex].quantity + item.quantity) * item.unitPrice,
            };
            return { items: updated };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                id,
                totalPrice: item.quantity * item.unitPrice,
              },
            ],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity, totalPrice: quantity * i.unitPrice }
              : i
          ),
        }));
      },

      updateNote: (id, note) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, note } : i)),
        }));
      },

      clearCart: () => {
        set({
          items: [],
          orderNotes: "",
          promoCode: "",
          promoDiscount: 0,
          tipAmount: 0,
        });
      },

      setOrderType: (type) => set({ orderType: type }),
      setTableNumber: (tableNumber) => set({ tableNumber }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      setDeliveryFee: (fee) => set({ deliveryFee: fee }),
      setPickupTime: (time) => set({ pickupTime: time }),
      setOrderNotes: (notes) => set({ orderNotes: notes }),
      setPromoCode: (code, discount) => set({ promoCode: code, promoDiscount: discount }),
      clearPromo: () => set({ promoCode: "", promoDiscount: 0 }),
      setTipAmount: (amount) => set({ tipAmount: amount }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      getTaxes: () => {
        const subtotal = get().getSubtotal() - get().promoDiscount;
        const taxableAmount = Math.max(0, subtotal);
        return {
          cgst: Math.round(taxableAmount * 0.025 * 100) / 100, // 2.5%
          sgst: Math.round(taxableAmount * 0.025 * 100) / 100, // 2.5%
        };
      },

      getServiceCharge: () => {
        const subtotal = get().getSubtotal();
        return get().orderType === "DINE_IN"
          ? Math.round(subtotal * 0.05 * 100) / 100 // 5% service charge for dine-in
          : 0;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const taxes = get().getTaxes();
        const serviceCharge = get().getServiceCharge();
        const deliveryFee = get().orderType === "DELIVERY" ? get().deliveryFee : 0;
        const total =
          subtotal -
          get().promoDiscount +
          taxes.cgst +
          taxes.sgst +
          serviceCharge +
          deliveryFee +
          get().tipAmount;
        return Math.round(Math.max(0, total) * 100) / 100;
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "addadotcom-cart",
      partialize: (state) => ({
        items: state.items,
        orderType: state.orderType,
        tableNumber: state.tableNumber,
        deliveryAddress: state.deliveryAddress,
        pickupTime: state.pickupTime,
        orderNotes: state.orderNotes,
      }),
    }
  )
);

// ─── UI Store ───────────────────────────────────────────────

interface UIStore {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isDarkMode: boolean;
  selectedCategory: string | null;

  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  setSelectedCategory: (category: string | null) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isMobileMenuOpen: false,
      isCartOpen: false,
      isDarkMode: false,
      selectedCategory: null,

      toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleDarkMode: () =>
        set((s) => {
          const newDark = !s.isDarkMode;
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newDark);
          }
          return { isDarkMode: newDark };
        }),
      setDarkMode: (dark) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", dark);
        }
        set({ isDarkMode: dark });
      },
      setSelectedCategory: (category) => set({ selectedCategory: category }),
    }),
    {
      name: "addadotcom-ui",
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
