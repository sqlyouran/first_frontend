import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import HotSpotsSlot from "./HotSpotsSlot";
import items from "./hotSpots.data";

describe("HotSpotsSlot", () => {
  it('renders region container with data-region="hot-spots"', () => {
    const { container } = render(<HotSpotsSlot />);
    const region = container.querySelector('[data-region="hot-spots"]');
    expect(region).not.toBeNull();
    expect(region?.tagName).toBe("SECTION");
  });

  it("renders exactly 8 spot cards", () => {
    const { container } = render(<HotSpotsSlot />);
    const cards = container.querySelectorAll(
      '[data-region="hot-spots"] .overflow-x-auto > a',
    );
    expect(cards.length).toBe(8);
  });

  it("all card anchors have href === #", () => {
    const { container } = render(<HotSpotsSlot />);
    const cards = container.querySelectorAll(
      '[data-region="hot-spots"] .overflow-x-auto > a',
    );
    cards.forEach((a) => {
      expect(a.getAttribute("href")).toBe("#");
    });
  });

  it("each card has image container, heading, and tag badges", () => {
    const { container } = render(<HotSpotsSlot />);
    const cards = container.querySelectorAll(
      '[data-region="hot-spots"] .overflow-x-auto > a',
    );
    cards.forEach((a) => {
      // image container with aspect ratio and bg-cover
      const imgContainer = a.querySelector('[class*="aspect-"][class*="bg-cover"]');
      expect(imgContainer).not.toBeNull();
      expect(a.querySelector("h3")).not.toBeNull();
      // badge elements (at least 1 per card)
      expect(a.querySelectorAll("span").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("uses horizontal scroll on mobile with snap", () => {
    const { container } = render(<HotSpotsSlot />);
    const scrollContainer = container.querySelector(
      '[data-region="hot-spots"] .overflow-x-auto',
    );
    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer?.className ?? "").toMatch(/overflow-x-auto/);
    expect(scrollContainer?.className ?? "").toMatch(/snap-x/);
  });

  it("scroll container uses md:grid md:grid-cols-4 on desktop", () => {
    const { container } = render(<HotSpotsSlot />);
    const scrollContainer = container.querySelector(
      '[data-region="hot-spots"] .overflow-x-auto',
    );
    expect(scrollContainer?.className ?? "").toMatch(/md:grid/);
    expect(scrollContainer?.className ?? "").toMatch(/md:grid-cols-4/);
  });

  it("data file has 8 items with tags array", () => {
    expect(items.length).toBe(8);
    items.forEach((item: { name: string; tags: string[]; image: string; href: string }) => {
      expect(typeof item.name).toBe("string");
      expect(item.name.trim().length).toBeGreaterThan(0);
      expect(item.href).toBe("#");
      expect(Array.isArray(item.tags)).toBe(true);
      expect(item.tags.length).toBeGreaterThan(0);
      expect(item.image).toMatch(/^https?:\/\//);
    });
  });

  it("HotSpotsSlot.tsx does not import fetch or lib/backend", () => {
    const src = readFileSync(
      join(__dirname, "HotSpotsSlot.tsx"),
      "utf-8",
    );
    expect(src).not.toMatch(/fetchFromBackend|fetch\(|import.*lib\/backend/);
  });
});
