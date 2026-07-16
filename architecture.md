# System Architecture — AddaDotCom

This document outlines the architecture, data flow, and technology integration of the AddaDotCom Café & Restaurant Web Application.

---

## High-Level System Architecture

AddaDotCom is built as a monolith web application using **Next.js 14** (App Router). It coordinates client-side rendering (CSR), server-side configurations, static page deliveries, and relational SQLite schema access through a unified database client.

```
                  ┌──────────────────────────────────────────────┐
                  │            Client Layer (Browser)            │
                  │                                              │
                  │   ┌───────────────┐      ┌───────────────┐   │
                  │   │  Customer UI  │      │   Admin UI    │   │
                  │   └───────┬───────┘      └───────┬───────┘   │
                  │           │                      │           │
                  └───────────┼──────────────────────┼───────────┘
                              │                      │
                              │ HTTP                 │ HTTP
                              │ JSON                 │ JSON
                              ▼                      ▼
                  ┌──────────────────────────────────────────────┐
                  │        Server Layer (Next.js Runtime)        │
                  │                                              │
                  │   ┌───────────────┐      ┌───────────────┐   │
                  │   │   REST APIs   │◄─────┤   NextAuth    │   │
                  │   └───────┬───────┘      └───────────────┘   │
                  │           │                                  │
                  └───────────┼──────────────────────────────────┘
                              │
                              │ Prisma Queries
                              ▼
                  ┌──────────────────────────────────────────────┐
                  │              Persistence Layer               │
                  │                                              │
                  │              ┌───────────────┐               │
                  │              │  SQLite DB    │               │
                  │              └───────────────┘               │
                  └──────────────────────────────────────────────┘
```

---

## Component & Framework Relationships

```
Browser (UI Client)
   │
   ├─── Customer Router (CSR / Hydrated Components)
   │       ├─── Homepage (Public Showcase)
   │       ├─── Menu (Persistent Zustand Cart -> LocalStorage)
   │       ├─── Checkout / Order Form (Submits to /api/orders)
   │       ├─── Booking Scheduler (Submits to /api/reservations)
   │       └─── Live Status Timeline (Polls /api/orders/[id])
   │
   ├─── Admin Router (Simulated State Client Views)
   │       ├─── POS Billing Calculator (Thermal printer mock)
   │       ├─── KDS Kanban Grid (Advance orders PLACED -> COMPLETED)
   │       ├─── Floor Manager Grid (Visual table triggers)
   │       └─── Inventory logs & KPI charts
   │
   └─── Next.js Backend Services
           ├─── API Router (Controllers under /api/*)
           ├─── NextAuth Engine (Wrapper on /api/auth/[...nextauth])
           └─── Prisma Database Client (Connection pooled global client)
```

---

## Data Flow Pipeline

### 🛒 Food Ordering & POS Lifecycle
1. **Selection:** Customer adds menu items with variants/addons to cart (`useCartStore`). State is persisted to `localStorage` under `addadotcom-cart`.
2. **Submission:** Customer submits checkout form. Frontend posts cart object to `/api/orders`.
3. **Database Insertion:** Backend matches details, generates unique order number (`ORD-YYYYMMDD-XXXX`), and inserts into SQLite `orders` table. If Dine-in, table status is updated to `OCCUPIED` in `cafe_tables`.
4. **Kitchen Notification:** Kitchen staff views new order in live order queue. (Note: Admin view currently uses local mock lists; integration to database is planned).
5. **KDS Updates:** Order status transitions: `PLACED` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED` ➔ `COMPLETED`.
6. **Payment & Billing:** POS creates bill record in database `/api/billing`. Once mark `PAID`, table status is reset to `FREE` and order is marked `COMPLETED`.

### 📅 Table Reservation Lifecycle
1. **Form Input:** Guest selects date, party size, and timeslot in `/reserve`.
2. **Capacity Validation:** Form sends POST to `/api/reservations`.
3. **Table Assignment Algorithm:**
   - Filters `cafe_tables` with capacity >= guest count.
   - Queries `reservations` to find which tables are already booked for that date/time.
   - Assigns the *smallest matching table* that is currently unbooked.
4. **Confirmation:** If table is available, returns code (`BK-XXXXXX`) and marks status `CONFIRMED`. If no tables are available, returns `409 Conflict`.
