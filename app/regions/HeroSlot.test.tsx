import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import HeroSlot from "./HeroSlot";

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

  it("renders search button with icon", () => {
    const { container } = render(<HeroSlot />);
    const buttons = container.querySelectorAll(
      'section[data-region="hero"] button',
    );
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    const svg = container.querySelector(
      'section[data-region="hero"] button svg',
    );
    expect(svg).not.toBeNull();
  });

  it("hero data contains backgroundImage URL", async () => {
    const hero = await import("./hero.data").then((m) => m.default);
    expect(hero.backgroundImage).toMatch(/^https?:\/\//);
  });

  it("renders full-width section with background image", () => {
    const { container } = render(<HeroSlot />);
    const region = container.querySelector('[data-region="hero"]');
    const className = region?.className ?? "";
    expect(className).toMatch(/bg-cover|bg-\[url/);
  });

  it("renders h1 with large display font size", () => {
    const { container } = render(<HeroSlot />);
    const h1 = container.querySelector('section[data-region="hero"] h1');
    const className = h1?.className ?? "";
    expect(className).toMatch(/text-5xl|text-6xl|text-7xl/);
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
