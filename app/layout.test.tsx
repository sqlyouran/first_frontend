import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
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

    // homepage-ai-launcher: ai-launcher 容器内必须包含恰好 1 个 button + 非空文本
    const launcherFragment = html.slice(launcherIdx);
    const buttonOpenCount = (
      launcherFragment.match(/<button(?:\s|>)/g) ?? []
    ).length;
    expect(buttonOpenCount).toBe(1);
  });
});
