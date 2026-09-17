My personal website. Built with Next.js.

## End-to-end tests

Playwright tests live in `tests/e2e/`. Install once, then run:

```bash
# one-time setup
npx playwright install chromium

# run the suite headless
npm run test:e2e

# run with the Playwright UI (step through tests, inspect DOM/network)
npm run test:e2e:ui

# view the last HTML report
npm run test:e2e:report
```

The suite starts its own `next dev` server on port 3000 (via `webServer` in
`playwright.config.ts`), so you don't need to run `npm run dev` yourself first.
If a dev server is already running on that port, the tests reuse it instead of
starting a second one.

Current coverage:

- `tests/e2e/app.spec.ts` — the home page loads (200 response, title, nav, footer)
  and renders with no console/page errors.
- `tests/e2e/theme-toggle.spec.ts` — the theme toggle switches between light and
  dark, and the choice persists across a reload.
- `tests/e2e/home-links.spec.ts` — every link found on the home page (nav, body,
  footer) resolves with a non-error HTTP status, including live checks
  against external links; and the internal nav links (Reading, Working On,
  Segments, Blog) actually navigate to the right page.
- `tests/e2e/tabs.spec.ts` — the tab switcher (used on `/reading` for Books/Podcasts
  and `/working-on` for Currently working on/History/Education) shows a
  distinct panel per tab and visually highlights only the active one.
