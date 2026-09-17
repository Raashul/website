import { test, expect, APIRequestContext } from "@playwright/test";

const SKIP_PREFIXES = ["mailto:", "tel:", "#"];

function isCheckable(href: string) {
  return !SKIP_PREFIXES.some((prefix) => href.startsWith(prefix));
}

async function checkLink(request: APIRequestContext, href: string) {
  const response = await request.fetch(href, {
    method: "HEAD",
    failOnStatusCode: false,
    timeout: 15_000,
  });
  // Some external hosts (e.g. github.com, x.com) reject HEAD from bots;
  // fall back to GET before treating the link as broken.
  if (!response.ok() && [403, 405, 501].includes(response.status())) {
    const getResponse = await request.fetch(href, {
      method: "GET",
      failOnStatusCode: false,
      timeout: 15_000,
    });
    return getResponse;
  }
  return response;
}

test("every link on the home page resolves without a broken status", async ({
  page,
  request,
}) => {
  await page.goto("/");

  const hrefs = await page
    .locator("a[href]")
    .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href") ?? ""));

  const uniqueHrefs = [...new Set(hrefs)].filter((h) => h && isCheckable(h));
  expect(uniqueHrefs.length).toBeGreaterThan(0);

  const failures: string[] = [];

  for (const href of uniqueHrefs) {
    try {
      const response = await checkLink(request, href);
      if (!response.ok()) {
        failures.push(`${href} -> HTTP ${response.status()}`);
      }
    } catch (error) {
      failures.push(`${href} -> ${(error as Error).message}`);
    }
  }

  expect(failures, `Broken links found on home page:\n${failures.join("\n")}`).toEqual(
    []
  );
});

test("internal nav links navigate to the correct page", async ({ page }) => {
  await page.goto("/");

  const internalLinks: { name: string; path: string }[] = [
    { name: "Reading", path: "/reading" },
    { name: "Working On", path: "/working-on" },
    { name: "Segments", path: "/segments" },
    { name: "Blog", path: "/blog" },
  ];

  for (const link of internalLinks) {
    await page.getByRole("banner").getByRole("link", { name: link.name }).click();
    await expect(page).toHaveURL(new RegExp(`${link.path}$`));
    await page.goBack();
  }
});
