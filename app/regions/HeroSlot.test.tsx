import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import HeroSlot from "./HeroSlot";
import hero from "./hero.data";

describe("HeroSlot", () => {
  it("renders region container with data-region=hero", () => {
    const { container } = render(<HeroSlot />);
    const region = container.querySelector('[data-region="hero"]');
    expect(region).not.toBeNull();
    expect(region?.tagName).toBe("SECTION");
  });

  it("renders exactly one h1 with non-empty text", () => {
    const { container } = render(<HeroSlot />);
    const h1s = container.querySelectorAll(
      'section[data-region="hero"] h1',
    );
    expect(h1s.length).toBe(1);
    expect((h1s[0].textContent ?? "").trim().length).toBeGreaterThan(0);
  });

  it("renders search button with SVG icon", () => {
    const { container } = render(<HeroSlot />);
    const buttons = container.querySelectorAll(
      'section[data-region="hero"] button',
    );
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    // at least one button contains an SVG (lucide icon)
    const svgs = container.querySelectorAll(
      'section[data-region="hero"] button svg',
    );
    expect(svgs.length).toBeGreaterThanOrEqual(1);
    // SVG must have visible path/line elements (not empty)
    const searchSvg = svgs[0];
    expect(searchSvg.querySelectorAll("path, line, circle, polyline, rect").length).toBeGreaterThan(0);
  });

  it("hero data contains backgroundImage URL", () => {
    expect(hero.backgroundImage).toMatch(/^https?:\/\//);
  });

  it("hero data ctaHref is strictly #", () => {
    expect(hero.ctaHref).toBe("#");
  });

  it("hero data has all required string fields", () => {
    expect(typeof hero.title).toBe("string");
    expect(hero.title.trim().length).toBeGreaterThan(0);
    expect(typeof hero.ctaLabel).toBe("string");
    expect(hero.ctaLabel.trim().length).toBeGreaterThan(0);
    expect(typeof hero.ctaHref).toBe("string");
    expect(typeof hero.searchPlaceholder).toBe("string");
    expect(hero.searchPlaceholder.trim().length).toBeGreaterThan(0);
  });

  it("HeroSlot.tsx does not import fetch or lib/backend", () => {
    const src = readFileSync(
      join(__dirname, "HeroSlot.tsx"),
      "utf-8",
    );
    expect(src).not.toMatch(/fetchFromBackend|fetch\(|import.*lib\/backend/);
  });

  it("renders section with height >= 500px", () => {
    const { container } = render(<HeroSlot />);
    const region = container.querySelector('[data-region="hero"]');
    const className = region?.className ?? "";
    expect(className).toMatch(/h-\[\d+px\]/);
    // extract numeric height and verify >= 500
    const match = className.match(/h-\[(\d+)px\]/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(500);
  });

  it("renders full-width section with background image", () => {
    const { container } = render(<HeroSlot />);
    const region = container.querySelector('[data-region="hero"]');
    const className = region?.className ?? "";
    expect(className).toMatch(/bg-cover|bg-\[url/);
  });

  it("renders h1 with large display font size and non-empty text", () => {
    const { container } = render(<HeroSlot />);
    const h1 = container.querySelector('section[data-region="hero"] h1');
    expect(h1).not.toBeNull();
    const className = h1?.className ?? "";
    expect(className).toMatch(/text-5xl|text-6xl|text-7xl/);
    expect((h1?.textContent ?? "").trim().length).toBeGreaterThan(0);
  });

  it("renders search input with non-empty placeholder", () => {
    const { container } = render(<HeroSlot />);
    const input = container.querySelector(
      'section[data-region="hero"] input[type="text"]',
    );
    expect(input).not.toBeNull();
    expect(
      (input?.getAttribute("placeholder") ?? "").trim().length,
    ).toBeGreaterThan(0);
  });
});
