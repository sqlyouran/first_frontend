import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WeatherPopover from "./WeatherPopover";
import type { WeatherData } from "@/lib/api/services";

vi.mock("@/lib/api/services", () => ({
  fetchWeather: vi.fn(),
}));

import { fetchWeather } from "@/lib/api/services";

const mockFetchWeather = vi.mocked(fetchWeather);

const sampleWeather: WeatherData = {
  request_id: "r1",
  city: "Beijing",
  temperature: 25.5,
  description: "clear sky",
  icon: "01d",
  humidity: 60,
  wind_speed: 3.5,
  updated_at: new Date().toISOString(),
};

describe("WeatherPopover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchWeather.mockResolvedValue({ status: 200, data: sampleWeather });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function openWeather() {
    const buttons = screen.getAllByRole("button", { name: /weather/i });
    fireEvent.click(buttons[0]);
  }

  it("renders weather icon button", () => {
    render(<WeatherPopover />);
    const buttons = screen.getAllByRole("button", { name: /weather/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("fetches Beijing weather when opened", async () => {
    render(<WeatherPopover />);
    openWeather();

    await waitFor(() => {
      expect(mockFetchWeather).toHaveBeenCalledWith("Beijing");
    });
  });

  it("displays weather data after loading", async () => {
    render(<WeatherPopover />);
    openWeather();

    await waitFor(() => {
      expect(screen.getAllByText("Beijing").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("25.5°C").length).toBeGreaterThan(0);
    expect(screen.getAllByText("clear sky").length).toBeGreaterThan(0);
  });

  it("shows loading skeleton while fetching", async () => {
    mockFetchWeather.mockReturnValue(new Promise(() => {})); // never resolves
    render(<WeatherPopover />);
    openWeather();

    expect(screen.getAllByTestId("weather-loading").length).toBeGreaterThan(0);
  });

  it("shows error state with retry on API failure", async () => {
    mockFetchWeather.mockResolvedValue({
      status: 502,
      error: { request_id: "r1", error_code: "weather_service_unavailable", message: "Service down" },
    });

    render(<WeatherPopover />);
    openWeather();

    await waitFor(() => {
      expect(screen.getAllByText(/service down/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByRole("button", { name: /retry/i }).length).toBeGreaterThan(0);
  });

  it("allows searching for a different city", async () => {
    render(<WeatherPopover />);
    openWeather();

    await waitFor(() => {
      expect(screen.getAllByText("Beijing").length).toBeGreaterThan(0);
    });

    const inputs = screen.getAllByPlaceholderText(/search city/i);
    fireEvent.change(inputs[0], { target: { value: "Shanghai" } });
    fireEvent.keyDown(inputs[0], { key: "Enter" });

    await waitFor(() => {
      expect(mockFetchWeather).toHaveBeenCalledWith("Shanghai");
    });
  });
});
