import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const fetchPostsMock = vi.mocked(postsApi.fetchPosts);

describe("PostsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no posts", async () => {
    fetchPostsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 20, request_id: "r1" },
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
            request_id: "r1",
          },
        ],
        total: 1,
        page: 1,
        size: 20,
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
      data: { items: [], total: 0, page: 1, size: 20, request_id: "r1" },
    });

    render(<PostsListPage />);

    await waitFor(() => {
      const createLink = screen.getByRole("link", { name: /发布/ });
      expect(createLink).toHaveAttribute("href", "/posts/create");
    });
  });
});
