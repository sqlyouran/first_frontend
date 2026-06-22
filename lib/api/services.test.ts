import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWeather, fetchExchangeRate } from "./services";

const originalFetch = globalThis.fetch;

describe("fetchWeather", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetch(body: Record<string, unknown>, status = 200) {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(body), { status })
    );
  }

  it("returns weather data on success", async () => {
    mockFetch({
      request_id: "r1",
      city: "Beijing",
      temperature: 25.5,
      description: "clear sky",
      icon: "01d",
      humidity: 60,
      wind_speed: 3.5,
      updated_at: "2026-06-21T10:00:00Z",
    });

    const result = await fetchWeather("Beijing");
    expect(result.status).toBe(200);
    expect(result.data?.city).toBe("Beijing");
    expect(result.data?.temperature).toBe(25.5);
    expect(result.data?.wind_speed).toBe(3.5);
  });

  it("returns error on 404 city not found", async () => {
    mockFetch(
      { request_id: "r2", error_code: "city_not_found", message: "City not found" },
      404
    );

    const result = await fetchWeather("FakeCity");
    expect(result.status).toBe(404);
    expect(result.error?.error_code).toBe("city_not_found");
  });

  it("returns server error on 5xx", async () => {
    mockFetch({ message: "Internal error" }, 502);

    const result = await fetchWeather("Beijing");
    expect(result.status).toBe(502);
    expect(result.error?.error_code).toBe("server_error");
  });

  it("returns network error on fetch failure", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network down")
    );

    const result = await fetchWeather("Beijing");
    expect(result.status).toBe(0);
    expect(result.error?.error_code).toBe("network_error");
  });
});

describe("fetchExchangeRate", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetch(body: Record<string, unknown>, status = 200) {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(body), { status })
    );
  }

  it("returns rate data on success", async () => {
    mockFetch({
      request_id: "r1",
      base: "USD",
      rates: { CNY: "7.24", EUR: "0.92" },
      updated_at: "2026-06-21T10:00:00Z",
    });

    const result = await fetchExchangeRate("USD");
    expect(result.status).toBe(200);
    expect(result.data?.base).toBe("USD");
    expect(result.data?.rates.CNY).toBe("7.24");
  });

  it("returns error on invalid currency", async () => {
    mockFetch(
      { request_id: "r2", error_code: "invalid_currency", message: "Invalid currency code" },
      422
    );

    const result = await fetchExchangeRate("INVALID");
    expect(result.status).toBe(422);
    expect(result.error?.error_code).toBe("invalid_currency");
  });

  it("returns server error on 5xx", async () => {
    mockFetch({ message: "Internal error" }, 500);

    const result = await fetchExchangeRate("USD");
    expect(result.status).toBe(500);
    expect(result.error?.error_code).toBe("server_error");
  });

  it("returns network error on fetch failure", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network down")
    );

    const result = await fetchExchangeRate("USD");
    expect(result.status).toBe(0);
    expect(result.error?.error_code).toBe("network_error");
  });
});
