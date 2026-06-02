import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import HotPostsSlot from "./HotPostsSlot";
import items from "./hotPosts.data";

describe("HotPostsSlot", () => {
  it('renders region container with data-region="hot-posts"', () => {
    const { container } = render(<HotPostsSlot />);
    const region = container.querySelector('[data-region="hot-posts"]');
    expect(region).not.toBeNull();
  });

  it("renders at least one anchor with non-empty text", () => {
    const { container } = render(<HotPostsSlot />);
    const anchors = container.querySelectorAll(
      '[data-region="hot-posts"] a',
    );
    expect(anchors.length).toBeGreaterThan(0);
    anchors.forEach((a) => {
      expect((a.textContent ?? "").trim().length).toBeGreaterThan(0);
    });
  });

  it("data file default-export is an array of {label, href}", () => {
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    items.forEach((it) => {
      expect(typeof it.label).toBe("string");
      expect(typeof it.href).toBe("string");
    });
  });

  it("every anchor href is exactly #", () => {
    const { container } = render(<HotPostsSlot />);
    const anchors = container.querySelectorAll(
      '[data-region="hot-posts"] a',
    );
    expect(anchors.length).toBeGreaterThan(0);
    anchors.forEach((a) => {
      expect(a.getAttribute("href")).toBe("#");
    });
  });
});
