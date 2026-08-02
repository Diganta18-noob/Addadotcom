# Phases.md — Project Implementation Phases

## Phase Overview

The project is structured into 13 implementation phases.

---

## ✅ Phase 1: Foundation & Core Infrastructure
- PostgreSQL setup with Prisma ORM (17 models, 6 enums).
- NextAuth.js authentication with Credentials and Google OAuth providers.
- Core layout, global CSS design tokens, and root provider integration.
- Database seed script with 20+ menu items, categories, and initial tables.

## ✅ Phase 2: Customer Web Application
- Landing page with hero banner, category showcase, testimonials, and newsletter.
- Interactive menu with real-time category filtering, search, and dietary tags.
- 3-step customer checkout workflow for Dine-In, Takeaway, and Online orders.
- Table reservation system with seating capacity validation.
- Customer account dashboard (`/account`) with order history and loyalty points.

## ✅ Phase 3: Kitchen & Admin Operations
- Kitchen Display System (KDS) at `/admin/kitchen` with ticket status cards.
- Admin dashboard with KPI metrics, recent order feeds, and quick actions.
- Order queue management for kitchen staff.
- Table floor plan management with visual layout grid.

## ✅ Phase 4: POS Billing & Invoicing Engine
- POS billing workspace at `/admin/billing` linked to table floor plan.
- Dynamic tax calculation (CGST 2.5% + SGST 2.5%) and promo code validation.
- GST-compliant invoice generation with 8 sub-components.
- PDF generation via `@react-pdf/renderer` and public invoice view (`/invoice/[number]`).

## ✅ Phase 5: Analytics & Reporting
- Analytics dashboard at `/admin/analytics` powered by Recharts.
- Sales trends, revenue breakups, peak ordering hours, and popular items analytics.
- Order history table with search, status filtering, and CSV export capabilities.

## ✅ Phase 6: Real-Time SSE Architecture
- Server-Sent Events (SSE) broadcaster and client connection registry.
- Custom `useSSE` hook for live updates across KDS, Billing, and Order Tracker.
- Immediate UI sync without polling overhead.

## ✅ Phase 7: Loyalty & Coupon Engine
- Database-backed promo codes with flat/percentage discount rules.
- Automated loyalty point accumulation (10 points per ₹100 spent).
- Customer loyalty badge calculation (Silver, Gold, Platinum).

## ✅ Phase 8: Moderated Customer Reviews
- Review submission form for verified diners.
- Admin moderation workspace for review approval/rejection.
- Display of approved reviews on public landing page.

## ✅ Phase 9: Premium Animation & Experience Layer
- Smooth momentum scrolling via Lenis.
- GSAP entrance animations for landing page elements.
- Page transition animations with Framer Motion.

---

## 🔄 Phase 10: Automation Engine (IN PROGRESS)
- [x] Schema models (`AutomationWorkflow`, `AutomationLog`) created.
- [x] Seed script for default automation rules created (`npm run db:seed-automations`).
- [x] Engine core class (`AutomationEngine`) implemented.
- [ ] Wire `AutomationEngine.fire()` into all mutating API routes (`POST/PUT/DELETE /api/orders`, `/api/bills`, `/api/tables`).
- [ ] Connect admin Settings page to save directly via `PUT /api/settings`.

---

## 📋 Phase 11: Razorpay Payment Gateway Integration (PLANNED)
- Razorpay SDK integration for online payments.
- Order creation API integration (`POST /api/payments/create`).
- Webhook endpoint for signature verification (`POST /api/payments/webhook`).
- Automatic order & bill status update upon successful transaction.

## 📋 Phase 12: Performance & Automated Testing (PLANNED)
- Lighthouse score optimization (> 90 target for Performance & Accessibility).
- End-to-End automated testing suite using Puppeteer.
- Bundle analysis and dynamic imports optimization.

## 📋 Phase 13: Enterprise Production Deployment (PLANNED)
- Automated Vercel CI/CD deployment pipeline.
- Neon serverless PostgreSQL connection pooling configuration.
- Domain configuration, SSL certification, and monitoring setup.
