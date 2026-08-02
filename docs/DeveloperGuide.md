# DeveloperGuide.md — Local Setup & Developer Manual

## Quick Start Guide

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL database (local or Neon/Supabase instance)

---

## 1. Local Installation

```bash
# Clone repository
git clone https://github.com/addadotcom/addadotcom.git
cd addadotcom

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/addadotcom"
NEXTAUTH_SECRET="super-secret-key-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 2. Database Initialization

```bash
# Push Prisma schema to local database
npx prisma db push

# Seed initial categories, menu items, tables, admin user
npm run db:seed

# Seed automation workflows
npm run db:seed-automations
```

---

## 3. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Accessing the Admin Workspace
- URL: `http://localhost:3000/admin`
- Default Credentials: `admin@addadotcom.cafe` / `admin123`

---

## 4. Useful Helper Scripts

- **`npm run dev`**: Start Next.js development server.
- **`npm run build`**: Create production build.
- **`npm run db:seed`**: Re-seed database with default menu & admin data.
- **`npm run db:seed-automations`**: Re-seed default automation workflows.
- **`npx prisma studio`**: Open visual database browser.
