import { test, expect } from "@playwright/test";

test.describe("theme toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
  });

  test("starts in light mode", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("switches to dark mode and back", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle theme" });
    const html = page.locator("html");

    const readBackgroundVar = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--background")
          .trim()
      );

    await expect(html).not.toHaveClass(/dark/);
    const lightBg = await readBackgroundVar();

    await toggle.click();
    await expect(html).toHaveClass(/dark/);
    const darkBg = await readBackgroundVar();
    expect(darkBg).not.toBe(lightBg);

    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("persists the chosen theme across reload", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle theme" });
    const html = page.locator("html");

    await toggle.click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });
});
