# Roadmap.md — Product Roadmap & Backlog

## Short-Term Backlog (Q3 2026)

### Phase 10 Completion
- Wire `AutomationEngine.fire()` into all mutating API routes (`/api/orders`, `/api/bills`, `/api/tables`).
- Update Admin Settings page (`/admin/settings`) to trigger `PUT /api/settings` on submit.

### Razorpay Integration (Phase 11)
- Install `@razorpay/razorpay-js` and server SDK.
- Add checkout integration for online takeaway and bill settlement.

---

## Mid-Term Vision (Q4 2026)

- **Multi-Branch Operations**: Support for multiple cafe locations, branch-specific menus, and inventory isolation.
- **AI Recommendation Engine**: Customer order suggestions based on past preferences and trending items.
- **Native Staff Mobile App**: React Native / Flutter companion app for waitstaff table service.
