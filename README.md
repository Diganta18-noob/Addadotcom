<div align="center">

<img src="docs/assets/hero-banner.svg" alt="AddaDotCom — Restaurant Management System" width="100%" />

<br/>
<br/>

# ☕ AddaDotCom — The Open-Source Café Operating System

**Zero-touch table ordering · Real-time kitchen display (KDS) · GST-compliant invoicing**
*Built for modern Indian restaurants. Inspired by Toast POS, PetPooja, and Starbucks POS.*

<br/>

> ⭐ Star the repo if AddaDotCom helped you build or run your café.

[![Stars](https://img.shields.io/github/stars/yourusername/addadotcom?style=social)](https://github.com/yourusername/addadotcom)

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-addadotcom.vercel.app-4B2E2B?style=for-the-badge&logo=vercel&logoColor=white)](https://addadotcom.vercel.app)
[![License MIT](https://img.shields.io/badge/License-MIT-D4A056?style=for-the-badge)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

<br/>

[![12 Pages](https://img.shields.io/badge/12-Customer_&_Admin_Pages-4B2E2B?style=for-the-badge)](#-features)
[![15 API Routes](https://img.shields.io/badge/15-API_Route_Groups-D4A056?style=for-the-badge)](#-api-reference)
[![8 SSE Events](https://img.shields.io/badge/8-Real--Time_SSE_Events-336791?style=for-the-badge)](#-real-time-sse-events)
[![GST Compliant](https://img.shields.io/badge/GST-Compliant_Invoices-00B894?style=for-the-badge)](#-features)
[![0 Polling](https://img.shields.io/badge/0-Polling_Loops-E17055?style=for-the-badge)](#-real-time-sse-events)

</div>

<br/>

<div align="center">

[☕ What is it](#-what-is-addadotcom) • [💥 Why AddaDotCom?](#-why-addadotcom) • [✨ Features](#-features) • [🏗 Architecture](#-architecture) • [🚀 Quick Start](#-quick-start) • [🔌 API Reference](#-api-reference) • [📸 Screenshots](#-screenshots)

</div>

---

## ☕ What is AddaDotCom?

**AddaDotCom** is a modern, enterprise-ready café and restaurant management ecosystem designed to bridge the gap between traditional point-of-sale (POS) systems like Toast POS or PetPooja and modern web technologies. Engineered with **Next.js 14 App Router**, **TypeScript**, **PostgreSQL**, and **Server-Sent Events (SSE)**, it delivers sub-second order dispatching, live kitchen order synchronization, and frictionless contactless table QR ordering.

Unlike legacy restaurant software that relies on heavy desktop client installations and fragmented third-party integrations, AddaDotCom provides a unified, multi-tenant capable architecture in a single codebase. From high-throughput kitchen displays (KDS) with color-coded timers to GST-compliant PDF invoice generation and interactive revenue heatmaps, AddaDotCom scales effortlessly from local artisanal coffee shops to multi-zone enterprise dining establishments.

---

## 💥 Why AddaDotCom?

<img src="docs/assets/why-addadotcom.svg" alt="Why AddaDotCom — Pain vs Solution" width="100%" />

<br/>

| ❌ The daily pain | ✅ How AddaDotCom fixes it |
|-------------------|--------------------------|
| 📋 Paper KOTs get lost, misread, or delayed | **Real-time KDS** — orders appear on the kitchen screen in &lt;500ms |
| 🔄 Staff shout orders across the counter | **Zero-touch QR ordering** — customer orders direct to kitchen, no staff needed |
| 🧾 Manual bill calculation errors | **Auto-computed GST bills** — CGST/SGST split, service charge, discounts, rounding |
| 💰 No idea what's selling or when it's busy | **Analytics dashboard** — peak hours heatmap, daily/weekly/yearly revenue trends |
| 📱 Customers ask "where is my order?" constantly | **Live order tracker** — customer tracks status in real-time on their phone |
| 🖨️ Printing invoices from Excel templates | **PDF tax invoices** — QR-verified, downloadable, GST-compliant, auto-generated |
| 📦 "We ran out of milk again" | **Inventory alerts** — low-stock notifications before you run out |
| 👤 No record of who's a regular | **Loyalty points engine** — earn 10pts/₹100, tier progression, visible on every invoice |

---

## ✨ Features

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>👤 Customer</h3>
      <ul>
        <li>🍽 Browsable menu with category filters, veg/non-veg tags &amp; customizations</li>
        <li>📱 <b>Contactless QR table ordering</b> — scan → menu loads → table pre-selected</li>
        <li>🛒 Persistent cart with add-ons, variants &amp; special notes</li>
        <li>📍 <b>Live order tracker</b> — SSE real-time status stepper</li>
        <li>🧾 QR-verified digital tax invoice (PDF download)</li>
        <li>⭐ Post-meal ratings via invoice QR scan</li>
        <li>🏆 Loyalty points (10pts/₹100) with Bronze→Platinum tiers</li>
        <li>📅 Table reservation with party size &amp; booking code</li>
      </ul>
    </td>
    <td width="33%" valign="top">
      <h3>👨‍🍳 Kitchen</h3>
      <ul>
        <li>🖥 <b>KDS Station Mode</b> — fullscreen, no sidebar, tablet-optimised</li>
        <li>🎨 Color-coded timers: Green &lt;5m · Amber &lt;15m · Red &gt;15m</li>
        <li>📢 <b>Audio chime</b> on every incoming ticket</li>
        <li>🔄 Single-tap bump to advance status</li>
        <li>📊 Item aggregator — "Prepare: 6× Cold Coffee, 4× Risotto"</li>
        <li>⚡ SSE-powered stream &lt;500ms, zero polling</li>
      </ul>
    </td>
    <td width="33%" valign="top">
      <h3>🏢 Admin &amp; POS</h3>
      <ul>
        <li>📊 <b>Analytics</b> — revenue trends, peak hours heatmap, category sales</li>
        <li>💳 POS billing — table-linked, split payments, CGST/SGST auto-split</li>
        <li>🗺 Visual table floor — colour-coded real-time grid</li>
        <li>📦 Inventory with low-stock alerts &amp; adjustment logs</li>
        <li>🎫 Coupon engine — DB-driven, usage caps, expiry</li>
        <li>📋 Order history — search, filter, CSV export</li>
        <li>⚙️ Persistent settings — GSTIN, tax rates, service charge</li>
        <li>🔔 <b>Global admin toasts</b> on every admin page via SSE</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🏆 AddaDotCom vs Legacy POS Systems

| Feature | AddaDotCom | PetPooja / Toast | WhatsApp + Excel |
|---------|-----------|-----------------|-----------------|
| 🌐 Open source | **✅ MIT** | ❌ Proprietary | — |
| 💰 Cost | **Free to self-host** | ₹3,000–15,000/mo | "Free" (hidden cost) |
| 📱 QR table ordering | **✅ Built-in** | ✅ Add-on | ❌ |
| ⚡ Real-time KDS | **✅ SSE, &lt;500ms** | ✅ (polling) | ❌ |
| 🧾 GST-compliant PDF invoice | **✅ Auto-generated** | ✅ | Manual |
| 📊 Analytics &amp; heatmaps | **✅ Built-in** | ✅ Basic | ❌ |
| 🏆 Loyalty program | **✅ Built-in** | Add-on $$$ | ❌ |
| 📦 Inventory management | **✅ Built-in** | Add-on $$$ | Spreadsheet |
| 🔧 Customisable | **✅ Full source** | ❌ | — |
| 🚀 Deploy in 5 minutes | **✅ Vercel button** | ❌ Hours of setup | — |

---

## 🏗 Architecture & Workflow

<img src="docs/assets/architecture-workflow.svg" alt="System Architecture and Event Workflow" width="100%" />

<br/>

<details>
<summary><b>View ASCII Flow &amp; Detailed Mermaid Flowchart</b></summary>

<br/>

```
Customer Browser                    Kitchen / Admin                     Database
─────────────────                   ──────────────────                  ──────────────
Homepage                            /admin/kitchen (KDS)                PostgreSQL
Menu + Cart         POST /api/orders ──────────────────►  SSE Broadcast  ┌─ Users
Order Checkout ───────────────────► /api/sse (Event Bus) ◄────────────── ├─ Orders
/track/:id ◄── SSE order-updated ── │  ┌─ new-order                     ├─ Bills
/invoice/:n         POST /api/billing│  ├─ order-updated                 ├─ Menu
                ─────────────────── │  ├─ bill-paid                     ├─ Tables
                                    │  ├─ table-updated                  └─ Settings
                /admin/billing      │  ├─ reservation-created
                /admin/tables ◄─────┘  └─ review-approved
                /admin/analytics
```

<br/>

```mermaid
graph TB
    subgraph Customer["👤 Customer Experience (Browser)"]
        A[Homepage] --> B["Menu & Cart"]
        B --> C["Checkout / Order"]
        C --> D["/track/:id — Live Tracker"]
        D --> E["/invoice/:number — e-Receipt"]
    end

    subgraph Admin["🏢 Admin Portal (/admin)"]
        F[Dashboard] --> G["KDS /admin/kitchen"]
        F --> H["Billing / POS"]
        F --> I["Tables Floor Plan"]
        F --> J["Analytics & Reports"]
    end

    subgraph API["⚡ Next.js API Routes"]
        K["/api/orders"]
        L["/api/billing"]
        M["/api/sse — Event Bus Pub/Sub"]
        N["/api/reservations"]
        O["/api/menu"]
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

</details>

---

## ⚡ Real-Time SSE Engine

<img src="docs/assets/realtime-engine.svg" alt="Real-Time SSE Engine Architecture" width="100%" />

<br/>

<details>
<summary><b>View Real-Time SSE Event Catalogue (8 Channels)</b></summary>

<br/>

All real-time user experiences are powered by a single pub/sub broadcast endpoint at `/api/sse`.

| Event Name | Payload Structure | Trigger Source | Primary Consumers |
|------------|-------------------|----------------|-------------------|
| `new-order` | `{ orderId, orderNumber, type, tableId, itemCount }` | `POST /api/orders` | Kitchen KDS, Admin Orders Queue, Table Floor Plan |
| `order-updated` | `{ orderId, orderNumber, status, previousStatus }` | `PUT /api/orders/[id]` | Customer Order Tracker, Kitchen KDS |
| `bill-paid` | `{ orderId, billNumber, total, tableId }` | `POST /api/billing` | Order Tracker, Table Floor Plan, Admin Dashboard |
| `table-updated` | `{ tableId, tableNumber, status }` | Tables / Orders / Billing | Visual Table Floor Plan |
| `reservation-created` | `{ id, guestName, tableId, tableNumber }` | `POST /api/reservations` | Admin Table Floor Plan &amp; Reservations View |
| `reservation-updated` | `{ id, status, tableId }` | `PUT /api/reservations/[id]` | Tables &amp; Reservations Manager |
| `review-approved` | `{ id, approved }` | `PUT /api/reviews/[id]` | Customer Homepage Testimonials &amp; Menu Ratings |
| `inventory-updated` | `{ itemId, name, quantity }` | `PUT /api/inventory/[id]` | Admin Inventory Manager |

</details>

---

## 🚀 Quick Start

<img src="docs/assets/quick-start-workflow.svg" alt="Quick Start Workflow" width="100%" />

<br/>

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

## 🎬 AddaDotCom in Action

<div align="center">
<table>
  <tr>
    <td align="center" width="280">
      <a href="https://addadotcom.vercel.app">
        <img src="docs/screenshots/video-thumb-customer.png" alt="Customer Ordering Flow" width="260"/>
      </a><br/>
      <b>Customer QR Ordering Flow</b><br/>
      <sub>Scan → Browse → Order → Track</sub>
    </td>
    <td align="center" width="280">
      <a href="https://addadotcom.vercel.app/admin/kitchen">
        <img src="docs/screenshots/video-thumb-kds.png" alt="Kitchen Display System" width="260"/>
      </a><br/>
      <b>Kitchen Display System (KDS)</b><br/>
      <sub>Live tickets, timers, audio alerts</sub>
    </td>
    <td align="center" width="280">
      <a href="https://addadotcom.vercel.app/admin/billing">
        <img src="docs/screenshots/video-thumb-billing.png" alt="POS Billing" width="260"/>
      </a><br/>
      <b>POS Billing &amp; Invoice</b><br/>
      <sub>Bill generation, payment, PDF invoice</sub>
    </td>
  </tr>
</table>
</div>

---

<details>
<summary><b>🔌 Full API Reference — 15 Route Groups</b></summary>

<br/>

### Orders API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | List active orders (filterable by date, status, order type) |
| `POST` | `/api/orders` | Place new order &amp; trigger SSE broadcast (`new-order`) |
| `GET` | `/api/orders/[id]` | Fetch single order details with linked bill and table |
| `PUT` | `/api/orders/[id]` | Update order status &amp; trigger SSE broadcast (`order-updated`) |
| `GET` | `/api/orders/history` | Paginated order history with search and filtering |
| `GET` | `/api/orders/analytics` | Revenue KPIs, peak hours heatmap, and top sellers |
| `GET` | `/api/orders/monthly` | Month-by-month revenue breakdown for annual report |
| `GET` | `/api/orders/export` | Export orders dataset as downloadable CSV |

### Billing &amp; POS API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/billing` | Create tax bill, execute payment split, and release table |
| `GET` | `/api/orders/[id]/invoice` | Generate complete PDF/print invoice payload |
| `GET` | `/api/invoices/public` | Public e-receipt lookup by bill number or QR token |

### System &amp; Core API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` / `PUT` | `/api/settings` | Retrieve or update system configuration settings |
| `GET` / `POST` | `/api/menu` | List menu items with category filtering or create new item |
| `GET` / `POST` / `PUT` | `/api/tables/[id]` | Table CRUD management and live floor status updates |
| `GET` / `POST` | `/api/reservations` | Reserve tables and manage booking statuses |
| `POST` | `/api/promo` | Validate coupon code against DB rules &amp; recalculate subtotal |
| `GET` / `POST` | `/api/reviews` | Submit customer review or approve pending feedback |
| `GET` / `POST` | `/api/inventory` | Inventory management &amp; stock adjustment logging |
| `GET` | `/api/dashboard` | Aggregated executive KPIs for admin home dashboard |

</details>

<details>
<summary><b>📁 Complete Project Structure</b></summary>

<br/>

```
addadotcom/
├── prisma/
│   ├── schema.prisma          # Complete data model (12 models, 9 enums)
│   └── seed.ts                # Seeds 23 menu items, 12 tables, admin user, settings
├── public/
│   └── logo.png               # High-resolution brand logo icon
├── docs/
│   ├── assets/                # README SVG graphic banners and workflow diagrams
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
   │   │   ├── reservations/  # Table booking management
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

</details>

<details>
<summary><b>🗺 Roadmap — What's Built vs Planned</b></summary>

<br/>

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
- [ ] Payment gateway integration (Razorpay &amp; PhonePe).
- [ ] WhatsApp &amp; SMS automated order notifications (MSG91 / Twilio).
- [ ] Delivery driver assignment &amp; real-time dispatch tracking.

### 📋 Planned
- [ ] Multi-branch &amp; multi-outlet management.
- [ ] Mobile companion app built with React Native.
- [ ] AI-assisted menu item sales recommendations &amp; demand forecasting.

</details>

---

## 📸 Screenshots

<details>
<summary><b>View full screenshot gallery (9 screens)</b></summary>

<br/>

| Page | Screenshot | Page | Screenshot |
|------|-----------|------|-----------|
| Homepage | ![Homepage](docs/screenshots/01-homepage.png) | Menu & Cart | ![Menu](docs/screenshots/02-menu.png) |
| Order Tracker | ![Tracker](docs/screenshots/03-tracker.png) | Kitchen KDS | ![KDS](docs/screenshots/04-kds.png) |
| POS Billing | ![Billing](docs/screenshots/05-billing.png) | Analytics | ![Analytics](docs/screenshots/06-analytics.png) |
| Tax Invoice | ![Invoice](docs/screenshots/07-invoice.png) | Table Floor | ![Tables](docs/screenshots/08-tables.png) |
| QR Generator | ![QR](docs/screenshots/09-qr.png) | | |

</details>

---

## 📊 Star History

<div align="center">
<a href="https://star-history.com/#yourusername/addadotcom&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=yourusername/addadotcom&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=yourusername/addadotcom&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=yourusername/addadotcom&type=Date" />
  </picture>
</a>
</div>

---

## 🙏 Built With & Inspired By

AddaDotCom stands on the shoulders of these excellent open-source projects:

| Project | ⭐ | How it shapes AddaDotCom |
|---------|---|--------------------------|
| **[Next.js](https://github.com/vercel/next.js)** | 130k+ | App Router, SSR, API routes — the entire application framework |
| **[Prisma](https://github.com/prisma/prisma)** | 40k+ | Type-safe PostgreSQL ORM powering all DB queries |
| **[Framer Motion](https://github.com/framer/motion)** | 25k+ | Page transitions, modal animations, KDS ticket entrance |
| **[GSAP](https://github.com/greensock/GSAP)** | 20k+ | Hero headline character animation, scroll-reveal sequences |
| **[Lenis](https://github.com/darkroomengineering/lenis)** | 8k+ | Buttery smooth scroll across all customer-facing pages |
| **[Recharts](https://github.com/recharts/recharts)** | 24k+ | All 6 chart types in the analytics dashboard |
| **[shadcn/ui](https://github.com/shadcn-ui/ui)** | 80k+ | Base component patterns for the entire design system |
| **[Zustand](https://github.com/pmndrs/zustand)** | 50k+ | Cart persistence and UI state across the customer app |

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

---

<div align="center">

**[⬆ Back to top](#-addadotcom--the-open-source-caf-operating-system)**

Built with ☕ for modern Indian cafés and restaurants.

<sub>AddaDotCom v1.0 · Next.js 14 · PostgreSQL · MIT License · <a href="https://addadotcom.vercel.app">addadotcom.vercel.app</a></sub>

</div>
