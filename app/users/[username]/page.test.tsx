import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PublicProfilePage from "@/app/users/[username]/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ username: "traveler01" }),
}));

// Mock profile API
vi.mock("@/lib/api/profile", () => ({
  fetchPublicProfile: vi.fn(),
}));

// Mock auth API (for store initialization chain)
vi.mock("@/lib/api/auth", () => ({
  login: vi.fn(),
  refreshToken: vi.fn().mockResolvedValue({ status: 401 }),
  fetchMe: vi.fn().mockResolvedValue({ status: 401 }),
  logout: vi.fn().mockResolvedValue({ status: 204 }),
}));

import { fetchPublicProfile } from "@/lib/api/profile";
const fetchPublicProfileMock = vi.mocked(fetchPublicProfile);

const publicProfile = {
  id: "u1",
  username: "traveler01",
  nickname: "Alice",
  avatar_url: "https://example.com/avatar.jpg",
  bio: "Love hiking and exploring China",
  interest_tags: ["hiking", "photography"],
  created_at: "2024-01-01T00:00:00Z",
  request_id: "r1",
};

const minimalProfile = {
  id: "u2",
  username: "minimal",
  nickname: "Bob",
  avatar_url: null,
  bio: null,
  interest_tags: null,
  created_at: "2024-06-01T00:00:00Z",
  request_id: "r2",
};

describe("PublicProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton initially", () => {
    fetchPublicProfileMock.mockImplementation(() => new Promise(() => {}));
    render(<PublicProfilePage />);

    expect(screen.getByTestId("public-profile-skeleton")).toBeInTheDocument();
  });

  it("shows profile content when loaded", async () => {
    fetchPublicProfileMock.mockResolvedValue({ status: 200, data: publicProfile });
    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    expect(screen.getByText("@traveler01")).toBeInTheDocument();
    expect(screen.getByText("Love hiking and exploring China")).toBeInTheDocument();
    expect(screen.getByText("hiking")).toBeInTheDocument();
    expect(screen.getByText("photography")).toBeInTheDocument();
  });

  it("shows minimal profile (no bio/tags) correctly", async () => {
    fetchPublicProfileMock.mockResolvedValue({ status: 200, data: minimalProfile });
    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    expect(screen.getByText("@minimal")).toBeInTheDocument();
  });

  it("shows not found when user does not exist (404)", async () => {
    fetchPublicProfileMock.mockResolvedValue({
      status: 404,
      error: { request_id: "r1", error_code: "not_found", message: "User not found" },
    });
    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("User Not Found")).toBeInTheDocument();
    });
  });

  it("shows error state with retry on server error", async () => {
    fetchPublicProfileMock.mockResolvedValue({
      status: 500,
      error: { request_id: "r1", error_code: "server_error", message: "Server error" },
    });
    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("does not show email in public profile", async () => {
    fetchPublicProfileMock.mockResolvedValue({ status: 200, data: publicProfile });
    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    expect(screen.queryByText(/@example\.com/)).not.toBeInTheDocument();
  });
});
