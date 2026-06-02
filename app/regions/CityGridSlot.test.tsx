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

  it("renders at least one anchor child with non-empty text", () => {
    const { container } = render(<CityGridSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="city-grid"] a',
    );
    expect(anchors.length).toBeGreaterThanOrEqual(1);
    anchors.forEach((a) => {
      expect((a.textContent ?? "").trim().length).toBeGreaterThan(0);
    });
  });

  it("every anchor href is exactly #", () => {
    const { container } = render(<CityGridSlot />);
    const anchors = container.querySelectorAll<HTMLAnchorElement>(
      'section[data-region="city-grid"] a',
    );
    expect(anchors.length).toBeGreaterThanOrEqual(1);
    anchors.forEach((a) => {
      expect(a.getAttribute("href")).toBe("#");
    });
  });
});
