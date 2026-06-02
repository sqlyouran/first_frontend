import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import HeroSlot from "./HeroSlot";

describe("HeroSlot", () => {
  it("renders region container with data-region=hero", () => {
    const { container } = render(<HeroSlot />);
    const region = container.querySelector('[data-region="hero"]');
    expect(region).not.toBeNull();
    expect(region?.tagName).toBe("SECTION");
  });

  it("renders exactly one h1 with non-empty text", () => {
    const { container } = render(<HeroSlot />);
    const h1s = container.querySelectorAll(
      'section[data-region="hero"] h1',
    );
    expect(h1s.length).toBe(1);
    expect((h1s[0].textContent ?? "").trim().length).toBeGreaterThan(0);
  });

  it("renders exactly one button with non-empty text", () => {
    const { container } = render(<HeroSlot />);
    const buttons = container.querySelectorAll(
      'section[data-region="hero"] button',
    );
    expect(buttons.length).toBe(1);
    expect((buttons[0].textContent ?? "").trim().length).toBeGreaterThan(0);
  });
});
