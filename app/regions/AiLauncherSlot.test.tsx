import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import AiLauncherSlot from "./AiLauncherSlot";
import aiLauncher from "./aiLauncher.data";

describe("AiLauncherSlot", () => {
  it('renders div container with data-region="ai-launcher"', () => {
    const { container } = render(<AiLauncherSlot />);
    const region = container.querySelector('[data-region="ai-launcher"]');
    expect(region).not.toBeNull();
    expect(region!.tagName).toBe("DIV");
  });

  it("renders exactly one button with non-empty text", () => {
    const { container } = render(<AiLauncherSlot />);
    const buttons = container.querySelectorAll(
      '[data-region="ai-launcher"] button',
    );
    expect(buttons.length).toBe(1);
    expect((buttons[0].textContent ?? "").trim().length).toBeGreaterThan(0);
  });

  it("data file default-export is { buttonLabel: string }", () => {
    expect(typeof aiLauncher.buttonLabel).toBe("string");
    expect(aiLauncher.buttonLabel.length).toBeGreaterThan(0);
  });

  it('container does not carry aria-label="ai-launcher placeholder"', () => {
    const { container } = render(<AiLauncherSlot />);
    const region = container.querySelector('[data-region="ai-launcher"]');
    expect(region!.getAttribute("aria-label")).not.toBe(
      "ai-launcher placeholder",
    );
  });

  it("button has no onClick handler bound (placeholder semantics)", () => {
    const { container } = render(<AiLauncherSlot />);
    const button = container.querySelector(
      '[data-region="ai-launcher"] button',
    );
    expect(button).not.toBeNull();
    expect((button as HTMLButtonElement).onclick).toBeNull();
  });
});
