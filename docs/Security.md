# Security.md — Security & Authentication Specification

## Authentication Architecture
- Managed by **NextAuth.js v4** (`src/lib/auth.ts`).
- Uses JWT session strategy (`session: { strategy: "jwt" }`).
- Support for `CredentialsProvider` (Email + bcrypt password hash) and `GoogleProvider` OAuth.

---

## Role-Based Access Control (RBAC) Matrix

| Endpoint / Page | Public | Customer | Staff | Admin |
|-----------------|--------|----------|-------|-------|
| `/` (Homepage), `/menu` | ✅ | ✅ | ✅ | ✅ |
| `/order`, `/track/*` | ✅ | ✅ | ✅ | ✅ |
| `/reserve`, `/invoice/*` | ✅ | ✅ | ✅ | ✅ |
| `/account` | ❌ | ✅ | ✅ | ✅ |
| `/admin/kitchen` | ❌ | ❌ | ✅ | ✅ |
| `/admin/billing` | ❌ | ❌ | ✅ | ✅ |
| `/admin/tables` | ❌ | ❌ | ✅ | ✅ |
| `/admin/dashboard` | ❌ | ❌ | ❌ | ✅ |
| `/admin/analytics` | ❌ | ❌ | ❌ | ✅ |
| `/admin/automation` | ❌ | ❌ | ❌ | ✅ |
| `/admin/settings` | ❌ | ❌ | ❌ | ✅ |

---

## Data Protection & Injection Prevention

1. **SQL Injection Prevention**: All queries execute through Prisma ORM using parameterized SQL under the hood. No raw string interpolation allowed in `prisma.$queryRaw`.
2. **API Input Validation**: Every request payload is validated at the endpoint boundary using Zod schemas (`src/lib/validations.ts`).
3. **Environment Security**: Sensitive keys (`DATABASE_URL`, `NEXTAUTH_SECRET`) are loaded strictly from environment variables and never exposed to client-side bundles.
