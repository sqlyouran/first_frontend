"use client";

import { useAuthStore } from "@/lib/stores/auth";
import { refreshToken } from "@/lib/api/auth";

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const res = await refreshToken();
  if (res.status === 200 && res.data?.access_token) {
    const newToken = res.data.access_token;
    useAuthStore.getState().setToken(newToken);
    return newToken;
  }
  // refresh failed
  useAuthStore.getState().clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
  return null;
}

/**
 * Fetch wrapper that auto-attaches Authorization header
 * and transparently refreshes on 401.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status !== 401) {
    return res;
  }

  // 401 → try refresh (with lock to prevent concurrent refreshes)
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  const newToken = await refreshPromise;
  if (!newToken) {
    return res; // refresh failed, return original 401
  }

  // Retry with new token
  const retryHeaders = new Headers(options.headers);
  retryHeaders.set("Authorization", `Bearer ${newToken}`);
  return fetch(url, { ...options, headers: retryHeaders });
}
