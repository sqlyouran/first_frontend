import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { readFileSync } from "fs";
import { join } from "path";

// Mock AuthProvider to pass-through children in SSR tests
vi.mock("@/components/AuthProvider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import RootLayout from "./layout";

describe("homepage shell - layout", () => {
  it("mounts ai-launcher slot after children", () => {
    const tree = RootLayout({
      children: <div data-testid="children-marker" /> as unknown as React.ReactNode,
    } as { children: React.ReactNode });
    const html = renderToString(tree as React.ReactElement);

    expect(html).toContain('data-testid="children-marker"');
    expect(html).toContain('data-region="ai-launcher"');

    const markerIdx = html.indexOf('data-testid="children-marker"');
    const launcherIdx = html.indexOf('data-region="ai-launcher"');
    expect(launcherIdx).toBeGreaterThan(markerIdx);

    // homepage-visual-v1: ai-launcher 容器内 2 个 button（Dialog trigger + Sheet trigger）
    const launcherFragment = html.slice(launcherIdx);
    const buttonOpenCount = (
      launcherFragment.match(/<button(?:\s|>)/g) ?? []
    ).length;
    expect(buttonOpenCount).toBe(2);
  });

  it("globals.css defines --color-brand: #1d4ed8", () => {
    const css = readFileSync(join(__dirname, "globals.css"), "utf-8");
    expect(css).toMatch(/--color-brand:\s*#1d4ed8/);
  });

  it("globals.css maps --primary to indigo oklch value", () => {
    const css = readFileSync(join(__dirname, "globals.css"), "utf-8");
    expect(css).toMatch(/--primary:[\s\S]*oklch\(0\.488 0\.243 264\.376\)/);
  });

  it("layout.tsx imports Inter and Plus_Jakarta_Sans fonts", () => {
    const src = readFileSync(join(__dirname, "layout.tsx"), "utf-8");
    expect(src).toMatch(/Inter/);
    expect(src).toMatch(/Plus_Jakarta_Sans/);
  });

  it("globals.css defines section[data-region] spacing: 64px mobile / 96px desktop", () => {
    const css = readFileSync(join(__dirname, "globals.css"), "utf-8");
    expect(css).toMatch(/section\[data-region\]/);
    expect(css).toMatch(/--spacing-section:\s*96px/);
    expect(css).toMatch(/--spacing-section-mobile:\s*64px/);
    expect(css).toMatch(/padding-block:\s*var\(--spacing-section-mobile\)/);
    expect(css).toMatch(/padding-block:\s*var\(--spacing-section\)/);
  });
});
