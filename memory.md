# Project Memory Ledger — AddaDotCom

This document acts as the permanent codebase brain of the AddaDotCom Café & Restaurant application. It is designed to get a new developer up to speed on the application's architecture, data flows, database relationships, tech stacks, and internal components.

---

## 1. Project Overview
**AddaDotCom** is a full-stack café and restaurant management web application. It bridges the gap between public customer ordering (table booking, custom cart building, online checkouts, order tracking) and backend operations (point-of-sale receipt billing, live kitchen displays, table visual floor managers, inventory adjustments, and sales reports).

---

## 2. Business Purpose
The platform automates café operations:
- **For Customers:** Facilitates browsing digital menus, customizes coffee/food variants, handles digital cart checkout, books reservations with auto-matched table capacities, and tracks cooking progress.
- **For Waiters & Hosts:** Manages reservation queues, seats guests, monitors floor table status, and reports tables needing cleaning.
- **For Chefs:** Provides a digital Kitchen Display System (KDS) replacing paper kitchen tickets.
- **For Cashiers & Managers:** Computes POS bills, handles divided checks, processes payments (Cash/Card/UPI), logs ingredient deliveries/depletions, and monitors daily analytics.

---

## 3. Tech Stack
- **Framework:** Next.js v14.2.29 (App Router, React 18, TypeScript)
- **Styling & UI:** Vanilla CSS (`globals.css`) + TailwindCSS v3.4 + Framer Motion (page animations) + Lucide React (icons)
- **ORM / Database:** Prisma Client ORM with SQLite (`prisma/dev.db` locally)
- **State Management:** Zustand v5.0 (persistent local cart & dark mode configurations)
- **Reporting & POS:** Recharts v2.15 (financial graphs), react-hot-toast (notifiers), and React-PDF renderer (PDF downloads)

---

## 4. Repository Structure
The project is organized as a single Next.js App Router workspace:

```
addadotcom/
├── prisma/                    # Relational data schema & seeds
│   ├── dev.db                 # Local SQLite database (git-ignored)
│   ├── schema.prisma          # Database models, indexes, relations, and enums
│   └── seed.ts                # Populate menu items, default users, & tables
├── public/                    # Assets and default icon graphics
└── src/
    ├── app/                   # Next.js Page & API route hierarchy
    │   ├── (public)/          # Root layout pages (Home, Menu, Checkout, Reserve, Account)
    │   ├── admin/             # POS, KDS, Floor manager panels
    │   └── api/               # Backend API REST endpoints & Server-Sent Events
    ├── components/            # Reusable UI widgets
    │   ├── cart/              # Persistent shopping cart drawers
    │   ├── layout/            # Header Navbar & collapsible Admin sidebar
    │   └── shared/            # Badges, dietary tags, skeletons, inputs
    ├── lib/                   # Integrations and helper utilities
    │   ├── auth.ts            # NextAuth options (JWT strategy)
    │   ├── prisma.ts          # Pooled global Prisma client instantiator
    │   └── utils.ts           # Formatters (INR currencies) & code generators
    ├── store/                 # Zustand persistent local storage stores
    └── types/                 # TypeScript type interfaces
```

---

## 5. System Architecture
The application runs as a Next.js App Router monolith:
- **Client Side (CSR):** Handles public customer ordering and admin panels using React State and persistent Zustand hooks.
- **Server Side (SSR & REST):** Exposes JSON API endpoints under `/api/*` utilizing Prisma to fetch and update the database.
- **Database (Prisma/SQLite):** Stores persistent records locally in a file-based SQLite database.

