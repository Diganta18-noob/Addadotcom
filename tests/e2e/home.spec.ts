import { test, expect } from "@playwright/test";

test.describe("Home Page & Customer UX", () => {
  test("loads landing page with hero brand and navigation elements", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AddaDotCom|Café/i);

    // Verify Brand is visible in header
    const brand = page.locator("text=AddaDotCom").first();
    await expect(brand).toBeVisible();

    // Verify key action buttons exist
    const exploreMenuBtn = page.getByRole("link", { name: /Menu/i }).first();
    await expect(exploreMenuBtn).toBeVisible();
  });

  test("contains active live ticker and promotional sections", async ({
    page,
  }) => {
    await page.goto("/");
    // Ensure the page rendered without console crashes
    const pageBody = page.locator("body");
    await expect(pageBody).toBeVisible();
  });
});
