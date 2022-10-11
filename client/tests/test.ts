import { expect, test } from "@playwright/test";

test("index page has expected h1", async ({ page }) => {
  await page.goto("/");
  console.log(await page.content)
  expect(await page.textContent("h1")).toBe("Rules!");
});
