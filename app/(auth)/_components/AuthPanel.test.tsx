import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthPanel from "./AuthPanel";

describe("AuthPanel", () => {
  it("renders the brand tagline", () => {
    render(<AuthPanel />);
    expect(
      screen.getByText("Discover the China beyond postcards.")
    ).toBeInTheDocument();
  });

  it("renders the BrandLogo", () => {
    render(<AuthPanel />);
    expect(screen.getByText("Wanderchina")).toBeInTheDocument();
  });

  it("has the atmosphere gradient background", () => {
    render(<AuthPanel />);
    const panel = screen.getByTestId("auth-panel");
    expect(panel.className).toContain("from-slate-900");
  });
});
