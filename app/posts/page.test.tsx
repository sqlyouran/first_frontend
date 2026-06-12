import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PostsListPage from "./page";
import * as postsApi from "@/lib/api/posts";

vi.mock("@/lib/api/posts", () => ({
  fetchPosts: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// IntersectionObserver polyfill for jsdom
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

const fetchPostsMock = vi.mocked(postsApi.fetchPosts);

describe("PostsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no posts", async () => {
    fetchPostsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 20, next_cursor: null, has_more: false, request_id: "r1" },
    });

    render(<PostsListPage />);

    await waitFor(() => {
      expect(screen.getByText("还没有帖子")).toBeInTheDocument();
    });
  });

  it("renders post cards when data loaded", async () => {
    fetchPostsMock.mockResolvedValue({
      status: 200,
      data: {
        items: [
          {
            id: "p1",
            title: "First Post",
            cover_image: null,
            tags: ["travel"],
            status: "published",
            author_id: "u1",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            comment_count: 0,
            up_vote_count: 0,
            bookmark_count: 0,
            request_id: "r1",
          },
        ],
        total: 1,
        page: 1,
        size: 20,
        next_cursor: "2024-01-01T00:00:00Z",
        has_more: false,
        request_id: "r1",
      },
    });

    render(<PostsListPage />);

    await waitFor(() => {
      expect(screen.getByText("First Post")).toBeInTheDocument();
    });
  });

  it("has link to create post", async () => {
    fetchPostsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 20, next_cursor: null, has_more: false, request_id: "r1" },
    });

    render(<PostsListPage />);

    await waitFor(() => {
      const createLink = screen.getByRole("link", { name: /发布/ });
      expect(createLink).toHaveAttribute("href", "/posts/create");
    });
  });

  it("renders sort tabs: 最新, 最热, 最多讨论", async () => {
    fetchPostsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 20, next_cursor: null, has_more: false, request_id: "r1" },
    });

    render(<PostsListPage />);

    await waitFor(() => {
      expect(screen.getByText("最新")).toBeInTheDocument();
      expect(screen.getByText("最热")).toBeInTheDocument();
      expect(screen.getByText("最多讨论")).toBeInTheDocument();
    });
  });

  it("shows end-of-list message when no more items", async () => {
    fetchPostsMock.mockResolvedValue({
      status: 200,
      data: {
        items: [
          {
            id: "p1",
            title: "Only Post",
            cover_image: null,
            tags: [],
            status: "published",
            author_id: "u1",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            comment_count: 0,
            up_vote_count: 0,
            bookmark_count: 0,
            request_id: "r1",
          },
        ],
        total: 1,
        page: 1,
        size: 20,
        next_cursor: null,
        has_more: false,
        request_id: "r1",
      },
    });

    render(<PostsListPage />);

    await waitFor(() => {
      expect(screen.getByText("已经到底啦")).toBeInTheDocument();
    });
  });
});
