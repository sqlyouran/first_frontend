"use client";

export interface ApiError {
  request_id: string;
  error_code: string;
  message: string;
  details?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  status: number;
  data?: T;
  error?: ApiError;
}

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

interface MeData {
  id: string;
  email: string;
  state: string;
  created_at: string;
  request_id: string;
}

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const status = res.status;

  if (status === 204) {
    return { status };
  }

  try {
    const body = await res.json();

    if (status >= 200 && status < 300) {
      return { status, data: body as T };
    }

    return {
      status,
      error: {
        request_id: body.request_id ?? "unknown",
        error_code: body.error_code ?? "unknown_error",
        message: body.message ?? "",
        details: body.details,
      },
    };
  } catch {
    return {
      status,
      error: {
        request_id: "unknown",
        error_code: status >= 500 ? "server_error" : "unknown_error",
        message: "Unexpected response format",
      },
    };
  }
}

function networkError(): ApiResponse<never> {
  return {
    status: 0,
    error: {
      request_id: "unknown",
      error_code: "network_error",
      message: "Network connection failed",
    },
  };
}

function serverError(status: number): ApiResponse<never> {
  return {
    status,
    error: {
      request_id: "unknown",
      error_code: "server_error",
      message: "Service temporarily unavailable",
    },
  };
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
