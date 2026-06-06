import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { ReactElement } from "react";

// Mock AuthProvider to pass-through children in SSR tests
vi.mock("@/components/AuthProvider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import Page from "./page";
import RootLayout from "./layout";

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

describe("homepage shell - SSR integration proxy", () => {
  it("full page SSR renders 6 data-region elements without backend", () => {
    // Proxy for spec scenario: 后端未启动时首页仍可访问 (HTTP 200 + 6 regions)
    const tree = RootLayout({
      children: <PageAny />,
    } as { children: React.ReactNode });
    const html = renderToString(tree as React.ReactElement);

    const regionMatches = html.match(/data-region="[^"]+"/g) ?? [];
    expect(regionMatches.length).toBe(6);
  });

  it("SSR output contains ai-launcher after 5 page regions", () => {
    // Proxy for spec scenario: 跨 SSR 链路 ai-launcher 槽位存在
    const tree = RootLayout({
      children: <PageAny />,
    } as { children: React.ReactNode });
    const html = renderToString(tree as React.ReactElement);

    const lastPageRegionIdx = html.indexOf('data-region="hot-spots"');
    const aiLauncherIdx = html.indexOf('data-region="ai-launcher"');
    expect(lastPageRegionIdx).toBeGreaterThan(-1);
    expect(aiLauncherIdx).toBeGreaterThan(lastPageRegionIdx);
  });

  it("SSR ai-launcher contains at least 1 button", () => {
    const tree = RootLayout({
      children: <PageAny />,
    } as { children: React.ReactNode });
    const html = renderToString(tree as React.ReactElement);

    const aiLauncherStart = html.indexOf('data-region="ai-launcher"');
    const fragment = html.slice(aiLauncherStart);
    const buttonCount = (fragment.match(/<button(?:\s|>)/g) ?? []).length;
    expect(buttonCount).toBeGreaterThanOrEqual(1);
  });
});
