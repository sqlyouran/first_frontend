import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { CommentData } from "@/lib/api/interactions";

vi.mock("@/lib/api/interactions", () => ({
  createComment: vi.fn(),
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

import CommentItem from "./CommentItem";

function makeComment(overrides: Partial<CommentData> = {}): CommentData {
  return {
    request_id: "r1",
    id: "c1",
    post_id: "p1",
    user_id: "abcdefgh-1234-5678-9012-abcdef123456",
    content: "这是一条评论",
    parent_comment_id: null,
    created_at: new Date().toISOString(),
    deleted: false,
    ...overrides,
  };
}

describe("CommentItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
  });

  it("renders normal comment with truncated user id and content", () => {
    const comment = makeComment();
    const onReply = vi.fn();
    render(<CommentItem comment={comment} depth={0} onReply={onReply} />);

    expect(screen.getByText("abcdefgh")).toBeInTheDocument();
    expect(screen.getByText("这是一条评论")).toBeInTheDocument();
    expect(screen.getByText("回复")).toBeInTheDocument();
  });

  it("renders deleted comment placeholder", () => {
    const comment = makeComment({ deleted: true });
    render(<CommentItem comment={comment} depth={0} />);

    expect(screen.getByText("已删除用户")).toBeInTheDocument();
    expect(screen.getByText("[已删除]")).toBeInTheDocument();
    expect(screen.queryByText("回复")).not.toBeInTheDocument();
  });

  it("renders nested replies when depth < 2", () => {
    const parent = makeComment({ id: "parent" });
    const reply1 = makeComment({ id: "reply1", content: "第一层回复", parent_comment_id: "parent" });

    render(
      <CommentItem comment={parent} depth={0} replies={[reply1]} replyCount={1} />
    );

    expect(screen.getByText("第一层回复")).toBeInTheDocument();
  });

  it("shows load more button when replyCount > loaded replies", () => {
    const parent = makeComment({ id: "parent" });
    const reply1 = makeComment({ id: "reply1", content: "已加载回复", parent_comment_id: "parent" });
    const onLoadMore = vi.fn();

    render(
      <CommentItem
        comment={parent}
        depth={0}
        replies={[reply1]}
        replyCount={4}
        onLoadMoreReplies={onLoadMore}
      />
    );

    const btn = screen.getByText("查看更多 3 条回复");
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onLoadMore).toHaveBeenCalledWith("parent");
  });

  it("shows reply input when reply button is clicked", () => {
    mockIsAuthenticated = true;
    const comment = makeComment();
    const onReply = vi.fn();

    render(<CommentItem comment={comment} depth={0} onReply={onReply} />);

    fireEvent.click(screen.getByText("回复"));
    expect(screen.getByPlaceholderText("回复 abcdefgh...")).toBeInTheDocument();
  });

  it("does not show load more when all replies are loaded", () => {
    const parent = makeComment({ id: "parent" });
    const reply1 = makeComment({ id: "reply1", parent_comment_id: "parent" });

    render(
      <CommentItem
        comment={parent}
        depth={0}
        replies={[reply1]}
        replyCount={1}
        onLoadMoreReplies={vi.fn()}
      />
    );

    expect(screen.queryByText(/查看更多/)).not.toBeInTheDocument();
  });
});
