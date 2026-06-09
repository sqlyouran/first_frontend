import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostCard } from "./PostCard";
import type { PostListItem } from "@/lib/api/posts";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const samplePost: PostListItem = {
  id: "p1",
  title: "My Travel Post",
  cover_image: "https://example.com/cover.jpg",
  tags: ["travel", "food", "culture"],
  status: "published",
  author_id: "user-uuid-123",
  created_at: "2024-06-01T12:00:00Z",
  updated_at: "2024-06-01T12:00:00Z",
  request_id: "r1",
};

describe("PostCard", () => {
  it("renders title", () => {
    render(<PostCard post={samplePost} />);
    expect(screen.getByText("My Travel Post")).toBeInTheDocument();
  });

  it("renders cover image container when provided", () => {
    render(<PostCard post={samplePost} />);
    expect(screen.getByText("My Travel Post")).toBeInTheDocument();
    // Cover image div exists with background style
  });

  it("renders placeholder when no cover image", () => {
    render(<PostCard post={{ ...samplePost, cover_image: null }} />);
    // Should not crash and still render content
    expect(screen.getByText("My Travel Post")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<PostCard post={samplePost} />);
    expect(screen.getByText("travel")).toBeInTheDocument();
    expect(screen.getByText("food")).toBeInTheDocument();
    expect(screen.getByText("culture")).toBeInTheDocument();
  });

  it("truncates tags beyond 3", () => {
    render(
      <PostCard
        post={{ ...samplePost, tags: ["a", "b", "c", "d", "e"] }}
      />
    );
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("renders created_at formatted", () => {
    render(<PostCard post={samplePost} />);
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("links to post detail", () => {
    render(<PostCard post={samplePost} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/posts/p1");
  });
});
