import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mocks
vi.mock("@/lib/api/interactions", () => ({
  vote: vi.fn(),
  fetchVoteStats: vi.fn(),
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

import VoteButtons from "./VoteButtons";
import { vote, fetchVoteStats } from "@/lib/api/interactions";
import { toast } from "sonner";

const voteMock = vi.mocked(vote);
const fetchVoteStatsMock = vi.mocked(fetchVoteStats);
const toastMock = vi.mocked(toast);

const defaultStats = {
  request_id: "r1",
  up_count: 5,
  down_count: 2,
  user_vote: null as string | null,
};

describe("VoteButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
    fetchVoteStatsMock.mockResolvedValue({ status: 200, data: { ...defaultStats } });
  });

  it("renders initial vote counts", () => {
    render(<VoteButtons postId="p1" initialVoteStats={defaultStats} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows highlighted state when user has voted", () => {
    const stats = { ...defaultStats, user_vote: "up" };
    render(<VoteButtons postId="p1" initialVoteStats={stats} />);

    const upBtn = screen.getByLabelText("赞同");
    expect(upBtn.className).toContain("bg-blue-50");
  });

  it("optimistic update on vote click (authenticated)", async () => {
    mockIsAuthenticated = true;
    voteMock.mockResolvedValue({ status: 200, data: { request_id: "r1", vote_type: "up" } });

    render(<VoteButtons postId="p1" initialVoteStats={defaultStats} />);

    const upBtn = screen.getByLabelText("赞同");
    fireEvent.click(upBtn);

    // Optimistic: count should immediately change to 6
    expect(screen.getByText("6")).toBeInTheDocument();

    await waitFor(() => expect(voteMock).toHaveBeenCalledWith("p1", "up"));
  });

  it("rollback on vote failure", async () => {
    mockIsAuthenticated = true;
    voteMock.mockResolvedValue({
      status: 500,
      error: { request_id: "r1", error_code: "server_error", message: "fail" },
    });

    render(<VoteButtons postId="p1" initialVoteStats={defaultStats} />);

    const upBtn = screen.getByLabelText("赞同");
    fireEvent.click(upBtn);

    // After API fails, should rollback to 5
    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(toastMock.error).toHaveBeenCalledWith("投票失败，请重试");
    });
  });

  it("redirects to login when unauthenticated user clicks vote", () => {
    mockIsAuthenticated = false;

    render(<VoteButtons postId="p1" initialVoteStats={defaultStats} />);

    const upBtn = screen.getByLabelText("赞同");
    fireEvent.click(upBtn);

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(voteMock).not.toHaveBeenCalled();
  });

  it("disables buttons while loading", async () => {
    mockIsAuthenticated = true;
    // Never resolve
    voteMock.mockImplementation(() => new Promise(() => {}));

    render(<VoteButtons postId="p1" initialVoteStats={defaultStats} />);

    const upBtn = screen.getByLabelText("赞同");
    fireEvent.click(upBtn);

    await waitFor(() => {
      expect(upBtn).toBeDisabled();
    });
  });
});
