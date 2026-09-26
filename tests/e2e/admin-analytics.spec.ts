import { test, expect } from "@playwright/test";

test.describe("Admin Analytics & POS Dashboard Flow", () => {
  test("analytics page loads without unhandled runtime crash", async ({
    page,
  }) => {
    // Navigate to admin analytics
    const res = await page.goto("/admin/analytics");
    expect(res?.status()).toBeLessThan(500);

    // Page must not show unhandled react error overlay
    await expect(page.locator("text=Application error")).toHaveCount(0);
    await expect(page.locator("text=Internal Server Error")).toHaveCount(0);

    // Either dashboard or access control gate is rendered cleanly
    const isAccessControlled = await page.locator("text=Admin Access Required").isVisible().catch(() => false);
    const isDashboard = await page.locator("text=Business Analytics Dashboard").isVisible().catch(() => false);
    const isLoading = await page.locator("text=Calculating POS Business Analytics...").isVisible().catch(() => false);

    expect(isAccessControlled || isDashboard || isLoading).toBe(true);
  });
});
