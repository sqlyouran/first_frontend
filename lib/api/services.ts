"use client";

import { type ApiResponse, parseResponse, networkError, serverError } from "@/lib/api/client";

// --- Weather ---

export interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  updated_at: string;
  request_id: string;
}

export async function fetchWeather(
  city: string
): Promise<ApiResponse<WeatherData>> {
  try {
    const res = await fetch(
      `/api/services/weather?city=${encodeURIComponent(city)}`
    );

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<WeatherData>(res);
  } catch {
    return networkError();
  }
}

// --- Exchange Rate ---

export interface ExchangeRateData {
  base: string;
  rates: Record<string, string>;
  updated_at: string;
  request_id: string;
}

export async function fetchExchangeRate(
  base: string = "USD"
): Promise<ApiResponse<ExchangeRateData>> {
  try {
    const res = await fetch(
      `/api/services/exchange-rate?base=${encodeURIComponent(base)}`
    );

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<ExchangeRateData>(res);
  } catch {
    return networkError();
  }
}
