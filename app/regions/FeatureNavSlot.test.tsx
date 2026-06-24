import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import FeatureNavSlot from "./FeatureNavSlot";
import featureNavItems from "./featureNav.data";

describe("FeatureNavSlot", () => {
  it("renders region container with data-region=feature-nav", () => {
    const { container } = render(<FeatureNavSlot />);
    const region = container.querySelector('[data-region="feature-nav"]');
    expect(region).not.toBeNull();
    expect(region?.tagName).toBe("SECTION");
  });

  it("renders exactly 4 feature chips with correct labels", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="feature-nav"] a',
    );
    expect(anchors.length).toBe(4);
    const labels = Array.from(anchors).map((a) => {
      const span = a.querySelector("span");
      return (span?.textContent ?? "").trim();
    });
    expect(labels).toEqual(["Cities", "Stories", "Hidden Spots", "Plan with AI"]);
  });

  it("all anchors have href === #", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="feature-nav"] a',
    );
    anchors.forEach((a) => {
      expect(a.getAttribute("href")).toBe("#");
    });
  });

  it("each chip contains an SVG icon with path elements", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="feature-nav"] a',
    );
    anchors.forEach((a) => {
      const svg = a.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll("path, line, circle, polyline, rect").length).toBeGreaterThan(0);
    });
  });

  it("each chip has hover effect class", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="feature-nav"] a',
    );
    anchors.forEach((a) => {
      expect(a.className).toMatch(/hover:/);
    });
  });

  it("uses responsive grid layout", () => {
    const { container } = render(<FeatureNavSlot />);
    const region = container.querySelector('[data-region="feature-nav"]');
    const grid = region?.querySelector(".grid");
    expect(grid?.className ?? "").toMatch(/grid-cols-2/);
    expect(grid?.className ?? "").toMatch(/md:grid-cols-4/);
  });

  it("data file has 4 items with label, href, and icon fields", () => {
    expect(featureNavItems.length).toBe(4);
    const validIcons = ["MapPin", "BookOpen", "Compass", "Sparkles"];
    featureNavItems.forEach((item: { label: string; href: string; icon: string }) => {
      expect(typeof item.label).toBe("string");
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.href).toBe("#");
      expect(validIcons).toContain(item.icon);
    });
  });

  it("each chip shows description text", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="feature-nav"] a',
    );
    const descriptions = featureNavItems.map((item) => item.description);
    descriptions.forEach((desc) => {
      expect(container.textContent).toContain(desc);
    });
  });

  it("each chip has border-l-4 class for hover feedback", () => {
    const { container } = render(<FeatureNavSlot />);
    const anchors = container.querySelectorAll(
      'section[data-region="feature-nav"] a',
    );
    anchors.forEach((a) => {
      expect(a.className).toContain("border-l-4");
    });
  });

  it("FeatureNavSlot.tsx does not import fetch or lib/backend", () => {
    const src = readFileSync(
      join(__dirname, "FeatureNavSlot.tsx"),
      "utf-8",
    );
    expect(src).not.toMatch(/fetchFromBackend|fetch\(|import.*lib\/backend/);
  });
});
