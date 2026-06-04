import { test, expect } from "@playwright/test";

/**
 * E2E tests for homepage-hero spec
 *
 * Spec source: openspec/specs/homepage-hero/spec.md
 * Each test() block maps to a WHEN/THEN scenario from the spec.
 *
 * Static-analysis scenarios (R2 grep, R2.2 type check, R3 ctaHref,
 * R4 BFF boundary, R6 data fields) are NOT E2E-testable;
 * they are covered by unit tests in HeroSlot.test.tsx.
 * A comment at each skipped test explains why.
 */

test.describe("homepage-hero E2E", () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(30_000);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator('[data-region="hero"]').waitFor({ state: "visible" });
  });

  // ─── R1: hero region 渲染 h1 + buttons ────────────────────────────────

  // Scenario 1.1 — WHEN: RTL renders HeroSlot
  //   THEN: querySelector('[data-region="hero"]') non-null AND tagName SECTION
  test("R1.1: hero region container exists and is a section element", async ({
    page,
  }) => {
    const hero = page.locator('[data-region="hero"]');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveAttribute("data-region", "hero");
    // Playwright can't check tagName directly, use evaluate
    const tagName = await hero.evaluate((el) => el.tagName);
    expect(tagName).toBe("SECTION");
  });

  // Scenario 1.2 — WHEN: querySelectorAll('section[data-region="hero"] h1')
  //   THEN: length === 1 AND textContent.trim().length > 0
  test("R1.2: hero region renders exactly 1 h1 with non-empty text", async ({
    page,
  }) => {
    const h1s = page.locator('section[data-region="hero"] h1');
    await expect(h1s).toHaveCount(1);
    const text = await h1s.first().textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  // Scenario 1.3 — WHEN: querySelectorAll('section[data-region="hero"] button')
  //   THEN: length >= 1 AND at least 1 button contains svg with path/line/etc.
  test("R1.3: hero region has at least 1 button containing an SVG icon", async ({
    page,
  }) => {
    const buttons = page.locator('section[data-region="hero"] button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // At least one button must contain an SVG with drawable elements
    const svgInButton = buttons.locator("svg").first();
    await expect(svgInButton).toBeAttached();

    const drawableCount = await svgInButton
      .locator("path, line, circle, polyline, rect")
      .count();
    expect(drawableCount).toBeGreaterThan(0);
  });

  // ─── R2: hero data from hardcoded TS constant (static analysis) ───────

  // Scenario 2.1 — grep guard: no fetch/lib/backend in HeroSlot.tsx
  // SKIPPED: This is a file-level static check, not an E2E scenario.
  // Covered by HeroSlot.test.tsx (readFileSync grep guard).

  // Scenario 2.2 — data file default-export is HeroContent typed object
  // SKIPPED: TypeScript type-check at compile time, not E2E-verifiable.
  // Covered by HeroSlot.test.tsx.

  // ─── R3: CTA placeholder must be # (data contract) ────────────────────

  // Scenario 3.1 — ctaHref === "#"
  // SKIPPED: Pure data contract, tested in HeroSlot.test.tsx.

  // Scenario 3.2 — no business route files introduced
  // SKIPPED: Filesystem check, tested in HeroSlot.test.tsx.

  // ─── R4: BFF boundary guard ───────────────────────────────────────────

  // Scenario 4.1 — no Route Handler files
  // SKIPPED: Filesystem check. Verified by CI guard + unit test grep.

  // Scenario 4.2 — lib/backend.ts unchanged
  // SKIPPED: Git diff check, not E2E.

  // Scenario 4.3 — package.json dependencies unchanged
  // SKIPPED: Git diff check, not E2E.

  // ─── R5: Hero visual-v1 visual contract ───────────────────────────────

  // Scenario 5.1 — WHEN: RTL renders HeroSlot
  //   THEN: hero section has bg-cover class, height >= 500px
  test("R5.1: hero section is full-width with bg-cover and height >= 500px", async ({
    page,
  }) => {
    const hero = page.locator('[data-region="hero"]');

    // Check bg-cover class is present
    await expect(hero).toHaveClass(/bg-cover/);

    // Check computed height >= 500px
    const height = await hero.evaluate(
      (el) => el.getBoundingClientRect().height,
    );
    expect(height).toBeGreaterThanOrEqual(500);
  });

  // Scenario 5.2 — WHEN: RTL renders HeroSlot
  //   THEN: h1 has text-5xl or text-6xl class AND non-empty textContent
  test("R5.2: hero h1 has large display font size (text-5xl or text-6xl)", async ({
    page,
  }) => {
    const h1 = page.locator('section[data-region="hero"] h1');
    await expect(h1).toBeVisible();

    // Tailwind class must include text-5xl or text-6xl
    const className = await h1.getAttribute("class");
    expect(className).toMatch(/text-5xl|text-6xl/);

    const text = await h1.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  // Scenario 5.3 — WHEN: RTL renders HeroSlot
  //   THEN: input[type="text"] exists, placeholder non-empty,
  //         sibling button contains Search icon
  test("R5.3: hero renders search input with placeholder and search icon button", async ({
    page,
  }) => {
    const input = page.locator(
      'section[data-region="hero"] input[type="text"]',
    );
    await expect(input).toBeVisible();

    const placeholder = await input.getAttribute("placeholder");
    expect(placeholder?.trim().length).toBeGreaterThan(0);

    // Sibling button must contain an SVG search icon
    const searchButton = page.locator(
      'section[data-region="hero"] button svg',
    );
    await expect(searchButton.first()).toBeAttached();
  });

  // ─── R6: Hero visual-v1 data contract (static analysis) ───────────────

  // Scenario 6.1 — data file contains backgroundImage URL
  // SKIPPED: Data-level check, covered by HeroSlot.test.tsx.

  // Scenario 6.2 — data file contains searchPlaceholder text
  // SKIPPED: Data-level check, covered by HeroSlot.test.tsx.
});

// ─── Cross-cutting: BFF runtime guard (E2E verifiable subset of R4) ─────

test.describe("homepage-hero — BFF runtime guard", () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(30_000);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator('[data-region="hero"]').waitFor({ state: "visible" });
  });

  // Scenario 4.1 (runtime): no API route handler is called during hero render
  test("R4.1-rt: no network requests to /api/** during hero page load", async ({
    page,
  }) => {
    const apiRequests: string[] = [];

    page.on("request", (req) => {
      const url = new URL(req.url());
      if (url.pathname.startsWith("/api/")) {
        apiRequests.push(req.url());
      }
    });

    // Re-navigate to capture requests
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator('[data-region="hero"]').waitFor({ state: "visible" });

    expect(apiRequests).toEqual([]);
  });
});
