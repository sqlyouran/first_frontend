import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import userEvent from "@testing-library/user-event";
import AiLauncherSlot from "./AiLauncherSlot";
import aiLauncher from "./aiLauncher.data";

describe("AiLauncherSlot", () => {
  it('renders div container with data-region="ai-launcher"', () => {
    const { container } = render(<AiLauncherSlot />);
    const region = container.querySelector('[data-region="ai-launcher"]');
    expect(region).not.toBeNull();
    expect(region!.tagName).toBe("DIV");
  });

  it("renders floating button with Plan with AI text and fixed positioning", () => {
    const { container } = render(<AiLauncherSlot />);
    const buttons = container.querySelectorAll(
      '[data-region="ai-launcher"] button',
    );
    const planButton = Array.from(buttons).find((b) =>
      (b.textContent ?? "").includes("Plan with AI"),
    );
    expect(planButton).toBeDefined();
    // check fixed positioning class
    expect(planButton!.className).toMatch(/fixed/);
    expect(planButton!.className).toMatch(/bottom-6/);
    expect(planButton!.className).toMatch(/right-6/);
  });

  it("floating button contains Sparkles SVG icon", () => {
    const { container } = render(<AiLauncherSlot />);
    const buttons = container.querySelectorAll(
      '[data-region="ai-launcher"] button',
    );
    const planButton = Array.from(buttons).find((b) =>
      (b.textContent ?? "").includes("Plan with AI"),
    );
    const svg = planButton?.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.querySelectorAll("path, line, circle, polyline, rect").length).toBeGreaterThan(0);
  });

  it("button opens dialog on click", async () => {
    const user = userEvent.setup();
    const { container } = render(<AiLauncherSlot />);
    const button = container.querySelector(
      '[data-region="ai-launcher"] button',
    );
    expect(button).not.toBeNull();
    await user.click(button!);
    // After click, dialog content should be visible
    const dialogContent = document.querySelector('[data-slot="dialog-content"]');
    expect(dialogContent).not.toBeNull();
  });

  it("renders desktop and mobile triggers with CSS media query switching", () => {
    const { container } = render(<AiLauncherSlot />);
    // Desktop trigger container: hidden md:block
    const desktopDiv = container.querySelector(
      '[data-region="ai-launcher"] .hidden.md\\:block',
    );
    expect(desktopDiv).not.toBeNull();
    // Mobile trigger container: md:hidden
    const mobileDiv = container.querySelector(
      '[data-region="ai-launcher"] .md\\:hidden',
    );
    expect(mobileDiv).not.toBeNull();
  });

  it("data file default-export is { buttonLabel: string }", () => {
    expect(typeof aiLauncher.buttonLabel).toBe("string");
    expect(aiLauncher.buttonLabel.length).toBeGreaterThan(0);
  });

  it("AiLauncherSlot.tsx does not import fetch or lib/backend", () => {
    const src = readFileSync(
      join(__dirname, "AiLauncherSlot.tsx"),
      "utf-8",
    );
    expect(src).not.toMatch(/fetchFromBackend|fetch\(|import.*lib\/backend/);
  });

  it('container does not carry aria-label="ai-launcher placeholder"', () => {
    const { container } = render(<AiLauncherSlot />);
    const region = container.querySelector('[data-region="ai-launcher"]');
    expect(region!.getAttribute("aria-label")).not.toBe(
      "ai-launcher placeholder",
    );
  });
});
