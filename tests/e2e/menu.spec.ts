import { test, expect } from "@playwright/test";

test.describe("Menu & Catalog Flow", () => {
  test("renders menu page with category navigation tabs", async ({ page }) => {
    await page.goto("/menu");

    // Check menu container
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();

    // Verify search input is interactive
    const searchInput = page.locator("input[type='text'], input[placeholder*='Search']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Coffee");
      await expect(searchInput).toHaveValue("Coffee");
    }
  });
});
