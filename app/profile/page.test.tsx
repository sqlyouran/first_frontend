import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/app/profile/page";
import { useAuthStore } from "@/lib/stores/auth";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/profile",
}));

// Mock profile API
vi.mock("@/lib/api/profile", () => ({
  fetchMyProfile: vi.fn(),
}));

// Mock auth API (for refreshToken used by authFetch chain)
vi.mock("@/lib/api/auth", () => ({
  login: vi.fn(),
  refreshToken: vi.fn().mockResolvedValue({ status: 401 }),
  fetchMe: vi.fn().mockResolvedValue({ status: 200, data: { id: "1", email: "test@example.com", state: "active", created_at: "2024-01-01", nickname: null, avatar_url: null, username: null, request_id: "r1" } }),
  logout: vi.fn().mockResolvedValue({ status: 204 }),
}));

import { fetchMyProfile } from "@/lib/api/profile";
const fetchMyProfileMock = vi.mocked(fetchMyProfile);

const fullProfile = {
  id: "u1",
  username: "traveler01",
  nickname: "Alice",
  avatar_url: "https://example.com/avatar.jpg",
  bio: "Love hiking and exploring",
  interest_tags: ["hiking", "street_food"],
  email: "alice@example.com",
  created_at: "2024-01-01T00:00:00Z",
  request_id: "r1",
};

const emptyProfile = {
  id: "u2",
  username: null,
  nickname: null,
  avatar_url: null,
  bio: null,
  interest_tags: null,
  email: "new@example.com",
  created_at: "2024-06-01T00:00:00Z",
  request_id: "r2",
};

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      accessToken: "token",
      user: { id: "u1", email: "alice@example.com", state: "active", created_at: "2024-01-01", nickname: "Alice", avatar_url: null, username: "traveler01" },
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it("shows loading skeleton initially", () => {
    fetchMyProfileMock.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<ProfilePage />);

    expect(screen.getByTestId("profile-skeleton")).toBeInTheDocument();
  });

  it("shows profile content when data is loaded", async () => {
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: fullProfile });
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    expect(screen.getByText("@traveler01")).toBeInTheDocument();
    expect(screen.getByText("Love hiking and exploring")).toBeInTheDocument();
    expect(screen.getByText("hiking")).toBeInTheDocument();
    expect(screen.getByText("street_food")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("shows empty state when profile is not set up", async () => {
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: emptyProfile });
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Complete Your Profile")).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /edit profile/i })).toHaveAttribute("href", "/profile/edit");
  });

  it("shows error state with retry button on API failure", async () => {
    fetchMyProfileMock.mockResolvedValue({
      status: 500,
      error: { request_id: "r1", error_code: "server_error", message: "Server error" },
    });
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("retries fetching profile when retry button is clicked", async () => {
    const user = userEvent.setup();
    fetchMyProfileMock
      .mockResolvedValueOnce({
        status: 500,
        error: { request_id: "r1", error_code: "server_error", message: "Server error" },
      })
      .mockResolvedValueOnce({ status: 200, data: fullProfile });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
  });

  it("has a link to edit profile page", async () => {
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: fullProfile });
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /edit profile/i })).toHaveAttribute("href", "/profile/edit");
    });
  });
});
