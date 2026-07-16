# Routing Map — AddaDotCom

This document registers all frontend routing paths and backend API controller endpoints for the café and restaurant application.

---

## 🌐 Public / Customer Frontend Routes

All public routes are defined within `src/app/` and do not enforce server-side auth locks or middlewares.

| Route | File Path | Purpose / Description | Auth Required |
|---|---|---|---|
| `/` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/page.tsx) | Homepage, restaurant about, reviews, featured dishes. | No |
| `/menu` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/menu/page.tsx) | Category tabs, dish items search, variant detail dialog. | No |
| `/reserve` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/reserve/page.tsx) | Table reservation multi-step booking page. | No |
| `/order` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/order/page.tsx) | Checkout form and persistent cart items preview. | No |
| `/track/[id]` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/track/%5Bid%5D/page.tsx) | Live order tracking page (polls order state every 10s). | No |
| `/account` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/account/page.tsx) | Customer sign-in page and order/booking history view. | No |

---

## 🔒 Admin Frontend Routes

Admin routes are grouped under `/admin` and currently run on client-side mock/simulated states.

| Route | File Path | Purpose / Description | Auth Required |
|---|---|---|---|
| `/admin` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/admin/page.tsx) | KPI summary boxes, revenue charts, live orders timeline. | No (mocked/bypassed) |
| `/admin/menu` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/admin/menu/page.tsx) | Menu manager (item lists, add, edit, availability toggles). | No (mocked/bypassed) |
| `/admin/tables` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/admin/tables/page.tsx) | Floor layout manager showing table capacities and statuses. | No (mocked/bypassed) |
| `/admin/orders` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/admin/orders/page.tsx) | Kitchen Display System (KDS) and queue board. | No (mocked/bypassed) |
| `/admin/billing` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/admin/billing/page.tsx) | POS billing POS terminal (split checker, cashier printouts). | No (mocked/bypassed) |
| `/admin/reservations` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/admin/reservations/page.tsx) | Table reservation log list (accept/decline, seat party). | No (mocked/bypassed) |
| `/admin/inventory` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/admin/inventory/page.tsx) | Stock manager list, adjustments, and updates logs. | No (mocked/bypassed) |
| `/admin/reports` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/admin/reports/page.tsx) | Sales figures graphs and daily trend statistics. | No (mocked/bypassed) |
| `/admin/settings` | [page.tsx](file:///c:/Antigravity/Cafe/addadotcom/src/app/admin/settings/page.tsx) | Toggles for VAT/GST percentages, booking buffer timings. | No (mocked/bypassed) |

---

## ⚡ Backend REST API Routes

API routes are standard Next.js App Router route handlers.

| Method | Path | File Path | Purpose |
|---|---|---|---|
| `GET` | `/api/auth/[...nextauth]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/auth/%5B...nextauth%5D/route.ts) | Session login authentication endpoints. |
| `POST` | `/api/auth/[...nextauth]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/auth/%5B...nextauth%5D/route.ts) | Session token refresh and password validation. |
| `GET` | `/api/billing` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/billing/route.ts) | Fetch bills by status/date range. |
| `POST` | `/api/billing` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/billing/route.ts) | Create bill, completes order, frees associate table. |
| `GET` | `/api/billing/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/billing/%5Bid%5D/route.ts) | Fetch individual bill details by ID or invoice number. |
| `PUT` | `/api/billing/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/billing/%5Bid%5D/route.ts) | Update bill state (mark paid, record payments/discounts). |
| `GET` | `/api/dashboard` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/dashboard/route.ts) | Aggregate sales indicators and recent bookings count. |
| `GET` | `/api/inventory` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/inventory/route.ts) | Retrieve all ingredient item thresholds. |
| `POST` | `/api/inventory` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/inventory/route.ts) | Register a new ingredient record. |
| `PUT` | `/api/inventory/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/inventory/%5Bid%5D/route.ts) | Adjust item quantity and logs a StockLog record. |
| `GET` | `/api/menu` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/menu/route.ts) | Query categories and dishes with search/tag filters. |
| `POST` | `/api/menu` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/menu/route.ts) | Create a new dish item. |
| `GET` | `/api/menu/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/menu/%5Bid%5D/route.ts) | Retrieve a specific dish item profile. |
| `PUT` | `/api/menu/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/menu/%5Bid%5D/route.ts) | Edit a dish item (name, description, variants, price). |
| `DELETE` | `/api/menu/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/menu/%5Bid%5D/route.ts) | Remove a dish item. |
| `GET` | `/api/orders` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/orders/route.ts) | Fetch order list by date range/status/type. |
| `POST` | `/api/orders` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/orders/route.ts) | Submit customer cart, updates table status to OCCUPIED. |
| `GET` | `/api/orders/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/orders/%5Bid%5D/route.ts) | Retrieve customer order profile by ID or ORD-number. |
| `PUT` | `/api/orders/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/orders/%5Bid%5D/route.ts) | Update order status; updates table status when COMPLETED. |
| `POST` | `/api/promo` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/promo/route.ts) | Validate promo code expiration, active state, min orders. |
| `GET` | `/api/reports` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/reports/route.ts) | Retrieve daily sales totals for chart visualizations. |
| `GET` | `/api/reservations` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/reservations/route.ts) | Query bookings by date/status. |
| `POST` | `/api/reservations` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/reservations/route.ts) | Request booking and matches table availability. |
| `GET` | `/api/reservations/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/reservations/%5Bid%5D/route.ts) | Retrieve booking details by ID or code (`BK-XXXXXX`). |
| `PUT` | `/api/reservations/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/reservations/%5Bid%5D/route.ts) | Seat party (marks table OCCUPIED), update, or cancel. |
| `GET` | `/api/settings` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/settings/route.ts) | Fetch key-value configuration values. |
| `PUT` | `/api/settings` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/settings/route.ts) | Upsert bulk settings list. |
| `GET` | `/api/sse` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/sse/route.ts) | Establish SSE client stream with welcome & heartbeats. |
| `GET` | `/api/tables` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/tables/route.ts) | Fetch layout table list. |
| `POST` | `/api/tables` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/tables/route.ts) | Register a new table layout. |
| `PUT` | `/api/tables/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/tables/%5Bid%5D/route.ts) | Edit table zone/capacity/status manually. |
| `DELETE` | `/api/tables/[id]` | [route.ts](file:///c:/Antigravity/Cafe/addadotcom/src/app/api/tables/%5Bid%5D/route.ts) | Remove table layout. |
