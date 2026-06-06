import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useAuthStore } from "@/lib/stores/auth";

// Mock auth API
vi.mock("@/lib/api/auth", () => ({
  refreshToken: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(),
}));

import { refreshToken, fetchMe } from "@/lib/api/auth";
const refreshTokenMock = vi.mocked(refreshToken);
const fetchMeMock = vi.mocked(fetchMe);

import { AuthProvider } from "@/components/AuthProvider";

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false, isInitialized: false });
  });

  it("renders nothing while initializing", () => {
    // Make initialize hang
    refreshTokenMock.mockImplementation(() => new Promise(() => {}));

    const { container } = render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>
    );

    expect(container.innerHTML).toBe("");
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("renders children after initialization succeeds", async () => {
    refreshTokenMock.mockResolvedValue({
      status: 200,
      data: { access_token: "token", expires_in: 1800, request_id: "r1" },
    });
    fetchMeMock.mockResolvedValue({
      status: 200,
      data: { id: "1", email: "a@b.com", state: "active", created_at: "2024-01-01", request_id: "r1" },
    });

    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders children after initialization fails (unauthenticated)", async () => {
    refreshTokenMock.mockResolvedValue({
      status: 401,
      error: { request_id: "r1", error_code: "invalid_token", message: "No session" },
    });

    render(
      <AuthProvider>
        <div data-testid="child">Content</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
    expect(useAuthStore.getState().isInitialized).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
