import { test, expect } from "@playwright/test";

const pagesWithTabs: { path: string; tabs: string[] }[] = [
  { path: "/reading", tabs: ["Books", "Podcasts"] },
  { path: "/working-on", tabs: ["Currently working on", "History", "Education"] },
];

for (const { path, tabs } of pagesWithTabs) {
  test(`tab navigation on ${path} switches panels and highlights the active tab`, async ({
    page,
  }) => {
    await page.goto(path);

    const panel = page.locator("main");
    const panelTextByTab = new Map<string, string>();
    const TRANSPARENT = "rgba(0, 0, 0, 0)";
    const borderColor = (locator: import("@playwright/test").Locator) =>
      locator.evaluate((el) => getComputedStyle(el).borderBottomColor);

    for (const label of tabs) {
      const tabButton = page.getByRole("button", { name: label, exact: true });
      await tabButton.click();

      // React commits the active-tab class swap asynchronously relative to
      // the click resolving, so poll rather than reading the style once.
      await expect.poll(() => borderColor(tabButton)).not.toBe(TRANSPARENT);
      const activeBorder = await borderColor(tabButton);

      for (const otherLabel of tabs.filter((t) => t !== label)) {
        const otherButton = page.getByRole("button", {
          name: otherLabel,
          exact: true,
        });
        const otherBorder = await borderColor(otherButton);
        expect(
          otherBorder,
          `"${otherLabel}" should not be highlighted while "${label}" is active`
        ).not.toBe(activeBorder);
      }

      panelTextByTab.set(label, (await panel.innerText()).trim());
    }

    const uniquePanelTexts = new Set(panelTextByTab.values());
    expect(
      uniquePanelTexts.size,
      `Expected each tab to render distinct content, got:\n${JSON.stringify(
        Object.fromEntries(panelTextByTab),
        null,
        2
      )}`
    ).toBe(tabs.length);
  });
}
