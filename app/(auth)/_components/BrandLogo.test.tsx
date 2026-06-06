import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BrandLogo from "./BrandLogo";

describe("BrandLogo", () => {
  it("renders the brand name", () => {
    render(<BrandLogo />);
    expect(screen.getByText("Wanderchina")).toBeInTheDocument();
  });

  it("renders a compass icon", () => {
    render(<BrandLogo />);
    expect(screen.getByTestId("brand-logo-icon")).toBeInTheDocument();
  });

  it("uses heading font family", () => {
    render(<BrandLogo />);
    const text = screen.getByText("Wanderchina");
    expect(text.className).toContain("font-heading");
  });
});
