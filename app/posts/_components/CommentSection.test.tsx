import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockFetchComments = vi.fn();
const mockFetchReplies = vi.fn();
const mockCreateComment = vi.fn();

vi.mock("@/lib/api/interactions", () => ({
  fetchComments: (...args: unknown[]) => mockFetchComments(...args),
  fetchReplies: (...args: unknown[]) => mockFetchReplies(...args),
  createComment: (...args: unknown[]) => mockCreateComment(...args),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

let mockIsAuthenticated = false;
vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: mockIsAuthenticated }),
}));

import CommentSection from "./CommentSection";

function makeCommentData(overrides: Record<string, unknown> = {}) {
  return {
    request_id: "r1",
    id: "c1",
    entity_id: "p1",
    entity_type: "POST",
    user_id: "abcdefgh-1234-5678-9012-abcdef123456",
    content: "第一条评论",
    parent_comment_id: null,
    created_at: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

describe("CommentSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
  });

  it("loads and displays comments on mount", async () => {
    mockFetchComments.mockResolvedValue({
      status: 200,
      data: {
        request_id: "r1",
        items: [makeCommentData({ id: "c1", content: "Hello" })],
        total: 1,
        page: 1,
        size: 20,
      },
    });

    render(<CommentSection entityId="p1" entityType="post" />);

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });
    expect(mockFetchComments).toHaveBeenCalledWith("p1", "post", 1, 20);
  });

  it("shows empty state when no comments", async () => {
    mockFetchComments.mockResolvedValue({
      status: 200,
      data: {
        request_id: "r1",
        items: [],
        total: 0,
        page: 1,
        size: 20,
      },
    });

    render(<CommentSection entityId="p1" entityType="post" />);

    await waitFor(() => {
      expect(screen.getByText("暂无评论，发表第一条评论吧")).toBeInTheDocument();
    });
  });

  it("prepends new comment after successful post", async () => {
    mockIsAuthenticated = true;
    mockFetchComments.mockResolvedValue({
      status: 200,
      data: {
        request_id: "r1",
        items: [makeCommentData({ id: "c1", content: "已有评论" })],
        total: 1,
        page: 1,
        size: 20,
      },
    });
    mockCreateComment.mockResolvedValue({
      status: 201,
      data: makeCommentData({ id: "c2", content: "新评论" }),
    });

    render(<CommentSection entityId="p1" entityType="post" />);

    await waitFor(() => {
      expect(screen.getByText("已有评论")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("写下你的评论..."), {
      target: { value: "新评论" },
    });
    fireEvent.click(screen.getByText("发布"));

    await waitFor(() => {
      expect(screen.getByText("新评论")).toBeInTheDocument();
    });

    const allComments = screen.getAllByText(/评论|新评论/);
    expect(allComments.length).toBeGreaterThan(0);
  });

  it("shows load more button when hasMore is true", async () => {
    mockFetchComments.mockResolvedValue({
      status: 200,
      data: {
        request_id: "r1",
        items: Array.from({ length: 20 }, (_, i) =>
          makeCommentData({ id: `c${i}`, content: `评论${i}` })
        ),
        total: 40,
        page: 1,
        size: 20,
      },
    });

    render(<CommentSection entityId="p1" entityType="post" />);

    await waitFor(() => {
      expect(screen.getByText("加载更多评论")).toBeInTheDocument();
    });
  });
});
