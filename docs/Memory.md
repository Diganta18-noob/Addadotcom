# Memory.md — Living Project Journal

> This document is APPEND-ONLY. Never delete previous entries.
> Always add new entries at the TOP under the current date.

---

## [2026-07-27] Documentation & System Architecture Standardization

### Status: Active Development
### Current Sprint: Phase 10 — Automation Engine & Master Documentation

### Completed This Session
- Established the official **AI Project Documentation System** inside `addadotcom/docs/`.
- Created authoritative core documents:
  - `AgentContext.md`: Project brain & rules for AI agents.
  - `Rules.md`: Strict coding standards & forbidden patterns.
  - `Architecture.md`: System diagrams & technical specification.
  - `PRD.md`: Product Requirements Document & business logic rules.
  - `Design.md`: Design system, token specification & UI standards.
  - `Phases.md`: Comprehensive 13-phase roadmap tracking.
  - `Memory.md`: Append-only project log.

### Known Bugs (Current Tracking)
1. **Billing NaN Crash**: `recordPayment()` can encounter `NaN` when `CASH` or `UPI` payment input is undefined before submission.
2. **Billing Table ID Reset**: `fetchData()` clears `selectedTableId` post-payment, hiding the receipt dialog prematurely.
3. **Invoice Public QR URL**: QR code links use hardcoded host URL — dynamic origin detection state implemented in `InvoiceDocument.tsx`.
4. **Settings Admin Form**: `src/app/admin/settings/page.tsx` saves state locally rather than triggering `PUT /api/settings`.

### Key Architectural Decisions Preserved
- **Dine-In Workflow**: Payment is NEVER collected upfront for Dine-In orders (`DINE_IN` skips Step 3 payment in checkout).
- **Single-Page PDF Invoice**: PDF generator is strictly bounded to a single page layout (maximum 15 items displayed).
- **Automation Fire-and-Forget**: `AutomationEngine.fire()` MUST be non-blocking (never `await` in API response pipeline).
- **SSE Broadcast Triggering**: Every mutation to orders, tables, or bills MUST trigger `broadcast()` via `src/lib/sse-emitter.ts`.

---

## [Initial Foundation Phase] Infrastructure Setup

### Completed
- Initialized monorepo structure with Next.js 14 App Router and TypeScript.
- Created 17 Prisma database models covering Users, Orders, MenuItems, Bills, Tables, Reservations, PromoCodes, Reviews, and Automations.
- Implemented real-time Server-Sent Events engine in `src/lib/sse-emitter.ts`.
- Built POS billing desk and Kitchen Display System interfaces.
