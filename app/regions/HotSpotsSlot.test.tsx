import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import HotSpotsSlot from "./HotSpotsSlot";
import items from "./hotSpots.data";

describe("HotSpotsSlot", () => {
  it('renders region container with data-region="hot-spots"', () => {
    const { container } = render(<HotSpotsSlot />);
    const region = container.querySelector('[data-region="hot-spots"]');
    expect(region).not.toBeNull();
  });

  it("renders exactly 8 spot cards", () => {
    const { container } = render(<HotSpotsSlot />);
    const cards = container.querySelectorAll(
      '[data-region="hot-spots"] .overflow-x-auto > a',
    );
    expect(cards.length).toBe(8);
  });

  it("each card has heading and tag badges", () => {
    const { container } = render(<HotSpotsSlot />);
    const cards = container.querySelectorAll(
      '[data-region="hot-spots"] .overflow-x-auto > a',
    );
    cards.forEach((a) => {
      expect(a.querySelector("h3")).not.toBeNull();
      // badge elements (at least 1 per card)
      expect(a.querySelectorAll("span").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("uses horizontal scroll on mobile", () => {
    const { container } = render(<HotSpotsSlot />);
    const scrollContainer = container.querySelector(
      '[data-region="hot-spots"] .overflow-x-auto',
    );
    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer?.className ?? "").toMatch(/overflow-x-auto/);
  });

  it("data file has 8 items with tags array", () => {
    expect(items.length).toBe(8);
    items.forEach((item: { name: string; tags: string[]; image: string }) => {
      expect(Array.isArray(item.tags)).toBe(true);
      expect(item.tags.length).toBeGreaterThan(0);
      expect(item.image).toMatch(/^https?:\/\//);
    });
  });
});
