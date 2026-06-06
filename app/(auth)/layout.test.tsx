import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthLayout from "./layout";

describe("AuthLayout", () => {
  it("renders the AuthPanel", () => {
    render(<AuthLayout><div>child content</div></AuthLayout>);
    const panels = screen.getAllByTestId("auth-panel");
    expect(panels.length).toBeGreaterThan(0);
  });

  it("renders children", () => {
    render(<AuthLayout><div>child content</div></AuthLayout>);
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("renders brand tagline in panel", () => {
    render(<AuthLayout><div>test</div></AuthLayout>);
    const taglines = screen.getAllByText("Discover the China beyond postcards.");
    expect(taglines.length).toBeGreaterThan(0);
  });
});
