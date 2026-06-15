import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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

import CommentInput from "./CommentInput";
import { createComment } from "@/lib/api/interactions";
import { toast } from "sonner";

const createMock = vi.mocked(createComment);
const toastMock = vi.mocked(toast);

describe("CommentInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
  });

  it("shows login prompt when not authenticated", () => {
    render(<CommentInput entityId="p1" entityType="post" />);

    expect(screen.getByText("登录")).toBeInTheDocument();
    expect(screen.getByText("后即可参与评论")).toBeInTheDocument();
  });

  it("hides login prompt for reply when not authenticated", () => {
    const { container } = render(<CommentInput entityId="p1" entityType="post" parentCommentId="c1" />);
    expect(container.firstChild).toBeNull();
  });

  it("shows textarea and submit button when authenticated", () => {
    mockIsAuthenticated = true;
    render(<CommentInput entityId="p1" entityType="post" />);

    expect(screen.getByPlaceholderText("写下你的评论...")).toBeInTheDocument();
    expect(screen.getByText("发布")).toBeInTheDocument();
  });

  it("disables submit when content is empty", () => {
    mockIsAuthenticated = true;
    render(<CommentInput entityId="p1" entityType="post" />);

    expect(screen.getByText("发布")).toBeDisabled();
  });

  it("enables submit when content is entered", () => {
    mockIsAuthenticated = true;
    render(<CommentInput entityId="p1" entityType="post" />);

    fireEvent.change(screen.getByPlaceholderText("写下你的评论..."), {
      target: { value: "Hello world" },
    });

    expect(screen.getByText("发布")).not.toBeDisabled();
  });

  it("submits comment successfully", async () => {
    mockIsAuthenticated = true;
    const onSuccess = vi.fn();
    createMock.mockResolvedValue({
      status: 201,
      data: {
        request_id: "r1",
        id: "c1",
        entity_id: "p1",
        entity_type: "POST",
        user_id: "u1",
        content: "Hello",
        parent_comment_id: null,
        created_at: "2024-01-01T00:00:00Z",
        deleted: false,
      },
    });

    render(<CommentInput entityId="p1" entityType="post" onSuccess={onSuccess} />);

    fireEvent.change(screen.getByPlaceholderText("写下你的评论..."), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByText("发布"));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith("p1", "post", "Hello", undefined);
      expect(onSuccess).toHaveBeenCalled();
      expect(toastMock.success).toHaveBeenCalledWith("评论已发布");
    });
  });
});
