"use client";

import { type ApiResponse, parseResponse, networkError, serverError } from "@/lib/api/client";
import { authFetch } from "@/lib/api/authFetch";

export type PostSortType = "latest" | "most_upvoted" | "most_commented";

export interface PostData {
  id: string;
  title: string;
  slug: string;
  content: string;
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

export interface PostListItem {
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

export interface PostListData {
  items: PostListItem[];
  total: number;
  page: number | null;
  size: number;
  next_cursor: string | null;
  has_more: boolean;
  request_id: string;
}

interface CreatePostPayload {
  title: string;
  content: string;
  cover_image?: string | null;
  tags?: string[];
  status?: string;
}

export async function createPost(payload: CreatePostPayload): Promise<ApiResponse<PostData>> {
  try {
    const res = await authFetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<PostData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchPost(id: string): Promise<ApiResponse<PostData>> {
  try {
    const res = await fetch(`/api/posts/${id}`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<PostData>(res);
  } catch {
    return networkError();
  }
}

export interface PostListParams {
  page?: number;
  size?: number;
  sort?: PostSortType;
  cursor?: string;
}

export async function fetchPosts(
  params: PostListParams = {}
): Promise<ApiResponse<PostListData>> {
  const { page = 1, size = 20, sort = "latest", cursor } = params;
  const searchParams = new URLSearchParams();
  searchParams.set("size", String(size));
  searchParams.set("sort", sort);
  if (cursor) {
    searchParams.set("cursor", cursor);
  } else {
    searchParams.set("page", String(page));
  }
  try {
    const res = await fetch(`/api/posts?${searchParams.toString()}`);
    if (res.status >= 500) return serverError(res.status);
    return parseResponse<PostListData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchUserPosts(
  userId: string,
  params: PostListParams = {}
): Promise<ApiResponse<PostListData>> {
  const { page = 1, size = 20, sort = "latest", cursor } = params;
  const searchParams = new URLSearchParams();
  searchParams.set("size", String(size));
  searchParams.set("sort", sort);
  if (cursor) {
    searchParams.set("cursor", cursor);
  } else {
    searchParams.set("page", String(page));
  }
  try {
    const res = await fetch(`/api/users/${userId}/posts?${searchParams.toString()}`);
    if (res.status >= 500) return serverError(res.status);
    return parseResponse<PostListData>(res);
  } catch {
    return networkError();
  }
}
