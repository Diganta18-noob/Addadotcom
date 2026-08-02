# Architecture.md — AddaDotCom System Architecture

## System Architecture Overview

```mermaid
graph TD
    Client[Client UI / Browser] --> NextApp[Next.js 14 App Router]
    NextApp --> Auth[NextAuth.js JWT Session]
    NextApp --> API[API Routes /api/*]
    API --> Helper[apiHandler Wrapper]
    Helper --> Prisma[Prisma ORM Client]
    Prisma --> DB[(PostgreSQL Database)]
    API --> SSE[SSE Emitter & Registry]
    SSE --> Stream[Server-Sent Events Stream]
    Stream --> Dashboards[KDS / POS Billing / Tables Live Sync]
    API -. Fire & Forget .-> AutoEngine[Automation Engine]
    AutoEngine --> Log[(Automation Log DB)]
```

---

## Tech Stack Table

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 14.2.29 | App Router, SSR, API Routes |
| Language | TypeScript | 5.x | End-to-end type safety |
| Database | PostgreSQL | Latest | Relational data store (Neon / Supabase) |
| ORM | Prisma | 6.9.0 | Type-safe DB client |
| Auth | NextAuth.js | 4.24.11 | JWT + Google OAuth |
| State | Zustand | 5.0.5 | Cart + UI state |
| Animation | Framer Motion | 12.12.0 | UI transitions & gestures |
| Animation | GSAP | 3.15.0 | Scroll & entrance animations |
| Scroll | Lenis | 1.3.25 | Smooth scroll engine |
| Charts | Recharts | 2.15.3 | Analytics dashboards |
| PDF | @react-pdf/renderer | 4.3.0 | GST Invoice PDF rendering |
| QR Code | qrcode.react | 4.2.0 | Table & Invoice QR codes |
| Validation | Zod | 4.4.3 | Schema validation |
| Logging | Winston | 3.17.0 | Server logs |
| Testing | Puppeteer | 25.3.0 | E2E testing |

---

## Folder Structure

```
addadotcom/
├── docs/                 # Authoritative project documentation system
├── prisma/
│   ├── schema.prisma     # 17 Prisma models & 6 enums
│   └── seed.ts           # Database seeder script
├── public/               # Static assets & images
└── src/
    ├── app/
    │   ├── (public)      # Homepage, menu, order, track, reserve, account, invoice
    │   ├── admin/        # Billing, kitchen, tables, history, analytics, automation
    │   └── api/          # 25+ REST API route endpoints
    ├── components/
    │   ├── animations/   # GSAP & Framer Motion wrappers
    │   ├── cart/         # Cart Drawer & item controls
    │   ├── invoice/      # 8 GST Invoice rendering sub-components
    │   ├── layout/       # Navbar, Footer, AdminSidebar, AdminNotifier
    │   └── shared/       # Status badges, buttons, modals
    ├── lib/
    │   ├── automation/   # Automation Engine, conditions, actions, queue
    │   ├── api-helpers.ts# Standard API wrapper & error handlers
    │   ├── sse-emitter.ts# Server-Sent Events broadcast hub
    │   ├── auth.ts       # NextAuth JWT & authorization config
    │   ├── prisma.ts     # Singleton Prisma client instance
    │   └── validations.ts# Zod schemas for all forms & payloads
    └── store/
        └── index.ts      # Zustand cart & UI persistent state
```

---

## Database Relationships

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Reservation : makes
    User ||--o{ Review : submits
    Table ||--o{ Order : assigned_to
    Table ||--o{ Reservation : reserved_for
    Order ||--o{ OrderItem : contains
    MenuItem ||--o{ OrderItem : refers_to
    Order ||--o| Bill : generates
    Category ||--o{ MenuItem : categorizes
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Middleware
    participant NextAuth
    participant DB

    User->>Client: Submit Login Credentials
    Client->>NextAuth: POST /api/auth/callback/credentials
    NextAuth->>DB: Query User by email
    DB-->>NextAuth: Return User + Password Hash
    NextAuth->>NextAuth: Verify bcrypt hash & generate JWT
    NextAuth-->>Client: Set Session Cookie (JWT)
    Client->>Middleware: Request protected page (/admin)
    Middleware->>Middleware: Validate JWT & Role (ADMIN/STAFF)
    Middleware-->>Client: Allow Access or Redirect to /login
```

---

## Real-Time SSE Architecture

```mermaid
sequenceDiagram
    participant Client Dashboard
    participant API Route
    participant SSE Emitter
    participant DB

    Client Dashboard->>API Route: Connect GET /api/sse (EventSource)
    API Route->>SSE Emitter: Register Client Response Stream
    Note over Client Dashboard, SSE Emitter: Connection held open

    API Route->>DB: POST /api/orders (Status update / new order)
    API Route->>SSE Emitter: broadcast({ type: 'ORDER_UPDATED', data })
    SSE Emitter->>Client Dashboard: Emit SSE Event payload
    Client Dashboard->>Client Dashboard: Trigger UI state update / re-render
```

---

## Order Status State Machine

```mermaid
stateDiagram-v2
    [*] --> PLACED: Order Submitted
    PLACED --> ACCEPTED: Admin/Kitchen Accepts
    ACCEPTED --> PREPARING: Kitchen Starts Prep
    PREPARING --> READY: Food Ready to Serve
    READY --> SERVED: Delivered to Table / Customer
    SERVED --> COMPLETED: Payment Recorded & Closed
    PLACED --> CANCELLED: Order Cancelled
    ACCEPTED --> CANCELLED: Order Cancelled
```

---

## Automation Engine Architecture

```mermaid
flowchart TD
    Event[API Trigger Event] --> Engine[AutomationEngine.fire()]
    Engine --> QueryWorkflows[Fetch Active Workflows from DB]
    QueryWorkflows --> CondCheck{Evaluate Trigger & Conditions}
    CondCheck -- True --> ExecAction[Execute Workflow Actions]
    CondCheck -- False --> Skip[Skip Execution]
    ExecAction --> Log[Write to AutomationLog DB]
```

---

## Deployment Architecture

```mermaid
graph LR
    GitHub[GitHub Repo] --> Vercel[Vercel CI/CD Build & Deployment]
    Vercel --> Edge[Vercel Edge Network / CDN]
    Edge --> App[Next.js Serverless Functions]
    App --> DB[(Neon PostgreSQL Database)]
```