Detailed diagrams are available in [architecture.md](file:///c:/Antigravity/Cafe/addadotcom/architecture.md).

---

## 6. Routing Map
Detailed map of all public and admin views is registered in [routes.md](file:///c:/Antigravity/Cafe/addadotcom/routes.md).

---

## 7. Frontend Architecture
- **State Layer:** Persistent client-side configurations are managed by Zustand:
  - `useCartStore` (`addadotcom-cart`): Holds cart items, order notes, delivery details, promo code discounts, and tip adjustments.
  - `useUIStore` (`addadotcom-ui`): Manages mobile menu status, cart drawer open state, selected category filters, and dark mode toggling.
- **Component Styling System:** Built on custom design tokens mapped in `globals.css` (Colors: `espresso`, `caramel`, `cream`, `sage`, `sand`) with Tailwind styling.
- **Shared Atoms:** Located in `src/components/shared/` to reuse status indicators, loading skeletons, and empty state placeholders.

---

## 8. Backend Architecture
The backend is composed of Next.js Route Handlers (`route.ts`) returning JSON.
- **Prisma Client:** Initialized as a global singleton (`src/lib/prisma.ts`) to avoid leaking connection pools during hot-reloads.
- **REST Interface:** Standard CRUD handlers for menu items, cafe tables, bookings, POS receipts, and inventory logs.
- **SSE Streams:** `/api/sse` opens a persistent event-stream connection to broadcast updates to dashboard clients.

---

## 9. Database Architecture
The persistence layer relies on a structured schema defined in `prisma/schema.prisma` and seeded via `prisma/seed.ts`.
- Complete fields and relational parent-child hierarchies are mapped in [database-map.md](file:///c:/Antigravity/Cafe/addadotcom/database-map.md).

---

## 10. Authentication Flow
- **NextAuth integration:** Setup in [auth.ts](file:///c:/Antigravity/Cafe/addadotcom/src/lib/auth.ts) and mounted on `/api/auth/[...nextauth]`. Supports standard Credentials provider (matched with bcrypt hashes) and Google OAuth provider.
- **JWT Strategy:** Stores session data in client tokens containing `user.role` and `user.id`.
- **Bypass Risk:** The frontend pages currently utilize mock/local client state for logging in (`AccountPage`) and do not enforce server-side session guards.

---

## 11. API Inventory
A detailed index of REST actions, query parameters, payloads, and side-effects is registered in [api-map.md](file:///c:/Antigravity/Cafe/addadotcom/api-map.md).

---

## 12. Data Flow Diagrams

### Ordering and Checkout Flow
```
Customer Cart (Zustand)
       │
       ▼ (Submit Order Form)
POST Request to /api/orders
       │
       ▼ (Backend generate ORD-number)
Prisma: Insert Order into DB
       │
       ▼ (If Dine-in)
Prisma: Update CafeTable status to OCCUPIED
       │
       ▼
Success Response ➔ Redirect to Tracker Page
```

### Table Reservation Flow
```
Reserve Form Inputs (Date, Party Size, Timeslot)
       │
       ▼
POST Request to /api/reservations
       │
       ▼ (Validation Engine)
1. Fetch tables where capacity >= partySize
2. Exclude tables with active bookings on date/slot
3. Allocate smallest matching table
       │
       ├─► (Table found) ➔ Confirm Reservation & return booking code
       └─► (No table found) ➔ Return 409 Conflict
```

---

## 13. Environment Variables
Defined variables in `.env.example`:
- `DATABASE_URL`: Relational database connection string (SQLite file path `file:./dev.db`).
- `NEXTAUTH_URL`: Canonical root URL of the site (`http://localhost:3000`).
- `NEXTAUTH_SECRET`: Hash signing key.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Optional Google login integrations.
- `NEXT_PUBLIC_APP_NAME`: Site branding title.
- `NEXT_PUBLIC_CURRENCY` / `NEXT_PUBLIC_CURRENCY_SYMBOL`: Financial indicators (Default: `INR` / `₹`).

---

## 14. Third Party Integrations
- **Google OAuth:** Binds OAuth identities to User accounts via NextAuth callbacks.
- **Unsplash Images:** Serves dynamic high-definition restaurant, beverage, and dessert images for frontend components.
- **Google Maps iframe:** Embedded on the landing page to provide direction lookups for the restaurant's Koramangala block location.

---

## 15. Feature Inventory
1. **Interactive Menu:** Filter by category tabs, tags, and search query. Persistence cart builder with variants and addons.
2. **Checkout Terminal:** Select Dine-in / Takeaway / Delivery. Dynamically computes CGST, SGST, service charges, tips, and custom promo code discounts.
3. **Table Booking Engine:** Auto-allocates dining tables using a capacity matching algorithm.
4. **POS Bill Generator:** Computes split bills, records payments (Cash, Card, UPI), and prints mock thermal invoice receipts.
5. **Live KDS Tracker:** Allows kitchen staff to manage active orders (Placed, Accepted, Preparing, Ready) via list queue or Kanban boards.
6. **Floor Layout Manager:** Displays table grids across Indoor, Outdoor, and Terrace zones with status actions.
7. **Inventory Logging:** Adjusts ingredient stocks and saves log histories with alerts for low stock levels.
8. **Sales Reports:** Aggregates weekly revenue trends and category charts.

---

## 16. Dependency Graph
Visual representation of imports and critical files is detailed in [dependency-graph.md](file:///c:/Antigravity/Cafe/addadotcom/dependency-graph.md).

---

## 17. Important Files
- `src/lib/prisma.ts`: Database client instantiation.
- `src/lib/auth.ts`: Auth options.
- `src/store/index.ts`: Persistent Zustand stores.
- `src/components/shared/index.tsx`: Shared UI badges, skeletons, and icons.

---

## 18. Performance Notes
- **Prisma Client:** Instantiated globally to prevent running out of database connections during development.
- **Lazy Loading Images:** Images are loaded lazily (`loading="lazy"`) to improve page performance.
- **Polling Intervals:** Order status checks poll `/api/orders/[id]` every 10 seconds to maintain real-time tracking without excessive server loads.

---

## 19. Technical Debt
1. **Admin Mock Decoupling:** Admin modules (dashboard, billing, orders queue, reservations, table floor, inventory logs) rely on simulated React state with mock data instead of query APIs.
2. **Missing Auth Route Guards:** No server-side routing middleware blocks access to `/admin` paths.
3. **Menu Category Revenue Placeholder:** Sales-by-category charts return a `revenue: 0` placeholder because there is no mapping table connecting specific order items directly to menu categories.

---

## 20. Development Workflow
1. Install node dependencies: `npm install`
2. Sync schema structure: `npx prisma db push`
3. Load initial seed database: `npm run db:seed`
4. Spin up dev server: `npm run dev`

---

## 21. Deployment Process
- Run production bundle: `npm run build`
- Start server: `npm run start`
- Secure deployment requires upgrading database from local SQLite to a hosted PostgreSQL client and updating the `DATABASE_URL` environment variable.

---

## 22. Known Risks
- **`hasSome` Prisma tag query crash:** SQLite and Prisma do not support array methods (`hasSome`) on string fields. Querying `/api/menu?tags=VEG` will result in a backend crash because `tags` is a standard string column.
- **Mock data synchronization:** Because admin panels modify local component state, adjustments made on admin screens are not saved to the SQLite database and will reset upon page reload.

---

## 23. Future Recommendations
1. **Connect Admin to APIs:** Refactor admin screens to fetch and edit database records via endpoints (e.g. `/api/inventory/[id]` PUT and `/api/orders` GET).
2. **Fix Category Sales Revenue Mapping:** Update the database models to link order items directly to category tables to enable accurate revenue charts.
3. **Implement Admin Session Guards:** Add a Next.js middleware file (`src/middleware.ts`) checking `session.user.role` to restrict `/admin/*` routes to `STAFF`, `MANAGER`, and `ADMIN` users.
4. **Fix Tag Search Logic:** Change the SQLite tags database schema from comma-separated `String` to array types, or update the API filter query to use `contains` rather than `hasSome` to prevent application crashes.
