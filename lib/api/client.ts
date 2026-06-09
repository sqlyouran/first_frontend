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

export async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
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

export function networkError(): ApiResponse<never> {
  return {
    status: 0,
    error: {
      request_id: "unknown",
      error_code: "network_error",
      message: "Network connection failed",
    },
  };
}

export function serverError(status: number): ApiResponse<never> {
  return {
    status,
    error: {
      request_id: "unknown",
      error_code: "server_error",
      message: "Service temporarily unavailable",
    },
  };
}
