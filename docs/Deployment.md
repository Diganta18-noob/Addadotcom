# Deployment.md — Deployment & Operations Guide

## Production Deployment Checklist

### 1. Database Setup (Neon / Supabase PostgreSQL)
1. Provision PostgreSQL database instance.
2. Retrieve connection string with SSL mode enabled.
3. Configure connection pooling string for serverless environment.

### 2. Environment Variables Configuration
Set the following keys in Vercel project settings:

```env
DATABASE_URL="postgres://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-32-byte-hex-secret"
NEXTAUTH_URL="https://addadotcom.vercel.app"
NEXT_PUBLIC_APP_URL="https://addadotcom.vercel.app"
```

### 3. Build & Deployment Execution
```bash
# 1. Push database schema to production DB
npx prisma db push

# 2. Run seed script for initial categories, menu items, admin user
npm run db:seed

# 3. Seed automation workflows
npm run db:seed-automations

# 4. Trigger production build
npm run build
```

---

## Maintenance Commands
- Reset DB & seed: `npx prisma db push --force-reset && npm run db:seed`
- Inspect DB locally via Prisma Studio: `npx prisma studio`
