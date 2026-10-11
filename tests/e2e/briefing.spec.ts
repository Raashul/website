import { test, expect } from "@playwright/test";

test("briefing page loads successfully", async ({ page }) => {
  const response = await page.goto("/briefing");

  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Briefing/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("October 11");
});

test("briefing page renders items with absolute source links", async ({ page }) => {
  await page.goto("/briefing");

  const items = page.getByRole("article");
  await expect(items.first()).toBeVisible();
  expect(await items.count()).toBeGreaterThanOrEqual(5);

  const sourceLinks = page.getByRole("link", { name: /Read source/ });
  const linkCount = await sourceLinks.count();
  expect(linkCount).toBeGreaterThanOrEqual(5);

  for (let i = 0; i < linkCount; i++) {
    const href = await sourceLinks.nth(i).getAttribute("href");
    expect(href).toMatch(/^https?:\/\//);
  }
});

test("briefing page renders without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/briefing");

  expect(errors, `Console/page errors found:\n${errors.join("\n")}`).toEqual([]);
});
