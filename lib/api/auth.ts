"use client";

import {
  type ApiResponse,
  parseResponse,
  networkError,
  serverError,
} from "@/lib/api/client";

interface LoginData {
  access_token: string;
  expires_in: number;
  request_id: string;
}

interface RefreshData {
  access_token: string;
  expires_in: number;
  request_id: string;
}

export interface MeData {
  id: string;
  email: string;
  state: string;
  created_at: string;
  nickname: string | null;
  avatar_url: string | null;
  username: string | null;
  request_id: string;
}

export async function login(email: string, password: string): Promise<ApiResponse<LoginData>> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<LoginData>(res);
  } catch {
    return networkError();
  }
}

export async function sendCode(email: string): Promise<ApiResponse> {
  try {
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse(res);
  } catch {
    return networkError();
  }
}

export async function register(email: string, code: string, password: string): Promise<ApiResponse> {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse(res);
  } catch {
    return networkError();
  }
}

export async function refreshToken(): Promise<ApiResponse<RefreshData>> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<RefreshData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchMe(accessToken: string): Promise<ApiResponse<MeData>> {
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<MeData>(res);
  } catch {
    return networkError();
  }
}

export async function logout(accessToken: string): Promise<ApiResponse> {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse(res);
  } catch {
    return networkError();
  }
}
