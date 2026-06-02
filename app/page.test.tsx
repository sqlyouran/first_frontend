import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import Page from "./page";

const PageAny = Page as unknown as () => ReactElement;

describe("homepage shell - page", () => {
  it("renders 5 regions in document order", () => {
    const { container } = render(<PageAny />);
    const regions = container.querySelectorAll("[data-region]");
    const names = Array.from(regions).map((r) => r.getAttribute("data-region"));
    expect(names).toEqual([
      "hero",
      "feature-nav",
      "city-grid",
      "hot-posts",
      "hot-spots",
    ]);
  });

  it("does not render ai-launcher in page", () => {
    const { container } = render(<PageAny />);
    expect(container.querySelector('[data-region="ai-launcher"]')).toBeNull();
  });
});
