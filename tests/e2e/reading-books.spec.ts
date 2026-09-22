import { test, expect } from "@playwright/test";

test("book card opens a modal with the review and closes again", async ({ page }) => {
  await page.goto("/reading");

  await expect(page.getByRole("heading", { name: "Reading", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recently Read" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Top Recommends" })).toBeVisible();
  await expect(page.getByText("Top Pick").first()).toBeVisible();

  const card = page
    .getByRole("button", { name: "Read notes on The Hard Thing About Hard Things" })
    .first();
  await card.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("April 2025");
  await expect(dialog).toContainText("One of the best books I've read");
  await expect(dialog.getByRole("link", { name: "View on Amazon" })).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("src", /hard-things/);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  await card.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the currently reading hero is not clickable and links straight to Amazon", async ({ page }) => {
  await page.goto("/reading");

  const hero = page.locator("section").filter({ hasText: "Currently Reading" }).first();
  await expect(hero.getByRole("heading", { level: 2 })).toHaveText(
    "The Wisdom of Crowds (James Surowiecki)"
  );
  await expect(hero.locator("img")).toHaveAttribute("src", /the-wisdom-of-crowds/);

  await expect(page.getByRole("button", { name: /Open details for/ })).toHaveCount(0);
  await expect(hero.getByRole("button")).toHaveCount(0);

  const amazon = hero.getByRole("link", { name: "View on Amazon" });
  await expect(amazon).toBeVisible();
  await expect(amazon).toHaveAttribute("href", /amazon\.com/);
});

test("a book with no matched cover falls back to the placeholder", async ({ page }) => {
  await page.goto("/reading");
  const card = page.getByRole("button", { name: /Read notes on Cryptomania/ });
  await expect(card.locator("img")).toHaveAttribute("src", /placeholder\.svg/);
});
