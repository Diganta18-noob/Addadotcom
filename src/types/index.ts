// ─── Menu Types ─────────────────────────────────────────────

export interface MenuVariantOption {
  label: string;
  priceModifier: number;
}

export interface MenuVariant {
  name: string;
  options: MenuVariantOption[];
}

export interface MenuAddon {
  name: string;
  price: number;
}

export interface MenuItemRecipe {
  inventoryItemId: string;
  quantity: number;
  unit: string;
}

export interface MenuItemType {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  tags: string[];
  isAvailable: boolean;
  prepTime: number | null;
  sortOrder: number;
  isSpecial: boolean;
  isBestseller: boolean;
  variants: MenuVariant[];
  addons: MenuAddon[];
  recipe: MenuItemRecipe[];
  category?: CategoryType;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
  items?: MenuItemType[];
}

// ─── Cart Types ─────────────────────────────────────────────

export interface CartItemAddon {
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart item ID
  menuItemId: string;
  menuItemName: string;
  menuItemImage?: string | null;
  quantity: number;
  variant?: string | null; // selected variant label e.g. "Large"
  variantPrice: number; // base price + variant modifier
  addons?: CartItemAddon[];
  note?: string;
  unitPrice: number; // variantPrice + sum of addon prices
  totalPrice: number; // unitPrice * quantity
}

// ─── Order Types ────────────────────────────────────────────

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED";

export interface OrderItemType {
  menuItemId: string;
  menuItemName: string;
  qty: number;
  variant: string | null;
  addons: CartItemAddon[];
  note: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderType2 {
  id: string;
  orderNumber: string;
  userId: string | null;
  type: OrderType;
  tableId: string | null;
  reservationId: string | null;
  status: OrderStatus;
  notes: string | null;
  deliveryAddress: string | null;
  deliveryFee: number;
  pickupTime: string | null;
  items: OrderItemType[];
  bill?: BillType;
  createdAt: string;
  updatedAt: string;
}

// ─── Table Types ────────────────────────────────────────────

export type TableStatus = "FREE" | "RESERVED" | "OCCUPIED" | "BILL_REQUESTED" | "NEEDS_CLEANING";
export type TableZone = "INDOOR" | "OUTDOOR" | "TERRACE";

export interface CafeTableType {
  id: string;
  number: number;
  capacity: number;
  zone: TableZone;
  status: TableStatus;
}

// ─── Reservation Types ──────────────────────────────────────

export type ReservationStatus = "PENDING" | "CONFIRMED" | "SEATED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface ReservationType {
  id: string;
  userId: string | null;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string;
  date: string;
  timeSlot: string;
  duration: number;
  partySize: number;
  tableId: string | null;
  status: ReservationStatus;
  bookingCode: string;
  notes: string | null;
  table?: CafeTableType;
  createdAt: string;
  updatedAt: string;
}

// ─── Billing Types ──────────────────────────────────────────

export type BillStatus = "UNPAID" | "PAID" | "REFUNDED" | "VOID";

export interface BillDiscount {
  label: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  amount: number;
}

export interface BillTax {
  name: string;
  rate: number;
  amount: number;
}

export interface BillPayment {
  method: "CASH" | "CARD" | "UPI" | "WALLET";
  amount: number;
  reference?: string;
}

export interface BillSplitConfig {
  type: "EQUAL" | "BY_ITEMS";
  parts: BillSplitPart[];
}

export interface BillSplitPart {
  label: string;
  amount: number;
  items?: string[];
  payments: BillPayment[];
  isPaid: boolean;
}

export interface BillType {
  id: string;
  billNumber: string;
  orderId: string;
  subtotal: number;
  discounts: BillDiscount[];
  serviceCharge: number;
  serviceChargeRate: number;
  taxes: BillTax[];
  total: number;
  roundingAdj: number;
  payments: BillPayment[];
  status: BillStatus;
  cashierId: string | null;
  refundReason: string | null;
  pdfUrl: string | null;
  splitConfig: BillSplitConfig | null;
  order?: OrderType2;
  createdAt: string;
  updatedAt: string;
}

// ─── Inventory Types ────────────────────────────────────────

export interface InventoryItemType {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  lowStockThreshold: number;
  isLowStock?: boolean;
}

// ─── Promo Types ────────────────────────────────────────────

export interface PromoCodeType {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
}

// ─── User Types ─────────────────────────────────────────────

export type UserRole = "CUSTOMER" | "STAFF" | "MANAGER" | "ADMIN";

export interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  loyaltyPoints: number;
  image: string | null;
}

// ─── Settings Types ─────────────────────────────────────────

export interface SettingType {
  key: string;
  value: string;
  group: string;
}

// ─── Dashboard Types ────────────────────────────────────────

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  avgOrderValue: number;
  todayReservations: number;
  topSellingItems: { name: string; count: number; revenue: number }[];
  revenueByDay: { date: string; revenue: number }[];
  salesByCategory: { category: string; revenue: number }[];
}

// ─── API Response Types ─────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
