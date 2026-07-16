import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}

export function generateBillNumber(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BILL-${datePart}-${randomPart}`;
}

export function generateBookingCode(): string {
  return `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

// Dietary tag colors
export const TAG_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  VEG: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Veg" },
  NON_VEG: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Non-Veg" },
  VEGAN: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", label: "Vegan" },
  GLUTEN_FREE: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", label: "GF" },
  SPICY: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", label: "Spicy" },
};

// Table status colors
export const TABLE_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  FREE: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", dot: "bg-green-500" },
  RESERVED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  OCCUPIED: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  BILL_REQUESTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  NEEDS_CLEANING: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" },
};

// Order status configs
export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PLACED: { label: "Placed", color: "bg-blue-500", icon: "📋" },
  ACCEPTED: { label: "Accepted", color: "bg-indigo-500", icon: "✅" },
  PREPARING: { label: "Preparing", color: "bg-amber-500", icon: "👨‍🍳" },
  READY: { label: "Ready", color: "bg-green-500", icon: "🔔" },
  SERVED: { label: "Served", color: "bg-emerald-500", icon: "🍽️" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-purple-500", icon: "🚗" },
  COMPLETED: { label: "Completed", color: "bg-gray-500", icon: "✨" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500", icon: "❌" },
};
