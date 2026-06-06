import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "@/lib/stores/auth";

// Mock auth API
vi.mock("@/lib/api/auth", () => ({
  refreshToken: vi.fn(),
  fetchMe: vi.fn().mockResolvedValue({ status: 200, data: { id: "1", email: "a@b.com", state: "active", created_at: "2024-01-01", request_id: "r1" } }),
  logout: vi.fn().mockResolvedValue({ status: 204 }),
}));

import { refreshToken } from "@/lib/api/auth";
const refreshTokenMock = vi.mocked(refreshToken);

// We need to import authFetch after mocks are set up
import { authFetch } from "@/lib/api/authFetch";

describe("authFetch", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: "initial-token", user: null, isAuthenticated: true, isInitialized: true });
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("attaches Authorization header from store", async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    await authFetch("/api/data");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/data",
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer initial-token");
  });

  it("returns response directly for non-401 status", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "hello" }), { status: 200 });
    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    const res = await authFetch("/api/data");

    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("refreshes token on 401 and retries request", async () => {
    const response401 = new Response("", { status: 401 });
    const response200 = new Response(JSON.stringify({ ok: true }), { status: 200 });

    vi.mocked(global.fetch)
      .mockResolvedValueOnce(response401)
      .mockResolvedValueOnce(response200);

    refreshTokenMock.mockResolvedValue({
      status: 200,
      data: { access_token: "new-token", expires_in: 1800, request_id: "r1" },
    });

    const res = await authFetch("/api/data");

    expect(res.status).toBe(200);
    expect(refreshTokenMock).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Verify retry used new token
    const retryArgs = vi.mocked(global.fetch).mock.calls[1];
    const retryHeaders = retryArgs[1]?.headers as Headers;
    expect(retryHeaders.get("Authorization")).toBe("Bearer new-token");

    // Store should be updated
    expect(useAuthStore.getState().accessToken).toBe("new-token");
  });

  it("returns original 401 response when refresh fails", async () => {
    const response401 = new Response("Unauthorized", { status: 401 });
    vi.mocked(global.fetch).mockResolvedValue(response401);

    refreshTokenMock.mockResolvedValue({
      status: 401,
      error: { request_id: "r1", error_code: "invalid_token", message: "Expired" },
    });

    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });

    const res = await authFetch("/api/data");

    expect(res.status).toBe(401);
    expect(refreshTokenMock).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(window.location.href).toBe("/login");

    // Restore
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("does not duplicate refresh calls for concurrent 401s", async () => {
    const response401 = new Response("", { status: 401 });
    const response200 = new Response(JSON.stringify({ ok: true }), { status: 200 });

    vi.mocked(global.fetch).mockImplementation(async (_url, options) => {
      const headers = options?.headers as Headers | undefined;
      const auth = headers?.get("Authorization");
      if (auth === "Bearer new-token") {
        return response200;
      }
      return response401;
    });

    refreshTokenMock.mockResolvedValue({
      status: 200,
      data: { access_token: "new-token", expires_in: 1800, request_id: "r1" },
    });

    // Fire two concurrent requests
    const [res1, res2] = await Promise.all([
      authFetch("/api/a"),
      authFetch("/api/b"),
    ]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    // Refresh should only be called once (lock prevents duplicate)
    expect(refreshTokenMock).toHaveBeenCalledTimes(1);
  });
});
