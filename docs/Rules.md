# Rules.md — AI Agent Coding Standards

## ✅ Things AI MUST Do

1. Always read the relevant file before modifying it
2. Always use `apiHandler()` wrapper for all API routes
3. Always use `cn()` for conditional Tailwind classes
4. Always broadcast SSE after any order/table/bill mutation
5. Always fire `AutomationEngine.fire()` for trackable events
6. Always use `next/image` for images, never `<img>`
7. Always add `export const dynamic = "force-dynamic"` to API routes that fetch live data
8. Always use existing Zod schemas from `@/lib/validations` before creating new ones
9. Always add `aria-label` to icon-only buttons
10. Always test on mobile viewport (375px) before marking complete

---

## ❌ Things AI MUST NOT Do

1. Never create a new `PrismaClient` instance — always import from `@/lib/prisma`
2. Never use `Promise.all` for sequential dependent operations
3. Never `await` `AutomationEngine.fire()` — it is fire-and-forget
4. Never rename Prisma model fields without updating all API routes
5. Never remove SSE broadcasts from existing API routes
6. Never use `window.location.href` for navigation — use `router.push()`
7. Never add `useEffect` with empty deps that fetches data — use React Query or SWR
8. Never commit hardcoded credentials, API keys, or secrets
9. Never use `any` type in TypeScript without a comment explaining why
10. Never add a new npm package without checking if existing packages cover the need
11. Never break the billing flow — it is the most critical business workflow
12. Never modify `prisma/schema.prisma` field names — only add new models/fields

---

## 🚫 Forbidden Libraries
- `axios` (fetch is sufficient)
- `moment.js` (use date-fns which is already installed)
- `jQuery` (not needed in React)
- `react-query v3` (project uses v5 / TanStack Query)
- `Bootstrap`, `MUI`, `Chakra` (project uses Tailwind)
- `react-router-dom` (Next.js App Router handles routing)

---

## ✅ Preferred Libraries (already installed — use these)
- `framer-motion` for UI animations
- `gsap` for scroll-driven animations
- `lenis` for smooth scroll
- `date-fns` for date formatting
- `zod` for validation
- `react-hot-toast` for notifications
- `lucide-react` for icons (tree-shaken)
- `zustand` for global state
- `recharts` for charts

---

## 📩 API Response Format (must match exactly)

```ts
// Success:
return NextResponse.json({ success: true, data: result, message?: string });

// Error (via ApiError):
throw new ApiError(404, "NOT_FOUND", "Order not found");
// Output: { success: false, message: "Order not found", code: "NOT_FOUND" }
```

---

## 🔀 Git Commit Rules

```
feat: add customer loyalty tier badges
fix: resolve billing tableId null matching
refactor: extract InvoiceHeader into separate component
docs: update Architecture.md with automation diagram
chore: add db:seed-automations script
```

---

## 📋 Code Review Checklist

- [ ] Does it use `apiHandler()`?
- [ ] Does it broadcast SSE if it mutates order/table/bill?
- [ ] Does it fire `AutomationEngine.fire()` for relevant events?
- [ ] Does it have TypeScript types (no implicit `any`)?
- [ ] Does it work on mobile (375px)?
- [ ] Does it handle loading, error, and empty states?
- [ ] Does it use `cn()` for conditional classes?
