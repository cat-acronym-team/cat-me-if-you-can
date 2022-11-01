import { expect, test } from "@playwright/test";

test("splash page has create and join buttons", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator('button:has-text("Create Lobby")').count()).toBe(1);
  expect(await page.locator('button:has-text("Join Lobby")').count()).toBe(1);
});
