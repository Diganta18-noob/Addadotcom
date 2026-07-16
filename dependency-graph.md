# Dependency Graph — AddaDotCom

This document registers the import hierarchies, high-impact directories, shared helpers, and files that are critical to the execution of the application.

---

## 🛠️ Critical & High-Impact Code Files

These files are essential to the core functionality of the application and should not be modified without thorough testing.

```
                         [src/lib/prisma.ts]
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
        [Server REST APIs]              [prisma/seed.ts]
      (/src/app/api/orders/*)            (Database seed)
      (/src/app/api/tables/*)
         (/api/reservations)
                 │
                 ▼
      [Prisma ORM (dev.db)]
```

### 1. Prisma Client Setup
- **File:** [prisma.ts](file:///c:/Antigravity/Cafe/addadotcom/src/lib/prisma.ts)
- **Impact:** Global singleton instantiator of `PrismaClient` matching SQLite databases. If broken, all backend REST endpoints and seeds will fail.

### 2. NextAuth Configuration
- **File:** [auth.ts](file:///c:/Antigravity/Cafe/addadotcom/src/lib/auth.ts)
- **Impact:** Stores authentication providers, callbacks, password matching logic, and JWT session bindings.

### 3. Zustand Global State Stores
- **File:** [store/index.ts](file:///c:/Antigravity/Cafe/addadotcom/src/store/index.ts)
- **Impact:** Manages persistent shopping cart items, order types, tips, tax calculations, mobile drawer parameters, and dark mode toggles.

### 4. Shared UI Badges & Inputs
- **File:** [components/shared/index.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/components/shared/index.tsx)
- **Impact:** Shared component export index. Holds UI badges like `StatusBadge`, `DietaryTag`, `EmptyState`, and skeleton loaders.

### 5. Shared Utilities & Formatters
- **File:** [lib/utils.ts](file:///c:/Antigravity/Cafe/addadotcom/src/lib/utils.ts)
- **Impact:** Handles formatting helpers (`formatCurrency` to INR, date and time converters) and prefix code generators (`generateOrderNumber`, `generateBillNumber`).

---

## 🔄 Import Graph

```
src/app/page.tsx (Homepage)
  ├─── framer-motion
  ├─── lucide-react
  └─── src/lib/utils.ts (formatCurrency, cn)

src/app/menu/page.tsx (Customer Menu)
  ├─── src/store/index.ts (useCartStore, useUIStore)
  ├─── src/components/shared/index.tsx (DietaryTag, MenuCardSkeleton, EmptyState, SearchInput)
  └─── src/lib/utils.ts (cn, formatCurrency)

src/app/order/page.tsx (Customer Checkout)
  ├─── src/store/index.ts (useCartStore)
  └─── src/lib/utils.ts (cn, formatCurrency, generateOrderNumber)

src/app/reserve/page.tsx (Customer Booking)
  └─── src/lib/utils.ts (cn, formatDate, generateBookingCode)

src/app/track/[id]/page.tsx (Customer Status)
  ├─── src/components/shared/index.tsx (StatusBadge, MenuCardSkeleton)
  └─── src/lib/utils.ts (cn, formatCurrency)

src/app/admin/layout.tsx (Admin Wrapper)
  └─── src/components/layout/AdminSidebar.tsx (AdminSidebar, AdminTopbar)

src/app/admin/page.tsx (Admin Dashboard)
  ├─── src/components/shared/index.tsx (StatusBadge, DashboardCardSkeleton)
  ├─── recharts (AreaChart, PieChart)
  └─── src/lib/utils.ts (cn, formatCurrency)

src/app/admin/billing/page.tsx (POS Terminal View)
  ├─── src/components/shared/index.tsx (StatusBadge)
  └─── src/lib/utils.ts (cn, formatCurrency, generateBillNumber)

src/app/admin/orders/page.tsx (Live KDS Queue)
  ├─── src/components/shared/index.tsx (StatusBadge, SearchInput, EmptyState)
  └─── src/lib/utils.ts (cn, formatCurrency, formatTime)

src/app/admin/reservations/page.tsx (Admin Booking Logs)
  ├─── src/components/shared/index.tsx (StatusBadge, SearchInput, EmptyState)
  └─── src/lib/utils.ts (cn, formatDate)

src/app/admin/tables/page.tsx (Admin Table Floor)
  └─── src/components/shared/index.tsx (StatusBadge)
