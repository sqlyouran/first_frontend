import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostCard, formatCount } from "./PostCard";
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
  comment_count: 3,
  up_vote_count: 5,
  bookmark_count: 2,
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

  it("renders interaction stats with non-zero values", () => {
    render(<PostCard post={samplePost} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("always shows upvote and comment counts, even when zero", () => {
    render(<PostCard post={{ ...samplePost, comment_count: 0, up_vote_count: 0, bookmark_count: 0 }} />);
    // Upvote and comment always show "0"
    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(2); // upvote + comment
    // Bookmark hidden when zero
    const bookmarkIcons = screen.queryAllByTestId("bookmark-icon");
    expect(bookmarkIcons).toHaveLength(0);
  });

  it("shows upvote+comment always, bookmark only when non-zero", () => {
    render(<PostCard post={{ ...samplePost, comment_count: 0, up_vote_count: 8, bookmark_count: 0 }} />);
    expect(screen.getByText("8")).toBeInTheDocument();
    // comment still shows "0"
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

describe("formatCount", () => {
  it("returns null for 0", () => {
    expect(formatCount(0)).toBeNull();
  });

  it("returns number as string for < 1000", () => {
    expect(formatCount(1)).toBe("1");
    expect(formatCount(999)).toBe("999");
  });

  it("formats 1.2k for 1200", () => {
    expect(formatCount(1200)).toBe("1.2k");
  });

  it("formats 1.2k for 1234", () => {
    expect(formatCount(1234)).toBe("1.2k");
  });

  it("formats 12k for 12345", () => {
    expect(formatCount(12345)).toBe("12k");
  });

  it("formats 1k for exactly 1000", () => {
    expect(formatCount(1000)).toBe("1k");
  });

  it("formats 10k for exactly 10000", () => {
    expect(formatCount(10000)).toBe("10k");
  });
});
