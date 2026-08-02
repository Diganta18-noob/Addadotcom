# Testing.md — Automated & Manual Testing Guide

## Testing Strategy Overview

```
      / \
     /   \     E2E Tests (Puppeteer)
    /-----\
   /       \   Integration Tests (API Route Handlers)
  /---------\
 /           \ Unit Tests (Zod Validations, Utils, Calculation Helpers)
```

---

## 1. Unit Testing
- Validate Zod schema parses (`src/lib/validations.ts`).
- Tax, discount, and total calculation utilities in POS billing and invoice generators.

## 2. API Integration Testing
- Verify API handler responses using `apiHandler()` wrapper.
- Test error boundary propagation (`ApiError` HTTP status codes).

## 3. End-to-End Testing (Puppeteer)
- Test script setup available under `scripts/` or `test/`.
- Core user flows tested:
  1. Dine-In Table QR Scan → Place Order → KDS Notification.
  2. Takeaway Order Checkout → Payment Step → Receipt View.
  3. Admin POS Billing → Select Table → Calculate Split GST → Generate Bill.
