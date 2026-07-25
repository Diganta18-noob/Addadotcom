<div align="center">

<img src="public/logo.png" alt="AddaDotCom Logo" width="100" height="100" />

# AddaDotCom

### Enterprise-Grade Café & Restaurant Management System

*A full-stack, production-ready POS and customer ordering platform — built with Next.js 14, PostgreSQL, and real-time SSE.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-addadotcom.vercel.app-4B2E2B?style=for-the-badge&logo=vercel)](https://addadotcom.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-D4A056?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?style=for-the-badge&logo=postgresql)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

</div>

---

## 📸 Preview

| Customer Experience | Kitchen Station (KDS) | Admin POS & Billing |
|:---:|:---:|:---:|
| ![Homepage](docs/screenshots/homepage.png) | ![KDS](docs/screenshots/kds.png) | ![Billing](docs/screenshots/billing.png) |

---

## ☕ What is AddaDotCom?

**AddaDotCom** is a modern, enterprise-ready café and restaurant management ecosystem designed to bridge the gap between traditional point-of-sale (POS) systems like Toast POS or PetPooja and modern web technologies. Engineered with **Next.js 14 App Router**, **TypeScript**, **PostgreSQL**, and **Server-Sent Events (SSE)**, it delivers sub-second order dispatching, live kitchen order synchronization, and frictionless contactless table QR ordering.

Unlike legacy restaurant software that relies on heavy desktop client installations and fragmented third-party integrations, AddaDotCom provides a unified, multi-tenant capable architecture in a single codebase. From high-throughput kitchen displays (KDS) with color-coded timers to GST-compliant PDF invoice generation and interactive revenue heatmaps, AddaDotCom scales effortlessly from local artisanal coffee shops to multi-zone enterprise dining establishments.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 App Router | SSR, API routes, file-based routing, edge optimization |
| **Language** | TypeScript 5 | End-to-end type safety & developer ergonomics |
| **Database** | PostgreSQL + Prisma ORM | Relational data integrity, complex transactional queries |
| **Auth** | NextAuth.js v4 | Session management, RBAC, secure cookie auth |
| **State** | Zustand v5 | Cart persistence, UI state, client-side caching |
| **Styling** | TailwindCSS v3 | Utility-first styling, custom design tokens, dark mode |
| **Animation** | Framer Motion v12 + GSAP v3 + Lenis | Smooth page transitions, physics-based UI, inertia scroll |
| **Charts** | Recharts v2 | Revenue trends, peak hours heatmap, analytics dashboard |
| **Real-time** | Server-Sent Events (SSE) | Live KDS kitchen stream, table updates, order tracking |
| **PDF** | @react-pdf/renderer v4 | Client & server-side downloadable tax invoices |
| **QR Codes** | qrcode.react v4 | Table QR ordering, invoice authentication links |
| **Validation** | Zod v4 | API schema validation & runtime type guards |
| **Notifications** | react-hot-toast | SSE-triggered admin alerts & audio chime triggers |
| **Query** | TanStack Query v5 | Server state hydration & optimistic UI updates |
| **Deployment** | Vercel + Neon PostgreSQL | Serverless runtime, edge CDN, zero-cold-start DB |

---

## ✨ Features

### 👤 Customer Experience
- 🍽 **Browsable Menu** — Category filters, veg/non-veg tags, live search, and customization options.
- 🛒 **Persistent Cart** — Add-ons, size variants, special cooking instructions, and quantity adjustment.
- 📱 **QR Table Ordering** — Instant scan table QR code → menu auto-loads with pre-bound Table ID.
- 🎯 **3 Order Types** — Dine-in (with table assignment), Takeaway, and Delivery mode.
- 🎟 **Promo Codes** — DB-driven discount coupons with usage limits and expiration checks.
- 📍 **Live Order Tracker** — Real-time SSE status stepper: *Placed → Accepted → Preparing → Ready → Served*.
- 🧾 **Digital Invoice** — QR-verified e-receipt, downloadable tax PDF, and CGST/SGST tax breakdown.
- ⭐ **Reviews & Ratings** — Post-meal feedback submitted directly via invoice QR scan.
- 🏆 **Loyalty Points** — Earn 10 points per ₹100 spent with tier progression (Bronze → Platinum).
- 📅 **Table Reservations** — Date, time slot, and party size picker with unique booking code generation.

### 👨‍🍳 Kitchen Operations
- 🖥 **KDS Station Mode** — Fullscreen, no-sidebar kitchen display optimized for cook lines.
- 🎨 **Color-Coded Timers** — Green (<5m) · Amber (<15m) · Red (>15m) urgency indicators.
- 📢 **Audio Chime Alerts** — Instant web audio notifications triggered upon every incoming order.
- 🔄 **Single-Tap Bump** — Advance ticket status (Preparing → Ready) with zero confirmation overhead.
- 📊 **Item Aggregator** — Consolidated view summarizing total items to cook across all active tickets.
- ⚡ **Real-Time Stream** — SSE-powered broadcast with under 500ms latency without polling.

### 🏢 Admin & POS Control
- 📊 **Analytics Dashboard** — Revenue trends (today/week/month/year), peak hours heatmap, category sales.
- 💳 **POS Billing** — Table-linked order bill generation, split payments (Cash/UPI/Card), CGST/SGST breakdown.
- 🗺 **Visual Table Floor** — Color-coded interactive grid (Free, Occupied, Reserved, Bill Requested).
- 📦 **Inventory Management** — Stock level tracking, low-stock threshold alerts, and stock adjustment logs.
- 🎫 **Coupon Engine** — Create, edit, and disable promo codes with custom percentage or fixed rules.
- 👥 **Staff Management** — Role assignment, cashier tracking, and audit logging.
- 📋 **Order History** — Comprehensive audit trail with multi-filter search and date range selection.
- 📈 **Reports & Export** — One-click CSV export for accounting and tax compliance.
- ⚙️ **Persistent Settings** — Cafe info, GSTIN, service charge rates, and reservation rules.
- 🔔 **Global Admin Toasts** — Persistent background notifications across all admin sub-pages.

---

## 🏗 Architecture

```mermaid
graph TB
    subgraph Customer["👤 Customer Experience (Browser)"]
        A[Homepage] --> B[Menu & Cart]
        B --> C[Checkout / Order]
        C --> D[/track/:id — Live Tracker]
        D --> E[/invoice/:number — e-Receipt]
    end

    subgraph Admin["🏢 Admin Portal (/admin)"]
        F[Dashboard] --> G[KDS /admin/kitchen]
        F --> H[Billing / POS]
        F --> I[Tables Floor Plan]
        F --> J[Analytics & Reports]
    end

    subgraph API["⚡ Next.js API Routes"]
        K[/api/orders]
        L[/api/billing]
        M[/api/sse — Event Bus Pub/Sub]
        N[/api/reservations]
        O[/api/menu]
    end

    subgraph DB["🗄 PostgreSQL — Prisma ORM"]
        P[(Users & Accounts)]
        Q[(Orders & Bills)]
        R[(Menu & Inventory)]
        S[(Tables & Reservations)]
    end

    C -->|POST Order| K
    K -->|Broadcast Event| M
    M -->|SSE Stream| D
    M -->|SSE Stream| G
    M -->|SSE Stream| I
    H -->|Settle Payment| L
    L -->|Broadcast Event| M
    K & L & N --> DB
    O --> DB
```

---

## 🗄 Database Models

| Model | Key Fields | Relations / Description |
|-------|-----------|-------------------------|
| `User` | `id`, `name`, `email`, `role`, `loyaltyPoints` | Orders, Reservations, Cashier Bills, OAuth Accounts |
| `Category` | `id`, `name`, `slug`, `sortOrder` | Parent category grouping for MenuItems |
| `MenuItem` | `id`, `categoryId`, `price`, `tags`, `variants`, `addons` | Belongs to Category; stores JSON options & inventory recipe |
| `CafeTable` | `id`, `number`, `capacity`, `zone`, `status` | Linked to Orders and Reservations; tracks floor status |
| `Reservation` | `id`, `bookingCode`, `date`, `timeSlot`, `status` | Linked to User and CafeTable; tracks table bookings |
| `Order` | `id`, `orderNumber`, `type`, `status`, `items` (JSON) | Primary order entity linked to User, CafeTable, and Bill |
| `Bill` | `id`, `billNumber`, `total`, `taxes`, `payments`, `status` | GST Tax bill linked 1:1 to Order and Cashier User |
| `InventoryItem` | `id`, `name`, `unit`, `quantity`, `lowStockThreshold` | Tracks raw ingredients & stock alert levels |
| `StockLog` | `id`, `inventoryItemId`, `change`, `reason` | Audit history for stock additions/deductions |
| `PromoCode` | `id`, `code`, `type`, `value`, `usageCount`, `isActive` | Promotional coupon codes with DB constraints |
| `Review` | `id`, `author`, `rating`, `comment`, `approved` | Customer reviews requiring admin approval |
| `Setting` | `key`, `value`, `group` | Key-value system config (GSTIN, service tax, cafe info) |

---

## 🔌 API Reference

### Orders API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | List active orders (filterable by date, status, order type) |
| `POST` | `/api/orders` | Place new order & trigger SSE broadcast (`new-order`) |
| `GET` | `/api/orders/[id]` | Fetch single order details with linked bill and table |
| `PUT` | `/api/orders/[id]` | Update order status & trigger SSE broadcast (`order-updated`) |
| `GET` | `/api/orders/history` | Paginated order history with search and filtering |
| `GET` | `/api/orders/analytics` | Revenue KPIs, peak hours heatmap, and top sellers |
| `GET` | `/api/orders/monthly` | Month-by-month revenue breakdown for annual report |
| `GET` | `/api/orders/export` | Export orders dataset as downloadable CSV |

### Billing & POS API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/billing` | Create tax bill, execute payment split, and release table |
| `GET` | `/api/orders/[id]/invoice` | Generate complete PDF/print invoice payload |
| `GET` | `/api/invoices/public` | Public e-receipt lookup by bill number or QR token |

### Real-Time SSE Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sse` | Open persistent Server-Sent Events stream for live updates |

### System & Core API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` / `PUT` | `/api/settings` | Retrieve or update system configuration settings |
| `GET` / `POST` | `/api/menu` | List menu items with category filtering or create new item |
| `GET` / `POST` / `PUT` | `/api/tables/[id]` | Table CRUD management and live floor status updates |
| `GET` / `POST` | `/api/reservations` | Reserve tables and manage booking statuses |
| `POST` | `/api/promo` | Validate coupon code against DB rules & recalculate subtotal |
| `GET` / `POST` | `/api/reviews` | Submit customer review or approve pending feedback |
| `GET` / `POST` | `/api/inventory` | Inventory management & stock adjustment logging |
| `GET` | `/api/dashboard` | Aggregated executive KPIs for admin home dashboard |

---

## ⚡ Real-Time SSE Events

All real-time user experiences are powered by a single pub/sub broadcast endpoint at `/api/sse`.

| Event Name | Payload Structure | Trigger Source | Primary Consumers |
|------------|-------------------|----------------|-------------------|
| `new-order` | `{ orderId, orderNumber, type, tableId, itemCount }` | `POST /api/orders` | Kitchen KDS, Admin Orders Queue, Table Floor Plan |
| `order-updated` | `{ orderId, orderNumber, status, previousStatus }` | `PUT /api/orders/[id]` | Customer Order Tracker, Kitchen KDS |
| `bill-paid` | `{ orderId, billNumber, total, tableId }` | `POST /api/billing` | Order Tracker, Table Floor Plan, Admin Dashboard |
| `table-updated` | `{ tableId, tableNumber, status }` | Tables / Orders / Billing | Visual Table Floor Plan |
| `reservation-created` | `{ id, guestName, tableId, tableNumber }` | `POST /api/reservations` | Admin Table Floor Plan & Reservations View |
| `reservation-updated` | `{ id, status, tableId }` | `PUT /api/reservations/[id]` | Tables & Reservations Manager |
| `review-approved` | `{ id, approved }` | `PUT /api/reviews/[id]` | Customer Homepage Testimonials & Menu Ratings |
| `inventory-updated` | `{ itemId, name, quantity }` | `PUT /api/inventory/[id]` | Admin Inventory Manager |

---

## 🚀 Quick Start

Follow these 5 steps to launch AddaDotCom locally on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/addadotcom.git
cd addadotcom

# 2. Install project dependencies
npm install

# 3. Configure environment file
cp .env.example .env.local

# 4. Sync Prisma schema & seed demo dataset
npx prisma db push && npm run db:seed

# 5. Launch development server
npm run dev
```

Open your browser:
- 🌐 **Customer Website:** [http://localhost:3000](http://localhost:3000)
- 🏢 **Admin / POS Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# ─── Database Connection ──────────────────────────────────────
# PostgreSQL URL (Neon, Supabase, Docker, or Local PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/addadotcom?schema=public"

# ─── Authentication Configuration ──────────────────────────────
# Generate secret key using: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-nextauth-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# ─── Application Public Configuration ──────────────────────────
# Used for QR code generation, e-receipt links & canonical URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/addadotcom)

1. **Fork this repository** to your GitHub account.
2. **Provision a PostgreSQL database** on [Neon](https://neon.tech) (Free tier) or [Supabase](https://supabase.com).
3. **Import to Vercel** and configure the required environment variables:
   - `DATABASE_URL` — PostgreSQL connection string.
   - `NEXTAUTH_SECRET` — Production secret key (`openssl rand -base64 32`).
   - `NEXTAUTH_URL` — Production domain (e.g., `https://addadotcom.vercel.app`).
   - `NEXT_PUBLIC_APP_URL` — Matches `NEXTAUTH_URL`.
4. **Build & Deploy** — Vercel executes `npm run postinstall` (`prisma generate`) automatically during deployment.
5. **Seed Production Data** — Run seeding once via Vercel CLI or local connection:
   ```bash
   npx vercel env pull .env.local
   npm run db:seed
   ```

---

## 🔑 Default Credentials

Use these pre-configured seed accounts to explore the system:

| Role | Email Address | Default Password | Permissions |
|------|---------------|------------------|-------------|
| **Admin** | `admin@addadotcom.cafe` | `admin123` | Full access (POS, Kitchen, Analytics, Inventory, Settings) |
| **Staff** | `staff@addadotcom.cafe` | `staff123` | Operational access (KDS Kitchen, Billing, Table Status) |

---

## 📁 Project Structure

```
addadotcom/
├── prisma/
│   ├── schema.prisma          # Complete data model (12 models, 9 enums)
│   └── seed.ts                # Seeds 23 menu items, 12 tables, admin user, settings
├── public/
│   └── logo.png               # High-resolution brand logo icon
├── docs/
│   └── screenshots/           # Documentation visual tour images
├── src/
│   ├── app/
│   │   ├── (public)/          # Customer-facing website pages
│   │   │   ├── page.tsx       # Homepage with hero, menu features, reviews
│   │   │   ├── menu/          # Menu with category filter, search, cart drawer
│   │   │   ├── order/         # Order checkout flow (dine-in / takeaway / delivery)
│   │   │   ├── track/[id]/    # Live SSE order tracking page
│   │   │   ├── reserve/       # Table reservation wizard
│   │   │   ├── invoice/[n]/   # Public QR-verifiable digital tax receipt
│   │   │   └── account/       # Customer dashboard (order history & loyalty)
│   │   ├── admin/             # Admin control portal (role-guarded)
│   │   │   ├── page.tsx       # Dashboard with financial KPIs & revenue charts
│   │   │   ├── kitchen/       # KDS station mode (fullscreen, audio alert)
│   │   │   ├── billing/       # POS billing with table settlement & split pay
│   │   │   ├── tables/        # Interactive table floor plan + QR generator
│   │   │   ├── orders/        # Order queue & audit trail
│   │   │   ├── analytics/     # Detailed revenue charts & heatmap analytics
│   │   │   ├── reservations/  # Table booking management
│   │   │   ├── inventory/     # Ingredient stock management & alerts
│   │   │   └── settings/      # System configuration (GST, service charge)
│   │   └── api/               # REST API route handlers (15 route groups)
│   ├── components/
│   │   ├── invoice/           # InvoiceDocument, InvoicePDF, InvoiceModal
│   │   ├── animations/        # PageTransition, HeroTitle, TiltCard
│   │   ├── cart/              # CartDrawer state & clear confirmation
│   │   ├── layout/            # Navbar, Footer, AdminSidebar, AdminNotifier
│   │   └── providers/         # SmoothScrollProvider (Lenis), SessionProvider
│   ├── lib/
│   │   ├── sse-emitter.ts     # Pub/Sub SSE event broadcast engine
│   │   ├── useSSE.ts          # React hook for real-time SSE subscriptions
│   │   ├── auth.ts            # NextAuth authentication & RBAC config
│   │   └── api-helpers.ts     # Typed API wrappers & error handler
│   └── store/
│       └── index.ts           # Zustand state: cart, UI theme, drawer state
├── Dockerfile                 # Multi-stage container production build
└── docker-compose.yml         # Local Docker setup (Next.js + Postgres + Redis)
```

---

## 🗺 Roadmap

### ✅ Completed Features
- [x] Customer ordering flow (Browse → Cart → Custom Addons → Checkout → Live Track).
- [x] Real-time KDS kitchen display with audio alerts and color-coded timers.
- [x] GST-compliant tax invoice PDF generator with QR verification link.
- [x] Analytics dashboard featuring revenue trends, peak hours heatmap, and monthly breakdowns.
- [x] Contactless table QR code generator with printable layout.
- [x] Customer loyalty points engine (10 points / ₹100 spend).
- [x] Admin promo code engine with usage cap and expiration validation.
- [x] Live interactive table floor plan with real-time status sync.
- [x] System settings management (GSTIN, tax rates, service charge, cafe metadata).
- [x] Customer feedback system with admin moderation and menu rating display.

### 🔄 In Progress
- [ ] Payment gateway integration (Razorpay & PhonePe).
- [ ] WhatsApp & SMS automated order notifications (MSG91 / Twilio).
- [ ] Delivery driver assignment & real-time dispatch tracking.

### 📋 Planned
- [ ] Multi-branch & multi-outlet management.
- [ ] Mobile companion app built with React Native.
- [ ] AI-assisted menu item sales recommendations & demand forecasting.

---

## 📸 Screenshots Gallery

| Customer Homepage | Menu & Cart | Order Tracker |
|:-:|:-:|:-:|
| ![Homepage](docs/screenshots/homepage.png) | ![Menu](docs/screenshots/menu.png) | ![Tracker](docs/screenshots/tracker.png) |

| Kitchen KDS | Admin POS & Billing | Analytics Dashboard |
|:-:|:-:|:-:|
| ![KDS](docs/screenshots/kds.png) | ![Billing](docs/screenshots/billing.png) | ![Analytics](docs/screenshots/analytics.png) |

| Digital Tax Invoice | Table Floor Plan | Contactless QR Order |
|:-:|:-:|:-:|
| ![Invoice](docs/screenshots/invoice.png) | ![Tables](docs/screenshots/tables.png) | ![QR](docs/screenshots/qr.png) |

---

## 🤝 Contributing

Contributions are warmly welcomed! To contribute:

1. **Fork** the repository.
2. **Create** your feature branch: `git checkout -b feature/AmazingFeature`
3. **Commit** your changes: `git commit -m 'Add some AmazingFeature'`
4. **Push** to the branch: `git push origin feature/AmazingFeature`
5. **Open** a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">

Built with ❤️ for Modern Hospitality & Enterprise Cafés.

</div>
