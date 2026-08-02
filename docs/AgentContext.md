# AgentContext.md — AddaDotCom Project Brain

> Read this file completely before touching any code.
> This is the authoritative guide for all AI agents working on this project.

## 🏢 What This Project Is

AddaDotCom is a production-grade Café & Restaurant Management System built
with Next.js 14 App Router, PostgreSQL (Prisma ORM), and real-time SSE.

It is NOT a hobby project. It is an enterprise application with:
- 15 admin pages
- 25+ API route groups  
- 17 Prisma models
- A custom automation engine
- A premium invoice system with PDF export
- A real-time KDS (Kitchen Display System)

Live URL: https://addadotcom.vercel.app
Admin: admin@addadotcom.cafe / [ask owner for password]

---

## ⚠️ What Must NEVER Be Changed

1. The Prisma schema models — never rename fields. They are used across 25+ API routes.
2. The SSE emitter architecture (`src/lib/sse-emitter.ts`) — 8 pages depend on it.
3. The `authOptions` in `src/lib/auth.ts` — changing breaks all protected routes.
4. The `apiHandler` wrapper in `src/lib/api-helpers.ts` — all 25+ API routes use it.
5. The Tailwind design tokens (espresso, caramel, cream, sage) — used in 100+ components.
6. The `InvoiceDocument` component structure — GST compliance depends on it.
7. The `generateBillNumber()` and `generateOrderNumber()` utils — these must stay unique.

---

## ✅ What Is Fully Completed

- Customer homepage with hero, featured items, testimonials, newsletter
- Menu page with category filter, search, veg/non-veg tags, cart
- Order page (3-step checkout: Cart → Details → Payment for Takeaway)
  - Dine-In skips payment step (pay after meal — real restaurant behaviour)
- Live order tracker at `/track/[id]` with SSE real-time updates
- Table QR ordering (scan → pre-fill table → order directly)
- Table reservation at `/reserve`
- Customer account at `/account` (orders, loyalty, reservations, profile)
- Public invoice at `/invoice/[number]` (GST-compliant, QR-verified)
- Admin dashboard with KPI cards and revenue charts
- Kitchen Display System at `/admin/kitchen` (fullscreen, no sidebar)
- POS Billing at `/admin/billing` (table-linked, CGST/SGST auto-split)
- Visual table floor plan at `/admin/tables` with QR generator
- Order History at `/admin/history` with search/filter/export
- Analytics dashboard at `/admin/analytics` (6 chart types, peak hours heatmap)
- Inventory management with low-stock alerts
- Coupon engine (DB-driven via PromoCode model)
- Reviews with admin approval flow
- Customer reviews → visible on homepage after approval
- Staff management via User model with role enum
- Persistent settings (cafe name, GSTIN, FSSAI, tax rates)
- Automation engine (`AutomationWorkflow` + `AutomationLog` models)
- Automation dashboard at `/admin/automation`
- Premium invoice: PDF (react-pdf), print (@media print), public QR page
- Smooth scroll (Lenis), GSAP animations, Framer Motion page transitions
- Dark/light mode with zero flash on load
- Responsive layout (320px → 1440px)

---

## 🔄 What Is In Progress / Partially Done

- Automation engine: models exist and seeder written, but `AutomationEngine.fire()`
  calls not yet wired into all API routes
- Razorpay integration: planned but not implemented (no SDK installed yet)
- Reviews `PUT /api/reviews/[id]` approval route: created but needs admin UI wiring
- Settings: `GET/PUT /api/settings` works but the Settings admin page saves locally
  only — not calling the API on submit
- `GET /api/invoices/public` route: exists but returns 404 for bills with
  non-standard number formats due to case sensitivity in Prisma query

---

## ❌ Explicitly Removed Features (Do NOT implement)

- Delivery / rider tracking — removed by design decision
- Catering / events booking — removed by design decision  
- WhatsApp notifications — removed (no Twilio/MSG91 setup)
- Email notifications — removed (no Resend/SMTP setup)
- Razorpay live payments — planned but not in current scope

---

## 🏗 Architecture in One Sentence

Next.js 14 App Router monorepo → API routes mutate PostgreSQL via Prisma →
broadcast SSE events → all dashboards update in real-time without polling.

---

## 🎨 Design Philosophy

