"use client";

import { type ApiResponse, parseResponse, networkError, serverError } from "@/lib/api/client";

export interface CityItem {
  id: string;
  name: string;
  name_zh: string;
  slug: string;
}

export interface CityListData {
  items: CityItem[];
  total: number;
  page: number;
  size: number;
  request_id: string;
}

export async function fetchCities(): Promise<ApiResponse<CityListData>> {
  try {
    const res = await fetch("/api/cities?size=100");

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<CityListData>(res);
  } catch {
    return networkError();
  }
}
