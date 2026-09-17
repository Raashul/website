import { test, expect } from "@playwright/test";

test("home page loads successfully", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Rashul/);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("link", { name: "Rashul" })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("home page renders without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  expect(errors, `Console/page errors found:\n${errors.join("\n")}`).toEqual([]);
});
