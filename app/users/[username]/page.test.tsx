import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PublicProfileView, {
  PublicProfileNotFound,
} from "@/app/users/[username]/_components/PublicProfileView";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ username: "traveler01" }),
}));

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

describe("PublicProfileView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows profile content when loaded", () => {
    render(<PublicProfileView profile={publicProfile} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("@traveler01")).toBeInTheDocument();
    expect(
      screen.getByText("Love hiking and exploring China"),
    ).toBeInTheDocument();
    expect(screen.getByText("hiking")).toBeInTheDocument();
    expect(screen.getByText("photography")).toBeInTheDocument();
  });

  it("shows minimal profile (no bio/tags) correctly", () => {
    render(<PublicProfileView profile={minimalProfile} />);

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("@minimal")).toBeInTheDocument();
    expect(screen.queryByText("Interests")).not.toBeInTheDocument();
  });

  it("shows not found component", () => {
    render(<PublicProfileNotFound />);

    expect(screen.getByText("User Not Found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("does not show email in public profile", () => {
    render(<PublicProfileView profile={publicProfile} />);

    expect(screen.queryByText(/@example\.com/)).not.toBeInTheDocument();
  });

  it("shows member since date", () => {
    render(<PublicProfileView profile={publicProfile} />);

    expect(screen.getByText(/Joined/)).toBeInTheDocument();
  });

  it("shows interest tags as badges", () => {
    render(<PublicProfileView profile={publicProfile} />);

    expect(screen.getByText("hiking")).toBeInTheDocument();
    expect(screen.getByText("photography")).toBeInTheDocument();
  });
});
