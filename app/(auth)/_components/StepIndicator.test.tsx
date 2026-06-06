import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StepIndicator from "./StepIndicator";

describe("StepIndicator", () => {
  it("renders Step 1 of 2 correctly", () => {
    render(<StepIndicator currentStep={1} totalSteps={2} />);
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
  });

  it("renders Step 2 of 2 correctly", () => {
    render(<StepIndicator currentStep={2} totalSteps={2} />);
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
  });

  it("marks completed steps as active", () => {
    render(<StepIndicator currentStep={2} totalSteps={2} />);
    const dots = screen.getAllByTestId(/^step-dot-/);
    expect(dots).toHaveLength(2);
    // Both should be active when on step 2
    expect(dots[0].className).toContain("bg-white");
    expect(dots[1].className).toContain("bg-white");
  });

  it("marks future steps as inactive", () => {
    render(<StepIndicator currentStep={1} totalSteps={2} />);
    const dots = screen.getAllByTestId(/^step-dot-/);
    expect(dots[1].className).toContain("bg-white/30");
  });
});
