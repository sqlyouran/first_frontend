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
  });
});
