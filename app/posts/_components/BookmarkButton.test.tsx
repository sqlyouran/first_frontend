import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/api/interactions", () => ({
  toggleBookmark: vi.fn(),
  fetchBookmarkStatus: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

let mockIsAuthenticated = false;
vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: mockIsAuthenticated }),
}));

import BookmarkButton from "./BookmarkButton";
import { toggleBookmark, fetchBookmarkStatus } from "@/lib/api/interactions";
import { toast } from "sonner";

const toggleMock = vi.mocked(toggleBookmark);
const fetchStatusMock = vi.mocked(fetchBookmarkStatus);
const toastMock = vi.mocked(toast);

describe("BookmarkButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
    fetchStatusMock.mockResolvedValue({ status: 200, data: { request_id: "r1", bookmarked: false } });
  });

  it("renders not-bookmarked state by default", () => {
    render(<BookmarkButton postId="p1" initialBookmarked={false} />);

    expect(screen.getByLabelText("收藏")).toBeInTheDocument();
    expect(screen.getByText("收藏")).toBeInTheDocument();
  });

  it("renders bookmarked state", () => {
    render(<BookmarkButton postId="p1" initialBookmarked={true} />);

    expect(screen.getByLabelText("取消收藏")).toBeInTheDocument();
    expect(screen.getByText("已收藏")).toBeInTheDocument();
  });

  it("optimistic toggle on click (authenticated)", async () => {
    mockIsAuthenticated = true;
    toggleMock.mockResolvedValue({ status: 200, data: { request_id: "r1", bookmarked: true } });

    render(<BookmarkButton postId="p1" initialBookmarked={false} />);

    fireEvent.click(screen.getByLabelText("收藏"));

    // Optimistic: should immediately show bookmarked
    await waitFor(() => {
      expect(screen.getByText("已收藏")).toBeInTheDocument();
    });
  });

  it("rollback on failure", async () => {
    mockIsAuthenticated = true;
    toggleMock.mockResolvedValue({
      status: 500,
      error: { request_id: "r1", error_code: "server_error", message: "fail" },
    });

    render(<BookmarkButton postId="p1" initialBookmarked={false} />);

    fireEvent.click(screen.getByLabelText("收藏"));

    // After failure, should rollback to not-bookmarked
    await waitFor(() => {
      expect(screen.getByText("收藏")).toBeInTheDocument();
      expect(toastMock.error).toHaveBeenCalledWith("收藏失败，请重试");
    });
  });

  it("redirects to login when unauthenticated", () => {
    mockIsAuthenticated = false;

    render(<BookmarkButton postId="p1" initialBookmarked={false} />);

    fireEvent.click(screen.getByLabelText("收藏"));

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(toggleMock).not.toHaveBeenCalled();
  });
});
