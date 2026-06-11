import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PostDetailPage from "./page";

// Mock fetchFromBackend
vi.mock("@/lib/backend", () => ({
  fetchFromBackend: vi.fn(),
}));

// Mock notFound
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Mock MarkdownRenderer
vi.mock("./_components/MarkdownRenderer", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="md-content">{content}</div>
  ),
}));

// Mock interaction components
vi.mock("../_components/VoteButtons", () => ({
  default: ({ postId }: { postId: string }) => (
    <div data-testid="vote-buttons" data-post-id={postId}>
      VoteButtons
    </div>
  ),
}));

vi.mock("../_components/BookmarkButton", () => ({
  default: ({ postId }: { postId: string }) => (
    <div data-testid="bookmark-button" data-post-id={postId}>
      BookmarkButton
    </div>
  ),
}));

vi.mock("../_components/CommentSection", () => ({
  default: ({ postId }: { postId: string }) => (
    <div data-testid="comment-section" data-post-id={postId}>
      CommentSection
    </div>
  ),
}));

import { fetchFromBackend } from "@/lib/backend";

const fetchMock = vi.mocked(fetchFromBackend);

function mockPostResponse() {
  return new Response(
    JSON.stringify({
      id: "p1",
      title: "My Post Title",
      content: "# Hello World",
      cover_image: null,
      tags: ["travel"],
      status: "published",
      author_id: "user-1234-5678",
      created_at: "2024-06-01T12:00:00Z",
      updated_at: "2024-06-01T12:00:00Z",
      request_id: "r1",
    }),
    { status: 200 }
  );
}

function mockVoteStatsResponse() {
  return new Response(
    JSON.stringify({
      request_id: "r2",
      up_count: 5,
      down_count: 1,
      user_vote: null,
    }),
    { status: 200 }
  );
}

function mockBookmarkStatusResponse() {
  return new Response(
    JSON.stringify({ request_id: "r3", bookmarked: false }),
    { status: 200 }
  );
}

describe("PostDetailPage", () => {
  const params = Promise.resolve({ id: "p1" });

  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("renders post title, content, and interaction components", async () => {
    fetchMock
      .mockResolvedValueOnce(mockPostResponse())
      .mockResolvedValueOnce(mockVoteStatsResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await PostDetailPage({ params });
    render(page);

    expect(screen.getByText("My Post Title")).toBeInTheDocument();
    expect(screen.getByTestId("md-content")).toHaveTextContent("# Hello World");
    expect(screen.getByTestId("vote-buttons")).toBeInTheDocument();
    expect(screen.getByTestId("bookmark-button")).toBeInTheDocument();
    expect(screen.getByTestId("comment-section")).toBeInTheDocument();
  });

  it("calls notFound when post not found (404)", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error_code: "not_found", message: "Post not found" }),
          { status: 404 }
        )
      )
      .mockResolvedValueOnce(mockVoteStatsResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    await expect(PostDetailPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders tags", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "p1",
            title: "Tagged Post",
            content: "content",
            cover_image: null,
            tags: ["food", "culture"],
            status: "published",
            author_id: "user-1234-5678",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            request_id: "r1",
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(mockVoteStatsResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await PostDetailPage({ params });
    render(page);

    expect(screen.getByText("food")).toBeInTheDocument();
    expect(screen.getByText("culture")).toBeInTheDocument();
  });

  it("passes postId to interaction components", async () => {
    fetchMock
      .mockResolvedValueOnce(mockPostResponse())
      .mockResolvedValueOnce(mockVoteStatsResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await PostDetailPage({ params });
    render(page);

    expect(screen.getByTestId("vote-buttons")).toHaveAttribute("data-post-id", "p1");
    expect(screen.getByTestId("bookmark-button")).toHaveAttribute("data-post-id", "p1");
    expect(screen.getByTestId("comment-section")).toHaveAttribute("data-post-id", "p1");
  });
});
