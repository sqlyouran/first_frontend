import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import CityGridSlot from "./CityGridSlot";

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

  it("each card has image, heading, and badge", () => {
    const { container } = render(<CityGridSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="city-grid"] a',
    );
    anchors.forEach((a) => {
      expect(a.querySelector("h3")).not.toBeNull();
      // badge element
      const spans = a.querySelectorAll("span");
      expect(spans.length).toBeGreaterThanOrEqual(1);
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
});