- Brand: Espresso brown (#4B2E2B) + Caramel gold (#D4A056) + Cream (#FFF8F0)
- Font: Serif for headings (DM Serif), Sans for body (DM Sans or system-ui)
- Rounded corners: `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for modals
- Every interactive element must have hover + active states
- Use `framer-motion` for ALL UI animations — never CSS keyframe on interactive elements
- Use GSAP only for scroll-driven and entrance animations
- Lenis handles ALL smooth scroll — never `scroll-behavior: smooth` on elements

---

## 📐 Coding Rules (Non-Negotiable)

1. All API routes MUST use `apiHandler()` from `@/lib/api-helpers` — no raw try/catch
2. All DB queries MUST use `prisma` from `@/lib/prisma` — no new PrismaClient()
3. All form validation MUST use Zod schemas from `@/lib/validations`
4. Never `await` `AutomationEngine.fire()` — it's fire-and-forget
5. Never use `Promise.all` for sequential operations that depend on each other
6. Every `POST/PUT/DELETE` that changes an order, table, or bill MUST broadcast SSE
7. Admin pages MUST use `getServerSession(authOptions)` for auth check
8. Never commit `.env.local` — it contains database credentials
9. Use `cn()` from `@/lib/utils` for conditional Tailwind classes — never string interpolation
10. Images MUST use `next/image` — never `<img>` tags in production code

---

## 🔌 Environment Variables Required

```env
DATABASE_URL=                  # Neon/Supabase PostgreSQL connection string
NEXTAUTH_SECRET=               # Random 32-byte hex string
NEXTAUTH_URL=                  # https://addadotcom.vercel.app
NEXT_PUBLIC_APP_URL=           # Same as NEXTAUTH_URL
GOOGLE_CLIENT_ID=              # Optional: Google OAuth
GOOGLE_CLIENT_SECRET=          # Optional: Google OAuth
N8N_WEBHOOK_URL=               # Optional: n8n automation server
N8N_WEBHOOK_SECRET=            # Optional: shared secret for n8n
```

---

## 🚀 Common Tasks Reference

### Run locally
```bash
cd addadotcom
npm install
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET
npx prisma db push
npm run db:seed
npm run dev
```

### Access admin panel
Navigate to `/admin` → redirects to `/login` → use admin@addadotcom.cafe

### Add a new API route
1. Create `src/app/api/[resource]/route.ts`
2. Import `apiHandler, ApiError` from `@/lib/api-helpers`
3. Import `prisma` from `@/lib/prisma`
4. Wrap all handlers in `apiHandler(async (request) => { ... })`
5. At the end of any mutating operation, call `broadcast()` from `@/lib/sse-emitter`
6. Add `AutomationEngine.fire()` for events that should trigger workflows

### Add a new admin page
1. Create `src/app/admin/[page]/page.tsx`
2. Add `getServerSession(authOptions)` at the top for auth
3. Add the route to `AdminSidebar.tsx` sidebarLinks array
4. Use the existing grid layout from other admin pages as a template

---

## 📁 Directory Quick Reference

```
src/
├── app/
│   ├── (public pages)  page.tsx, menu/, order/, reserve/, track/, account/, invoice/
│   ├── admin/          dashboard, kitchen, billing, tables, orders, analytics...
│   ├── api/            All 25+ API route groups
│   └── login/          Dedicated login page
├── components/
│   ├── invoice/        8 invoice sub-components (InvoiceDocument, InvoicePDF, etc.)
│   ├── animations/     GSAP + Framer Motion components
│   ├── layout/         Navbar, Footer, AdminSidebar, AdminNotifier
│   ├── cart/           CartDrawer
│   └── shared/         StatusBadge, LoadingButton, etc.
├── lib/
│   ├── automation/     AutomationEngine, conditions, actions, logger, queue
│   ├── api-helpers.ts  All API routes use this wrapper
│   ├── sse-emitter.ts  Real-time broadcast engine
│   ├── auth.ts         NextAuth config with role-based JWT
│   └── validations.ts  All Zod schemas
├── store/
│   └── index.ts        Zustand: cart + UI state
└── prisma/
    ├── schema.prisma   17 models, 6 enums
    └── seed.ts         Menu, tables, admin user seed data
```

---

## 🐛 Known Bugs (as of latest session)

1. **Billing empty state**: Order-to-table matching fails when `order.tableId` is null
   — use the manual order search fallback
2. **Invoice QR**: Points to `addadotcom.vercel.app` hardcoded — fix is in
   `InvoiceDocument.tsx` where `origin` state sets the base URL dynamically
3. **Login refresh**: Fixed — `/login/page.tsx` exists and calls `router.replace(callbackUrl)`
4. **Monthly analytics**: Fixed — uses `DATE_TRUNC('month', ...)` SQL

---

## 🔮 Next Immediate Tasks

1. Wire `AutomationEngine.fire()` into all mutating API routes
2. Fix the Settings admin page to call `PUT /api/settings` on save
3. Add the Razorpay payment gateway integration
4. Seed automation workflows via `npm run db:seed-automations`
