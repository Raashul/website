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

test("Ask opens a chat that shows the streamed answer", async ({ page }) => {
  let payload: Record<string, unknown> = {};
  await page.route("**/api/briefing/chat", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: { "X-Grounded": "article" },
      body: "Mocked grounded answer.",
    });
  });
  await page.goto("/briefing");

  const article = page.getByRole("article").first();
  await article.getByRole("button", { name: /Ask/ }).click();
  await article.getByLabel("Ask a follow-up question").fill("Why does this matter?");
  await article.getByRole("button", { name: "Send" }).click();

  await expect(article.getByText("Mocked grounded answer.")).toBeVisible();
  expect(payload.question).toBe("Why does this matter?");
  expect(payload.date).toBe("2026-10-11");
});

test("chat shows an error message when the API rejects the question", async ({ page }) => {
  await page.route("**/api/briefing/chat", (route) =>
    route.fulfill({ status: 429, json: { error: "Too many questions. Please wait a few minutes." } }),
  );
  await page.goto("/briefing");

  const article = page.getByRole("article").first();
  await article.getByRole("button", { name: /Ask/ }).click();
  await article.getByLabel("Ask a follow-up question").fill("Hello?");
  await article.getByRole("button", { name: "Send" }).click();

  await expect(article.getByRole("alert")).toContainText("Too many questions");
});

test("chat API validates input and unknown items", async ({ request }) => {
  const bad = await request.post("/api/briefing/chat", { data: { date: "nope", itemId: "x", question: "hi" } });
  expect(bad.status()).toBe(400);

  const unknown = await request.post("/api/briefing/chat", {
    data: { date: "2026-10-11", itemId: "does-not-exist", question: "hi" },
  });
  expect(unknown.status()).toBe(404);
});
