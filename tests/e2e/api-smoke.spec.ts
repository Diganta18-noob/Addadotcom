import { test, expect } from "@playwright/test";

test.describe("API Health & Contract Smoke Tests", () => {
  test("GET /api/orders/monthly returns JSON with 12 months data", async ({
    request,
  }) => {
    const res = await request.get("/api/orders/monthly?year=2026");
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data.months)).toBe(true);
    expect(body.data.months.length).toBe(12);
  });

  test("GET /api/orders/analytics returns summary and KPI structure without 500 error", async ({
    request,
  }) => {
    const res = await request.get("/api/orders/analytics?range=month");
    expect(res.status()).toBeLessThan(500);

    const body = await res.json();
    if (res.ok() && body.success) {
      expect(body.data.summary).toBeDefined();
      expect(body.data.peakHours).toBeDefined();
      expect(body.data.busiestDays).toBeDefined();
      expect(body.data.salesByCategory).toBeDefined();
    }
  });
});
