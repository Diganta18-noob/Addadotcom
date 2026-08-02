# PRD.md — Product Requirements Document

## Project Vision
AddaDotCom is an enterprise-grade Café & Restaurant Management System designed to streamline operations from customer table QR ordering to Kitchen Display System (KDS), POS billing, real-time inventory management, analytics, and automated workflows.

---

## Problem Statement
Traditional restaurant systems are fragmented: legacy POS software lacks real-time kitchen integration, QR ordering requires external third-party apps, and analytics are often delayed or locked behind expensive SaaS subscriptions. AddaDotCom provides a unified, self-hosted/cloud-native solution.

---

## Target Audience & User Personas

### 1. The Cafe Owner / Manager (Admin)
- Needs full visibility into real-time sales, peak hours, menu performance, and staff operations.
- Wants automatic billing with CGST/SGST calculations and downloadable PDF invoices.

### 2. The Kitchen Chef / Operator (Kitchen Staff)
- Needs a clean, high-contrast, fullscreen Kitchen Display System (KDS).
- Wants real-time visual notifications when orders arrive, without needing to refresh pages.

### 3. The Customer / Diner
- Wants a fast, responsive mobile ordering experience via table QR code scanning.
- Wants real-time tracking of order preparation progress without downloading an app.

---

## Core Features

### Customer Features
- **Interactive Menu**: Category filtering, search, veg/non-veg tags, customizable item variants/addons.
- **Dine-In & Takeaway Checkout**: 3-step checkout process. Dine-In orders skip upfront payment.
- **Real-Time Order Tracking**: Live order tracker at `/track/[id]` powered by SSE.
- **Table QR Ordering**: Direct ordering pre-filled with table numbers via QR scan.
- **Table Reservation**: Online table booking form with capacity validation.
- **Customer Account**: Profile management, past order history, loyalty points, and reservations.
- **Public Invoice Verification**: QR code on receipt leads to `/invoice/[number]` for instant digital invoice view.

### Kitchen Features
- **Kitchen Display System (KDS)**: Fullscreen layout at `/admin/kitchen` with status transitions (`ACCEPTED` → `PREPARING` → `READY` → `SERVED`).

### POS & Billing Features
- **POS Billing Desk**: `/admin/billing` table floorplan integration, manual order search, split tax (CGST/SGST), discount codes, and payment recording.
- **GST Invoicing**: PDF export via `@react-pdf/renderer` and browser print formatting.

### Admin & Operations Features
- **Analytics & Reports**: Visual charts for revenue, popular items, category distribution, and peak hours heatmap.
- **Table Floor Plan**: Visual grid layout at `/admin/tables` with real-time occupancy status and QR generator.
- **Coupon Engine**: Promo code creation with percentage/flat discounts and expiry limits.
- **Review Moderation**: Customer review submission with admin approval workflow.
- **Automation Engine**: Rule-based automation engine for status triggers, notifications, and inventory adjustments.

---

## Non-Functional Requirements

- **Performance**: API response times under 200ms; SSE broadcast latency under 500ms.
- **Availability**: 99.9% availability hosted on Vercel + Neon serverless PostgreSQL.
- **Security**: Strict Role-Based Access Control (RBAC) via NextAuth JWT. Parameterized queries via Prisma to prevent SQL injection.
- **Usability**: Mobile-first responsive UI supporting screen resolutions from 320px to 1440px+.

---

## Business Rules

1. **Dine-In Orders**: Guests pay AFTER food is served. Payment step is skipped at checkout for `DINE_IN`.
2. **Bill Generation**: Bills are generated strictly through the admin billing desk to allow split taxes, manual item adjustments, and promo codes.
3. **Order Lifecycle**: Orders cannot be deleted once created; completed/cancelled orders move into Order History.
4. **Loyalty Program**: Customers earn 10 loyalty points per ₹100 spent on completed orders.
5. **Tax Calculation**: Default GST is 5% split into CGST (2.5%) and SGST (2.5%), configurable in Settings.

---

## Features Explicitly Out of Scope

- Delivery / rider dispatch tracking.
- External catering or event booking modules.
- SMS / WhatsApp third-party messaging integrations (Twilio/MSG91).
- Direct Resend/SMTP email notifications.

---

## Key Performance Indicators (KPIs)

- **Order Placement Duration**: < 90 seconds for table QR customer order.
- **Kitchen Update Latency**: < 500ms via SSE stream.
- **Invoice PDF Generation**: < 1 second on demand.

---

## Glossary

- **KDS**: Kitchen Display System.
- **POS**: Point of Sale billing terminal.
- **CGST / SGST**: Central & State Goods and Services Tax.
- **SSE**: Server-Sent Events (real-time unidirectional push).
- **QR**: Quick Response matrix barcode.
