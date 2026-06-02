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

  it("renders at least one anchor child", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="feature-nav"] a',
    );
    expect(anchors.length).toBeGreaterThanOrEqual(1);
  });

  it("every anchor has non-empty textContent", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="feature-nav"] a',
    );
    anchors.forEach((a) => {
      expect((a.textContent ?? "").trim().length).toBeGreaterThan(0);
    });
  });

  it("every anchor href is exactly #", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll<HTMLAnchorElement>(
      'section[data-region="feature-nav"] a',
    );
    expect(anchors.length).toBeGreaterThanOrEqual(1);
    anchors.forEach((a) => {
      expect(a.getAttribute("href")).toBe("#");
    });
  });
});
