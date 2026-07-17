import { z } from "zod";

// ─── Shared Enums ──────────────────────────────────────────

const OrderTypeEnum = z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]);
const OrderStatusEnum = z.enum([
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "SERVED",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
]);
const ReservationStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);
const TableStatusEnum = z.enum([
  "FREE",
  "RESERVED",
  "OCCUPIED",
  "BILL_REQUESTED",
  "NEEDS_CLEANING",
]);
const TableZoneEnum = z.enum(["INDOOR", "OUTDOOR", "TERRACE"]);
const BillStatusEnum = z.enum(["UNPAID", "PAID", "REFUNDED", "VOID"]);

// ─── Order Schemas ─────────────────────────────────────────

const orderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID is required"),
  menuItemName: z.string().min(1, "Menu item name is required"),
  qty: z.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
  totalPrice: z.number().nonnegative("Total price must be non-negative"),
  variant: z.string().optional(),
  addons: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().optional(),
      })
    )
    .optional(),
  note: z.string().optional(),
});

export const createOrderSchema = z
  .object({
    userId: z.string().optional().nullable(),
    type: OrderTypeEnum,
    tableId: z.string().optional().nullable(),
    reservationId: z.string().optional().nullable(),
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
    notes: z.string().optional().nullable(),
    deliveryAddress: z.string().optional().nullable(),
    deliveryFee: z.number().nonnegative().optional().default(0),
    pickupTime: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // Dine-in should have a tableId
      if (data.type === "DINE_IN" && !data.tableId) {
        return true; // Allow for now — walk-in orders may not have a table assigned yet
      }
      return true;
    },
    { message: "Dine-in orders should include a table ID" }
  );

export const updateOrderSchema = z.object({
  status: OrderStatusEnum.optional(),
  notes: z.string().optional().nullable(),
  items: z.any().optional(), // JSON — flexible for updates
});

// ─── Reservation Schemas ───────────────────────────────────

export const createReservationSchema = z.object({
  userId: z.string().optional().nullable(),
  guestName: z.string().min(1, "Guest name is required"),
  guestEmail: z.string().email("Invalid email address").optional().nullable(),
  guestPhone: z.string().min(5, "Phone number is required"),
  date: z.string().min(1, "Date is required"),
  timeSlot: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/, "Time slot must be in HH:MM format"),
  duration: z.number().int().positive().optional().default(90),
  partySize: z.number().int().min(1, "Party size must be at least 1"),
  notes: z.string().optional().nullable(),
});

export const updateReservationSchema = z.object({
  status: ReservationStatusEnum.optional(),
  tableId: z.string().optional().nullable(),
  date: z.string().optional(),
  timeSlot: z.string().optional(),
  partySize: z.number().int().min(1).optional(),
  notes: z.string().optional().nullable(),
});

// ─── Menu Schemas ──────────────────────────────────────────

export const createMenuItemSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  name: z.string().min(1, "Item name is required"),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  price: z.number().positive("Price must be greater than 0"),
  image: z.string().optional().nullable(),
  tags: z.union([z.string(), z.array(z.string())]).optional().default(""),
  isAvailable: z.boolean().optional().default(true),
  prepTime: z.number().int().nonnegative().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
  isSpecial: z.boolean().optional().default(false),
  isBestseller: z.boolean().optional().default(false),
  variants: z.any().optional().default([]),
  addons: z.any().optional().default([]),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

// ─── Billing Schemas ───────────────────────────────────────

const paymentSchema = z.object({
  method: z.enum(["CASH", "CARD", "UPI", "WALLET"]),
  amount: z.number().nonnegative(),
  reference: z.string().optional(),
});

const discountSchema = z.object({
  label: z.string(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

const taxSchema = z.object({
  name: z.string(),
  rate: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

export const createBillSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  subtotal: z.number().nonnegative(),
  serviceCharge: z.number().nonnegative().optional().default(0),
  serviceChargeRate: z.number().nonnegative().optional().default(0),
  total: z.number().nonnegative(),
  roundingAdj: z.number().optional().default(0),
  cashierId: z.string().optional().nullable(),
  discounts: z.array(discountSchema).optional().default([]),
  taxes: z.array(taxSchema).optional().default([]),
  payments: z.array(paymentSchema).optional().default([]),
  splitConfig: z.any().optional().nullable(),
});

export const updateBillSchema = z.object({
  status: BillStatusEnum.optional(),
  payments: z.array(paymentSchema).optional(),
  total: z.number().nonnegative().optional(),
  roundingAdj: z.number().optional(),
  refundReason: z.string().optional().nullable(),
  cashierId: z.string().optional().nullable(),
});

// ─── Inventory Schemas ─────────────────────────────────────

export const createInventorySchema = z.object({
  name: z.string().min(1, "Item name is required"),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().nonnegative("Quantity must be non-negative").default(0),
  lowStockThreshold: z.number().nonnegative().default(0),
});

export const adjustInventorySchema = z.object({
  change: z.number({ required_error: "Change amount is required" }),
  reason: z.string().optional().default("Manual adjustment"),
});

// ─── Table Schemas ─────────────────────────────────────────

export const updateTableSchema = z.object({
  status: TableStatusEnum.optional(),
  capacity: z.number().int().positive().optional(),
  zone: TableZoneEnum.optional(),
});

// ─── Settings Schemas ──────────────────────────────────────

const settingEntrySchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

// Settings can be an array of { key, value } or a single object
export const updateSettingsSchema = z.union([
  z.array(settingEntrySchema).min(1, "At least one setting is required"),
  z.record(z.string(), z.string()),
]);

// ─── Promo Schema ──────────────────────────────────────────

export const validatePromoSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  amount: z.number().positive("Order amount must be positive"),
});
