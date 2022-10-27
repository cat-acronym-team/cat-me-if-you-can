import { expect, test } from "@playwright/test";

test("splash page has create and join buttons", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator('button:has-text("Create")').count()).toBe(1);
  expect(await page.locator('button:has-text("Join")').count()).toBe(1);
});
