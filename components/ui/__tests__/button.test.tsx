import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

describe("shadcn + lucide + cn integration", () => {
  it("Button renders with shadcn token classes", () => {
    const { container } = render(<Button>x</Button>);
    const btn = container.querySelector("button");
    expect(btn).not.toBeNull();
    expect(btn!.className).toContain("inline-flex");
    expect(btn!.className).toContain("items-center");
  });

  it("Button outline variant adds border token", () => {
    const { container } = render(<Button variant="outline">x</Button>);
    const btn = container.querySelector("button");
    expect(btn!.className).toContain("border");
  });

  it("lucide Sparkles renders as accessible SVG", () => {
    render(<Sparkles data-testid="ic" className="h-4 w-4" />);
    const svg = screen.getByTestId("ic");
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("class")).toContain("h-4");
    expect(svg.getAttribute("class")).toContain("w-4");
  });

  it("cn merges classes and resolves tailwind conflicts", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
