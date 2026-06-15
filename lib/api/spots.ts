"use client";

import { type ApiResponse, parseResponse, networkError, serverError } from "@/lib/api/client";

export type SpotSortType = "latest" | "rating" | "viewCount" | "bookmarkCount";

export interface SpotListItem {
  id: string;
  name: string;
  name_zh: string;
  slug: string;
  cover_image: string;
  tags: string[];
  city_id: string;
  city_name: string;
  rating: string;
  view_count: number;
  bookmark_count: number;
}

export interface SpotListData {
  items: SpotListItem[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
  request_id: string;
}

export interface SpotListParams {
  page?: number;
  size?: number;
  citySlug?: string | null;
  sort?: SpotSortType;
}

export async function fetchSpots(
  params: SpotListParams = {}
): Promise<ApiResponse<SpotListData>> {
  const { page = 1, size = 12, citySlug, sort = "latest" } = params;

  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("size", String(size));
  searchParams.set("sort", sort);
  if (citySlug) {
    searchParams.set("city", citySlug);
  }

  try {
    const res = await fetch(`/api/spots?${searchParams.toString()}`);

    if (res.status >= 500) return serverError(res.status);

    const result = await parseResponse<SpotListData & { has_more?: boolean }>(res);

    if (result.status >= 200 && result.status < 300 && result.data) {
      const d = result.data;
      // Backend doesn't return has_more — compute from total/page/size
      if (typeof d.has_more !== "boolean") {
        d.has_more = page * size < d.total;
      }
      return { status: result.status, data: d as SpotListData };
    }

    return result as ApiResponse<SpotListData>;
  } catch {
    return networkError();
  }
}

// --- Spot ranking ---

export type RankingType = "heat" | "rating" | "bookmark";

export interface RankingData {
  type: string;
  items: SpotListItem[];
  request_id: string;
}

export async function fetchRanking(
  type: RankingType,
  top: number = 50
): Promise<ApiResponse<RankingData>> {
  const searchParams = new URLSearchParams();
  searchParams.set("type", type);
  searchParams.set("top", String(top));

  try {
    const res = await fetch(`/api/spots/ranking?${searchParams.toString()}`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<RankingData>(res);
  } catch {
    return networkError();
  }
}

// --- Spot posts (related posts for a spot) ---

export interface SpotPostItem {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  tags: string[];
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  comment_count: number;
  up_vote_count: number;
  bookmark_count: number;
  request_id: string;
}

export interface SpotPostsData {
  items: SpotPostItem[];
  total: number;
  page: number;
  size: number;
  request_id: string;
}

export async function fetchSpotPosts(
  spotId: string,
  params: { page?: number; size?: number } = {}
): Promise<ApiResponse<SpotPostsData>> {
  const { page = 1, size = 20 } = params;

  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("size", String(size));

  try {
    const res = await fetch(`/api/spots/${spotId}/posts?${searchParams.toString()}`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<SpotPostsData>(res);
  } catch {
    return networkError();
  }
}
