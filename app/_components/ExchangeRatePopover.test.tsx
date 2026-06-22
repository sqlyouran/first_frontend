import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExchangeRatePopover from "./ExchangeRatePopover";
import type { ExchangeRateData } from "@/lib/api/services";

vi.mock("@/lib/api/services", () => ({
  fetchExchangeRate: vi.fn(),
}));

import { fetchExchangeRate } from "@/lib/api/services";

const mockFetchExchangeRate = vi.mocked(fetchExchangeRate);

const sampleRates: ExchangeRateData = {
  request_id: "r1",
  base: "USD",
  rates: { CNY: "7.24", EUR: "0.92", GBP: "0.79", JPY: "157.50" },
  updated_at: new Date().toISOString(),
};

describe("ExchangeRatePopover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchExchangeRate.mockResolvedValue({ status: 200, data: sampleRates });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function openPopover() {
    const buttons = screen.getAllByRole("button", { name: /exchange/i });
    fireEvent.click(buttons[0]);
  }

  it("renders exchange rate icon button", () => {
    render(<ExchangeRatePopover />);
    const buttons = screen.getAllByRole("button", { name: /exchange/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("fetches USD rates when opened", async () => {
    render(<ExchangeRatePopover />);
    openPopover();

    await waitFor(() => {
      expect(mockFetchExchangeRate).toHaveBeenCalledWith("USD");
    });
  });

  it("displays USD to CNY rate after loading", async () => {
    render(<ExchangeRatePopover />);
    openPopover();

    await waitFor(() => {
      expect(screen.getAllByText(/USD/).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/7.24/).length).toBeGreaterThan(0);
  });

  it("shows loading skeleton while fetching", async () => {
    mockFetchExchangeRate.mockReturnValue(new Promise(() => {}));
    render(<ExchangeRatePopover />);
    openPopover();

    expect(screen.getAllByTestId("rate-loading").length).toBeGreaterThan(0);
  });

  it("shows error state with retry on API failure", async () => {
    mockFetchExchangeRate.mockResolvedValue({
      status: 502,
      error: { request_id: "r1", error_code: "exchange_rate_service_unavailable", message: "Service down" },
    });

    render(<ExchangeRatePopover />);
    openPopover();

    await waitFor(() => {
      expect(screen.getAllByText(/service down/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByRole("button", { name: /retry/i }).length).toBeGreaterThan(0);
  });

  it("converts amount to CNY", async () => {
    render(<ExchangeRatePopover />);
    openPopover();

    await waitFor(() => {
      expect(screen.getAllByText(/USD/).length).toBeGreaterThan(0);
    });

    const inputs = screen.getAllByPlaceholderText(/amount/i);
    fireEvent.change(inputs[0], { target: { value: "100" } });

    // 100 USD × 7.24 = 724 CNY
    await waitFor(() => {
      expect(screen.getAllByText(/724/).length).toBeGreaterThan(0);
    });
  });
});
