import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileView from "@/app/profile/_components/ProfileView";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/profile",
}));

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

describe("ProfileView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows profile content when data is loaded", () => {
    render(<ProfileView profile={fullProfile} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("@traveler01")).toBeInTheDocument();
    expect(screen.getByText("Love hiking and exploring")).toBeInTheDocument();
    expect(screen.getByText("hiking")).toBeInTheDocument();
    expect(screen.getByText("street_food")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("shows empty state when profile is not set up", () => {
    render(<ProfileView profile={emptyProfile} />);

    expect(screen.getByText("Complete Your Profile")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit profile/i })).toHaveAttribute(
      "href",
      "/profile/edit",
    );
  });

  it("has a link to edit profile page", () => {
    render(<ProfileView profile={fullProfile} />);

    expect(
      screen.getByRole("link", { name: /edit profile/i }),
    ).toHaveAttribute("href", "/profile/edit");
  });

  it("shows interest tags as badges", () => {
    render(<ProfileView profile={fullProfile} />);

    expect(screen.getByText("hiking")).toBeInTheDocument();
    expect(screen.getByText("street_food")).toBeInTheDocument();
  });

  it("does not show interests section when no tags", () => {
    const profileNoTags = { ...fullProfile, interest_tags: null };
    render(<ProfileView profile={profileNoTags} />);

    expect(screen.queryByText("Interests")).not.toBeInTheDocument();
  });

  it("shows avatar fallback when no avatar_url", () => {
    const profileNoAvatar = { ...fullProfile, avatar_url: null };
    render(<ProfileView profile={profileNoAvatar} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
