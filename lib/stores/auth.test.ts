import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "@/lib/stores/auth";

// Mock auth API
vi.mock("@/lib/api/auth", () => ({
  refreshToken: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(),
}));

import { refreshToken, fetchMe, logout } from "@/lib/api/auth";
const refreshTokenMock = vi.mocked(refreshToken);
const fetchMeMock = vi.mocked(fetchMe);
const logoutMock = vi.mocked(logout);

describe("useAuthStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false, isInitialized: false });
  });

  describe("setToken", () => {
    it("sets accessToken and isAuthenticated", () => {
      useAuthStore.getState().setToken("abc123");

      expect(useAuthStore.getState().accessToken).toBe("abc123");
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe("setUser", () => {
    it("sets user state", () => {
      const user = { id: "1", email: "a@b.com", state: "active", created_at: "2024-01-01", nickname: null, avatar_url: null, username: null };
      useAuthStore.getState().setUser(user);

      expect(useAuthStore.getState().user).toEqual(user);
    });
  });

  describe("clearAuth", () => {
    it("clears all auth state", () => {
      useAuthStore.setState({ accessToken: "token", user: { id: "1", email: "a@b.com", state: "active", created_at: "2024-01-01", nickname: null, avatar_url: null, username: null }, isAuthenticated: true });

      useAuthStore.getState().clearAuth();

      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("fetchMe", () => {
    it("fetches user data and sets user state with profile fields", async () => {
      useAuthStore.setState({ accessToken: "token", isAuthenticated: true });
      fetchMeMock.mockResolvedValue({
        status: 200,
        data: { id: "1", email: "test@a.com", state: "active", created_at: "2024-01-01", nickname: "Tester", avatar_url: "https://example.com/avatar.jpg", username: "tester01", request_id: "r1" },
      });

      await useAuthStore.getState().fetchMe();

      expect(fetchMeMock).toHaveBeenCalledWith("token");
      expect(useAuthStore.getState().user).toEqual({
        id: "1",
        email: "test@a.com",
        state: "active",
        created_at: "2024-01-01",
        nickname: "Tester",
        avatar_url: "https://example.com/avatar.jpg",
        username: "tester01",
      });
    });

    it("fetches user data with null profile fields", async () => {
      useAuthStore.setState({ accessToken: "token", isAuthenticated: true });
      fetchMeMock.mockResolvedValue({
        status: 200,
        data: { id: "1", email: "test@a.com", state: "active", created_at: "2024-01-01", nickname: null, avatar_url: null, username: null, request_id: "r1" },
      });

      await useAuthStore.getState().fetchMe();

      expect(useAuthStore.getState().user).toEqual({
        id: "1",
        email: "test@a.com",
        state: "active",
        created_at: "2024-01-01",
        nickname: null,
        avatar_url: null,
        username: null,
      });
    });

    it("does nothing when no accessToken", async () => {
      await useAuthStore.getState().fetchMe();

      expect(fetchMeMock).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("calls API and clears state", async () => {
      useAuthStore.setState({ accessToken: "token", user: { id: "1", email: "a@b.com", state: "active", created_at: "2024-01-01", nickname: null, avatar_url: null, username: null }, isAuthenticated: true });
      logoutMock.mockResolvedValue({ status: 204 });

      await useAuthStore.getState().logout();

      expect(logoutMock).toHaveBeenCalledWith("token");
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("clears state even without token", async () => {
      useAuthStore.setState({ accessToken: null, isAuthenticated: false });

      await useAuthStore.getState().logout();

      expect(logoutMock).not.toHaveBeenCalled();
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });

  describe("initialize", () => {
    it("refreshes token and fetches user on success", async () => {
      refreshTokenMock.mockResolvedValue({
        status: 200,
        data: { access_token: "fresh-token", expires_in: 1800, request_id: "r1" },
      });
      fetchMeMock.mockResolvedValue({
        status: 200,
        data: { id: "1", email: "user@a.com", state: "active", created_at: "2024-01-01", nickname: "User", avatar_url: null, username: "user01", request_id: "r1" },
      });

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().accessToken).toBe("fresh-token");
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual({
        id: "1",
        email: "user@a.com",
        state: "active",
        created_at: "2024-01-01",
        nickname: "User",
        avatar_url: null,
        username: "user01",
      });
      expect(useAuthStore.getState().isInitialized).toBe(true);
    });

    it("sets isInitialized even when refresh fails", async () => {
      refreshTokenMock.mockResolvedValue({
        status: 401,
        error: { request_id: "r1", error_code: "invalid_token", message: "expired" },
      });

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isInitialized).toBe(true);
    });

    it("sets isInitialized even on network error", async () => {
      refreshTokenMock.mockRejectedValue(new Error("Network failed"));

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().isInitialized).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
