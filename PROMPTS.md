# AddaDotCom — Project Prompt Log

This document records all user prompts provided during the development and production hardening of the **AddaDotCom** project.

---

## Prompt History

### Prompt 1: Production Readiness Audit & Roadmap
**Timestamp**: 2026-08-02T13:56:04+05:30

```text
Production Readiness Audit — AddaDotCom
Executive Summary
Domain	Score	Status
Database	52/100	⚠️ Critical gaps
Security	38/100	🔴 Critical vulnerabilities
Performance	61/100	⚠️ Significant issues
Scalability	31/100	🔴 Will collapse at scale
Reliability	44/100	⚠️ No transactions, no idempotency
Monitoring	12/100	🔴 Winston installed but unused
Infrastructure	55/100	⚠️ No security headers
Code Quality	68/100	✅ Reasonable
UX	72/100	✅ Good
Accessibility	41/100	⚠️ Gaps
Testing	5/100	🔴 Puppeteer installed but zero tests
Overall Production Readiness: 44/100 — NOT production-ready.

🔴 Critical Issues (Fix Before Production)
CRIT-1: Hardcoded fallback secret in auth + middleware
File: auth.ts line 8, middleware.ts line 10
Exact code found:
// auth.ts:
secret: process.env.NEXTAUTH_SECRET || "addadotcom-secret-key-2026-super-secure-jwt",
// middleware.ts:
const secret = process.env.NEXTAUTH_SECRET || "addadotcom-secret-key-2026-super-secure-jwt";
Severity: CRITICAL — If NEXTAUTH_SECRET env var is missing on any deployment, the fallback string is a publicly visible secret in the repository. Any attacker who reads this file can forge JWTs and impersonate any admin.
Fix: Remove the fallback. Throw on startup if missing.

CRIT-2: Zero authentication on all admin API routes
Files: Every route in /api/billing, /api/orders, /api/inventory, /api/tables, /api/reservations, /api/settings, /api/automation, /api/reviews
Evidence from reading all routes: None of them call getServerSession(). The middleware only protects the /admin/* pages — not the /api/* routes.
Attack vector: Any unauthenticated HTTP client can call POST /api/billing, DELETE /api/tables/[id], PUT /api/inventory/[id], GET /api/settings, PUT /api/automation/[id] directly. No browser needed.
Fix — Add auth check to apiHandler OR create a protected wrapper.

CRIT-3: SSE emitter uses in-memory Set — crashes on Vercel serverless
File: sse-emitter.ts
Evidence: const subscribers = new Set<WritableStreamDefaultWriter<Uint8Array>>();
Fix: Use Redis / Vercel KV publish channel or polling fallback.

CRIT-4: Dashboard API has a 7-query N+1 loop
File: route.ts lines ~60-80
Fix — replace with a single raw SQL query DATE_TRUNC('day', "createdAt").

CRIT-5: Analytics API fetches ALL orders into memory
File: route.ts line ~52
Fix — move item aggregation to SQL.

CRIT-6: generateBillNumber() and generateOrderNumber() are not collision-safe
File: utils.ts lines 50-66
Fix — use DB sequence or crypto.randomUUID() suffix.

🟠 High Priority Issues
HIGH-1: No rate limiting on any endpoint
HIGH-2: No security headers (CSP, HSTS, X-Frame-Options)
HIGH-3: No database transactions for multi-step operations
HIGH-4: Missing indexes on high-query fields
HIGH-5: createOrderSchema uses z.any() for items — no validation
HIGH-6: Prisma connection pool not configured for production

🟡 Medium Priority Improvements
MED-1: No request body size limit
MED-2: Auth session callback hits DB on every request
MED-3: GET /api/inventory returns stock logs in response
MED-4: Billing GET returns full bill rows with no pagination
MED-5: generateBillNumber and generateOrderNumber called client-side in Zustand

⚡ Quick Wins
1. Remove hardcoded secret fallback
2. Add next.config.js security headers
3. Add ?connection_limit=10 to DATABASE_URL
4. Replace 7-query dashboard loop with 1 SQL query
5. Add take: 50 pagination to billing GET
6. Add GET /api/health endpoint
7. Move loyalty points to JWT token
8. Add Prisma indexes
```

---

### Prompt 2: Plan Approval
**Timestamp**: 2026-08-02T14:01:52+05:30

```text
The user has approved this document (implementation_plan.md).
```

---

### Prompt 3: Repository Push
**Timestamp**: 2026-08-02T14:23:53+05:30

```text
push
```

---

### Prompt 4: Save Prompts Log
**Timestamp**: 2026-08-02T14:37:51+05:30

```text
now make a prompt md file where u save every prompt of this project
```
