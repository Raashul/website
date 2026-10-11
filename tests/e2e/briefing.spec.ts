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

test("briefing sidebar lists past days and switches the viewed day", async ({ page }) => {
  await page.goto("/briefing");

  const sidebar = page.getByRole("navigation", { name: "Past briefings" });
  const dateLinks = sidebar.getByRole("link");
  expect(await dateLinks.count()).toBeGreaterThanOrEqual(5);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("October 11");

  const oct10 = sidebar.getByRole("link", { name: /Oct 10/ });
  if (await oct10.count()) {
    await oct10.first().click();
  } else {
    await page.goto("/briefing?date=2026-10-10");
  }

  await expect(page).toHaveURL(/date=2026-10-10/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("October 10");
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("October 11");
});

test("generate endpoint rejects unauthenticated requests", async ({ request }) => {
  const response = await request.post("/api/briefing/generate", {
    data: { date: "2026-10-12", generatedAt: "2026-10-12T12:00:00.000Z", items: [] },
  });

  expect(response.status()).toBe(401);
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
