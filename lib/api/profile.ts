"use client";

import { type ApiResponse, parseResponse, networkError, serverError } from "@/lib/api/client";
import { authFetch } from "@/lib/api/authFetch";

// === Types ===

export interface ProfileData {
  id: string;
  username: string | null;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  interest_tags: string[] | null;
  email: string;
  created_at: string;
  request_id: string;
}

export interface UpdateProfileRequest {
  username?: string;
  nickname?: string;
  avatar_url?: string | null;
  bio?: string | null;
  interest_tags?: string[] | null;
}

export interface PublicProfileData {
  id: string;
  username: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  interest_tags: string[] | null;
  created_at: string;
  request_id: string;
}

export interface InterestTag {
  value: string;
  label: string;
  category: string;
}

export interface InterestTagsData {
  tags: InterestTag[];
  request_id: string;
}

// === API Functions ===

export async function fetchMyProfile(): Promise<ApiResponse<ProfileData>> {
  try {
    const res = await authFetch("/api/users/me/profile");

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<ProfileData>(res);
  } catch {
    return networkError();
  }
}

export async function updateProfile(
  payload: UpdateProfileRequest
): Promise<ApiResponse<ProfileData>> {
  try {
    const res = await authFetch("/api/users/me/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<ProfileData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchPublicProfile(
  username: string
): Promise<ApiResponse<PublicProfileData>> {
  try {
    const res = await fetch(`/api/users/${username}`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<PublicProfileData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchInterestTags(): Promise<ApiResponse<InterestTagsData>> {
  try {
    const res = await fetch("/api/users/interest-tags");

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<InterestTagsData>(res);
  } catch {
    return networkError();
  }
}
