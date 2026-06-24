import { describe, it, expect } from "vitest";
import { render, within } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import CityGridSlot from "./CityGridSlot";
import items from "./cityGrid.data";

describe("CityGridSlot", () => {
  it("renders region container with data-region=city-grid", () => {
    const { container } = render(<CityGridSlot />);
    const region = container.querySelector('[data-region="city-grid"]');
    expect(region).not.toBeNull();
    expect(region?.tagName).toBe("SECTION");
  });

  it("renders exactly 8 city cards", () => {
    const { container } = render(<CityGridSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="city-grid"] a',
    );
    expect(anchors.length).toBe(8);
  });

  it("all anchors have href starting with /spots?city=", () => {
    const { container } = render(<CityGridSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="city-grid"] a',
    );
    anchors.forEach((a) => {
      expect(a.getAttribute("href")).toMatch(/^\/spots\?city=/);
    });
  });

  it("each card has image container with overlay badge and heading", () => {
    const { container } = render(<CityGridSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="city-grid"] a',
    );
    anchors.forEach((a) => {
      // image container with aspect ratio and bg-cover
      const imgContainer = a.querySelector('[class*="aspect-"][class*="bg-cover"]');
      expect(imgContainer).not.toBeNull();
      // bestSeason badge is INSIDE the image container (overlay)
      const badge = imgContainer!.querySelector("span");
      expect(badge).not.toBeNull();
      expect(a.querySelector("h3")).not.toBeNull();
    });
  });

  it("uses responsive grid (2 cols mobile, 4 cols desktop)", () => {
    const { container } = render(<CityGridSlot />);
    const grid = container.querySelector(
      'section[data-region="city-grid"] .grid',
    );
    expect(grid?.className ?? "").toMatch(/grid-cols-2/);
    expect(grid?.className ?? "").toMatch(/md:grid-cols-4/);
  });

  it("data file has 8 items with bestSeason and image URL", () => {
    expect(items.length).toBe(8);
    const validSeasons = ["Spring", "Summer", "Autumn", "Winter"];
    items.forEach((item: { label: string; bestSeason: string; image: string; href: string }) => {
      expect(typeof item.label).toBe("string");
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.href).toMatch(/^\/spots\?city=/);
      expect(validSeasons).toContain(item.bestSeason);
      expect(item.image).toMatch(/^https:\/\/picsum\.photos\//);
    });
  });

  it("section has background gradient class", () => {
    const { container } = render(<CityGridSlot />);
    const region = container.querySelector('[data-region="city-grid"]');
    const className = region?.className ?? "";
    expect(className).toContain("from-slate-50");
    expect(className).toContain("to-white");
  });

  it("CityGridSlot.tsx does not import fetch or lib/backend", () => {
    const src = readFileSync(
      join(__dirname, "CityGridSlot.tsx"),
      "utf-8",
    );
    expect(src).not.toMatch(/fetchFromBackend|fetch\(|import.*lib\/backend/);
  });
});
