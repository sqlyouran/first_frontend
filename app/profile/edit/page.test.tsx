import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditProfilePage from "@/app/profile/edit/page";
import { useAuthStore } from "@/lib/stores/auth";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/profile/edit",
}));

// Mock profile API
vi.mock("@/lib/api/profile", () => ({
  fetchMyProfile: vi.fn(),
  updateProfile: vi.fn(),
  fetchInterestTags: vi.fn(),
}));

// Mock auth API
vi.mock("@/lib/api/auth", () => ({
  login: vi.fn(),
  refreshToken: vi.fn().mockResolvedValue({ status: 401 }),
  fetchMe: vi.fn().mockResolvedValue({ status: 200, data: { id: "1", email: "test@example.com", state: "active", created_at: "2024-01-01", nickname: null, avatar_url: null, username: null, request_id: "r1" } }),
  logout: vi.fn().mockResolvedValue({ status: 204 }),
}));

import { fetchMyProfile, updateProfile, fetchInterestTags } from "@/lib/api/profile";
const fetchMyProfileMock = vi.mocked(fetchMyProfile);
const updateProfileMock = vi.mocked(updateProfile);
const fetchInterestTagsMock = vi.mocked(fetchInterestTags);

const existingProfile = {
  id: "u1",
  username: "traveler01",
  nickname: "Alice",
  avatar_url: "https://example.com/avatar.jpg",
  bio: "Love hiking",
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

const interestTagsData = {
  tags: [
    { value: "hiking", label: "Hiking", category: "outdoors" },
    { value: "street_food", label: "Street Food", category: "food" },
    { value: "photography", label: "Photography", category: "arts" },
    { value: "history", label: "History", category: "culture" },
  ],
  request_id: "r3",
};

describe("EditProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      accessToken: "token",
      user: { id: "u1", email: "alice@example.com", state: "active", created_at: "2024-01-01", nickname: "Alice", avatar_url: null, username: "traveler01" },
      isAuthenticated: true,
      isInitialized: true,
    });
    fetchInterestTagsMock.mockResolvedValue({ status: 200, data: interestTagsData });
  });

  it("shows loading skeleton initially", () => {
    fetchMyProfileMock.mockImplementation(() => new Promise(() => {}));
    render(<EditProfilePage />);

    expect(screen.getByTestId("edit-profile-skeleton")).toBeInTheDocument();
  });

  it("pre-fills form with existing profile data", async () => {
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: existingProfile });
    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("traveler01")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://example.com/avatar.jpg")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Love hiking")).toBeInTheDocument();
  });

  it("username is readonly when already set", async () => {
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: existingProfile });
    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("traveler01")).toBeInTheDocument();
    });

    const usernameInput = screen.getByDisplayValue("traveler01");
    expect(usernameInput).toHaveAttribute("readonly");
  });

  it("username is editable when not yet set", async () => {
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: emptyProfile });
    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/choose a username/i)).toBeInTheDocument();
    });

    const usernameInput = screen.getByPlaceholderText(/choose a username/i);
    expect(usernameInput).not.toHaveAttribute("readonly");
  });

  it("shows username warning when editable", async () => {
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: emptyProfile });
    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/cannot be changed later/i)).toBeInTheDocument();
    });
  });

  it("shows error state when profile fetch fails", async () => {
    fetchMyProfileMock.mockResolvedValue({
      status: 500,
      error: { request_id: "r1", error_code: "server_error", message: "Server error" },
    });
    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  it("validates nickname is at least 2 characters", async () => {
    const user = userEvent.setup();
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: emptyProfile });
    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your nickname/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/your nickname/i), "A");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByText(/nickname must be at least 2 characters/i)).toBeInTheDocument();
  });

  it("submits form and redirects to /profile on success", async () => {
    const user = userEvent.setup();
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: emptyProfile });
    updateProfileMock.mockResolvedValue({
      status: 200,
      data: { ...emptyProfile, username: "newuser", nickname: "New User" },
    });

    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/choose a username/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/choose a username/i), "newuser");
    await user.type(screen.getByPlaceholderText(/your nickname/i), "New User");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/profile");
    });
  });

  it("shows server error for username_taken (409)", async () => {
    const user = userEvent.setup();
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: emptyProfile });
    updateProfileMock.mockResolvedValue({
      status: 409,
      error: { request_id: "r1", error_code: "username_taken", message: "Username taken" },
    });

    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/choose a username/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/choose a username/i), "taken");
    await user.type(screen.getByPlaceholderText(/your nickname/i), "New User");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/username is already taken/i);
    });
  });

  it("shows validation errors from server (422)", async () => {
    const user = userEvent.setup();
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: emptyProfile });
    updateProfileMock.mockResolvedValue({
      status: 422,
      error: {
        request_id: "r1",
        error_code: "validation_error",
        message: "Validation failed",
        details: { nickname: "Must be at least 2 characters" },
      },
    });

    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/choose a username/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/choose a username/i), "testuser");
    await user.type(screen.getByPlaceholderText(/your nickname/i), "AB");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("Must be at least 2 characters")).toBeInTheDocument();
    });
  });

  it("allows selecting interest tags", async () => {
    const user = userEvent.setup();
    fetchMyProfileMock.mockResolvedValue({ status: 200, data: emptyProfile });
    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Hiking")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Hiking"));
    expect(screen.getByText("Hiking").closest("button")).toHaveAttribute("data-selected", "true");
  });
});
