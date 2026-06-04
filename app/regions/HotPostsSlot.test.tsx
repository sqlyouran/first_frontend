import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import HotPostsSlot from "./HotPostsSlot";
import items from "./hotPosts.data";

describe("HotPostsSlot", () => {
  it('renders region container with data-region="hot-posts"', () => {
    const { container } = render(<HotPostsSlot />);
    const region = container.querySelector('[data-region="hot-posts"]');
    expect(region).not.toBeNull();
    expect(region?.tagName).toBe("SECTION");
  });

  it("renders exactly 3 story cards", () => {
    const { container } = render(<HotPostsSlot />);
    const anchors = container.querySelectorAll(
      '[data-region="hot-posts"] a',
    );
    expect(anchors.length).toBe(3);
  });

  it("all anchors have href === #", () => {
    const { container } = render(<HotPostsSlot />);
    const anchors = container.querySelectorAll(
      '[data-region="hot-posts"] a',
    );
    anchors.forEach((a) => {
      expect(a.getAttribute("href")).toBe("#");
    });
  });

  it("each card has heading and image container", () => {
    const { container } = render(<HotPostsSlot />);
    const anchors = container.querySelectorAll(
      '[data-region="hot-posts"] a',
    );
    anchors.forEach((a) => {
      expect(a.querySelector("h3")).not.toBeNull();
      const imgContainer = a.querySelector('[class*="bg-cover"]');
      expect(imgContainer).not.toBeNull();
    });
  });

  it("uses storytelling grid layout (3 cols desktop)", () => {
    const { container } = render(<HotPostsSlot />);
    const grid = container.querySelector(
      '[data-region="hot-posts"] .grid',
    );
    expect(grid?.className ?? "").toMatch(/grid-cols/);
    expect(grid?.className ?? "").toMatch(/md:grid-cols-3/);
  });

  it("featured card spans 2 cols on desktop", () => {
    const { container } = render(<HotPostsSlot />);
    const firstAnchor = container.querySelector(
      '[data-region="hot-posts"] > div > .grid > a',
    );
    expect(firstAnchor?.className ?? "").toMatch(/md:col-span-2/);
  });

  it("data file has 6 items with title and image", () => {
    expect(items.length).toBe(6);
    items.forEach((item: { title: string; image: string; href: string }) => {
      expect(typeof item.title).toBe("string");
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.href).toBe("#");
      expect(item.image).toMatch(/^https:\/\/picsum\.photos\//);
    });
  });

  it("HotPostsSlot.tsx does not import fetch or lib/backend", () => {
    const src = readFileSync(
      join(__dirname, "HotPostsSlot.tsx"),
      "utf-8",
    );
    expect(src).not.toMatch(/fetchFromBackend|fetch\(|import.*lib\/backend/);
  });
});
