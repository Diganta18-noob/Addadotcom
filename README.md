# AddaDotCom — Café & Restaurant Web Application

AddaDotCom is a production-ready, full-stack café and restaurant web application featuring a stunning customer interface, online menu, reservation booking flow, online checkout, and a comprehensive admin control dashboard including billing/POS, visual table floor management, live orders displaying kitchen displays, inventory alerts, and daily sales reports.

---

## 🚀 Tech Stack

- **Core:** Next.js 14 (App Router, TypeScript)
- **Styling:** TailwindCSS v3 + shadcn/ui components + Framer Motion
- **Database:** Prisma ORM with SQLite (pre-configured for zero-setup local dev)
- **State Management:** Zustand (cart & UI state persist in localStorage)
- **Reporting & POS:** Recharts, react-hot-toast notification triggers, and live thermal-style receipt generation.

---

## 🛠️ Getting Started & Setup

### Prerequisites

- Node.js 18.x or 20.x
- npm

### Installation & Run

1. Clone or extract the project files and navigate to the project directory:
   ```bash
   cd addadotcom
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Sync database schema (generates local SQLite `prisma/dev.db` database):
   ```bash
   npx prisma db push
   ```

4. Populate the database with 23 realistic menu items, 12 tables, admin credentials, promo codes, and settings:
   ```bash
   npm run db:seed
   ```

5. Run the local development server:
   ```bash
   npm run dev
   ```

6. Open your browser to:
   - **Main Website:** [http://localhost:3000](http://localhost:3000)
   - **Admin / Staff Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔑 Default Credentials

Use the following logins to explore the platform on first run:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@addadotcom.cafe` | `admin123` |
| **Staff** | `staff@addadotcom.cafe` | `staff123` |

---

## 🗂️ Project Structure

- `prisma/`: Data models & SQLite seeding configurations.
- `src/app/`: App router routes:
  - `(public)/`: Home, Menu, Reservations, Cart, Checkout, Order Tracker, and Customer Accounts.
  - `admin/`: Admin control panels (live KDS, floor manager, POS, reports, promo config).
  - `api/`: Backend REST routes (SSE broadcast, checkout hooks, lookup controllers).
- `src/components/`: Reusable React components (modals, visual overlays, layouts).
- `src/store/`: Zustand state management modules.
- `src/types/`: Complete TypeScript interface bindings.
