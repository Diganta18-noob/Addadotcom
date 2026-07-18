import { z } from "zod";

// ─── Order Validation Schemas ──────────────────────────────────────────────

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID is required"),
  menuItemName: z.string().min(1, "Menu item name is required"),
  qty: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().positive("Unit price must be positive"),
  totalPrice: z.number().positive("Total price must be positive"),
  variant: z.string().optional(),
  addons: z.array(z.string()).default([]),
  note: z.string().max(200, "Note too long").optional(),
});

export const createOrderSchema = z.object({
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]),
  userId: z.string().optional().nullable(),
  tableId: z.string().optional().nullable(),
  tableNumber: z.union([z.string(), z.number()]).optional().nullable(),
  reservationId: z.string().optional().nullable(),
  deliveryAddress: z.string().max(300).optional().nullable(),
  deliveryFee: z.number().min(0).default(0),
  pickupTime: z.string().optional().nullable(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().nullable(),
  items: z.any(), // JSON array stored as-is
});

export const updateOrderSchema = z.object({
  status: z.enum(["PLACED", "ACCEPTED", "PREPARING", "READY", "SERVED", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().max(500).optional(),
  items: z.any().optional(),
});

// ─── Reservation Validation Schemas ────────────────────────────────────────

export const createReservationSchema = z.object({
  userId: z.string().optional(),
  guestName: z.string().min(2, "Guest name must be at least 2 characters").max(100),
  guestEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  guestPhone: z.string().min(7, "Phone number must be at least 7 digits").max(20),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid reservation date"),
  timeSlot: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time slot must be HH:MM format (e.g. 19:00)"),
  duration: z.number().int().min(30).max(300).optional(),
  partySize: z.number().int().min(1, "Party size must be at least 1").max(30, "For parties over 30, please call us directly"),
  tableId: z.string().optional(),
  notes: z.string().max(300).optional(),
});

export const updateReservationSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SEATED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  tableId: z.string().optional(),
  partySize: z.number().int().min(1).max(30).optional(),
  notes: z.string().max(300).optional(),
  date: z.string().optional(),
  timeSlot: z.string().optional(),
});

// ─── Menu Validation Schemas ───────────────────────────────────────────────

export const createMenuItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(2, "Item name must be at least 2 characters").max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive("Price must be greater than 0"),
  image: z.string().optional().or(z.literal("")),
  tags: z.union([z.string(), z.array(z.string())]).default(""),
  isAvailable: z.boolean().default(true),
  prepTime: z.number().int().min(1).max(120).optional().nullable(),
  sortOrder: z.number().int().default(0),
  isSpecial: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  variants: z.any().default([]),
  addons: z.any().default([]),
});

export const updateMenuItemSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(2).max(100).optional(),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().optional(),
  image: z.string().optional().nullable(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  isAvailable: z.boolean().optional(),
  prepTime: z.number().int().min(1).max(120).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isSpecial: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  variants: z.any().optional(),
  addons: z.any().optional(),
});

// ─── Table Validation Schema ───────────────────────────────────────────────

export const updateTableSchema = z.object({
  status: z.enum(["FREE", "RESERVED", "OCCUPIED", "BILL_REQUESTED", "NEEDS_CLEANING"]).optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  zone: z.enum(["INDOOR", "OUTDOOR", "TERRACE"]).optional(),
});

// ─── Billing Validation Schemas ────────────────────────────────────────────

export const createBillSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  subtotal: z.number().min(0),
  discounts: z.any().default([]),
  serviceCharge: z.number().min(0).default(0),
  serviceChargeRate: z.number().min(0).default(0),
  taxes: z.any().default([]),
  total: z.number().min(0),
  roundingAdj: z.number().default(0),
  cashierId: z.string().optional(),
  splitConfig: z.any().optional(),
  payments: z.any().default([]),
});

export const updateBillSchema = z.object({
  status: z.enum(["UNPAID", "PAID", "REFUNDED", "VOID"]).optional(),
  payments: z.any().optional(),
  total: z.number().min(0).optional(),
  roundingAdj: z.number().optional(),
  refundReason: z.string().max(300).optional(),
  cashierId: z.string().optional(),
});

// ─── Promo Code Validation Schema ──────────────────────────────────────────

export const validatePromoSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  amount: z.number().min(0, "Order amount is required"),
});

export const promoCodeSchema = z.object({
  code: z.string().min(3).max(20).transform((val) => val.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("Discount value must be positive"),
  minOrder: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

// ─── Inventory Validation Schemas ──────────────────────────────────────────

export const createInventorySchema = z.object({
  name: z.string().min(2, "Item name is required").max(100),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).default(0),
});

export const adjustInventorySchema = z.object({
  change: z.number(),
  reason: z.string().max(300).optional(),
});

// ─── Settings Validation Schema ────────────────────────────────────────────

export const updateSettingsSchema = z.union([
  z.array(z.object({
    key: z.string().min(1),
    value: z.union([z.string(), z.number(), z.boolean()]),
  })),
  z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
]);
