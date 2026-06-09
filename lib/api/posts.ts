"use client";

import { type ApiResponse, parseResponse, networkError, serverError } from "@/lib/api/client";
import { authFetch } from "@/lib/api/authFetch";

export interface PostData {
  id: string;
  title: string;
  content: string;
  cover_image: string | null;
  tags: string[];
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  request_id: string;
}

export interface PostListItem {
  id: string;
  title: string;
  cover_image: string | null;
  tags: string[];
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  request_id: string;
}

export interface PostListData {
  items: PostListItem[];
  total: number;
  page: number;
  size: number;
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

export async function fetchPosts(
  page: number = 1,
  size: number = 20
): Promise<ApiResponse<PostListData>> {
  try {
    const res = await fetch(`/api/posts?page=${page}&size=${size}`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<PostListData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchUserPosts(
  userId: string,
  page: number = 1,
  size: number = 20
): Promise<ApiResponse<PostListData>> {
  try {
    const res = await fetch(`/api/users/${userId}/posts?page=${page}&size=${size}`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<PostListData>(res);
  } catch {
    return networkError();
  }
}
