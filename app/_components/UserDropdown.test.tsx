import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserDropdown from "@/app/_components/UserDropdown";
import { useAuthStore } from "@/lib/stores/auth";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock auth API
vi.mock("@/lib/api/auth", () => ({
  login: vi.fn(),
  refreshToken: vi.fn().mockResolvedValue({ status: 401 }),
  fetchMe: vi.fn().mockResolvedValue({ status: 200, data: { id: "1", email: "test@example.com", state: "active", created_at: "2024-01-01", nickname: null, avatar_url: null, username: null, request_id: "r1" } }),
  logout: vi.fn().mockResolvedValue({ status: 204 }),
}));

describe("UserDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockClear();
  });

  describe("when authenticated with profile", () => {
    beforeEach(() => {
      useAuthStore.setState({
        accessToken: "token",
        user: {
          id: "u1",
          email: "alice@example.com",
          state: "active",
          created_at: "2024-01-01",
          nickname: "Alice",
          avatar_url: "https://example.com/avatar.jpg",
          username: "traveler01",
        },
        isAuthenticated: true,
        isInitialized: true,
      });
    });

    it("shows user avatar button", () => {
      render(<UserDropdown />);
      expect(screen.getByRole("button", { name: /user menu/i })).toBeInTheDocument();
    });

    it("shows dropdown with My Profile and Sign Out when clicked", async () => {
      const user = userEvent.setup();
      render(<UserDropdown />);

      await user.click(screen.getByRole("button", { name: /user menu/i }));

      expect(screen.getByRole("menuitem", { name: /my profile/i })).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: /sign out/i })).toBeInTheDocument();
    });

    it("navigates to /profile when My Profile is clicked", async () => {
      const user = userEvent.setup();
      render(<UserDropdown />);

      await user.click(screen.getByRole("button", { name: /user menu/i }));
      await user.click(screen.getByRole("menuitem", { name: /my profile/i }));

      expect(pushMock).toHaveBeenCalledWith("/profile");
    });

    it("calls logout and clears auth when Sign Out is clicked", async () => {
      const user = userEvent.setup();
      render(<UserDropdown />);

      await user.click(screen.getByRole("button", { name: /user menu/i }));
      await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
      });
    });
  });

  describe("when authenticated without avatar", () => {
    beforeEach(() => {
      useAuthStore.setState({
        accessToken: "token",
        user: {
          id: "u1",
          email: "alice@example.com",
          state: "active",
          created_at: "2024-01-01",
          nickname: "Alice",
          avatar_url: null,
          username: null,
        },
        isAuthenticated: true,
        isInitialized: true,
      });
    });

    it("shows default avatar placeholder", () => {
      render(<UserDropdown />);
      expect(screen.getByTestId("default-avatar")).toBeInTheDocument();
    });
  });

  describe("when not authenticated", () => {
    beforeEach(() => {
      useAuthStore.setState({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    });

    it("shows Sign In and Sign Up links", () => {
      render(<UserDropdown />);
      expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/register");
    });
  });
});
