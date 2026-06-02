import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import FeatureNavSlot from "./FeatureNavSlot";

describe("FeatureNavSlot", () => {
  it("renders region container with data-region=feature-nav", () => {
    const { container } = render(<FeatureNavSlot />);
    const region = container.querySelector('[data-region="feature-nav"]');
    expect(region).not.toBeNull();
    expect(region?.tagName).toBe("SECTION");
  });

  it("renders exactly 4 feature chips", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="feature-nav"] a',
    );
    expect(anchors.length).toBe(4);
  });

  it("each chip contains an SVG icon", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="feature-nav"] a',
    );
    anchors.forEach((a) => {
      expect(a.querySelector("svg")).not.toBeNull();
    });
  });

  it("uses responsive grid layout", () => {
    const { container } = render(<FeatureNavSlot />);
    const region = container.querySelector('[data-region="feature-nav"]');
    const grid = region?.querySelector(".grid");
    expect(grid?.className ?? "").toMatch(/grid-cols-2/);
    expect(grid?.className ?? "").toMatch(/md:grid-cols-4/);
  });
});
