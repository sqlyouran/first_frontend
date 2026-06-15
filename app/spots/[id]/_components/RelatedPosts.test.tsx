import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RelatedPosts from "./RelatedPosts";
import * as spotsApi from "@/lib/api/spots";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/api/spots", () => ({
  fetchSpotPosts: vi.fn(),
}));

const fetchSpotPostsMock = vi.mocked(spotsApi.fetchSpotPosts);

describe("RelatedPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title '相关攻略'", () => {
    fetchSpotPostsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 6, request_id: "r1" },
    });

    render(<RelatedPosts spotId="s1" />);
    expect(screen.getByText("相关攻略")).toBeInTheDocument();
  });

  it("shows empty state when no posts", async () => {
    fetchSpotPostsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 6, request_id: "r1" },
    });

    render(<RelatedPosts spotId="s1" />);

    await waitFor(() => {
      expect(screen.getByText("暂无相关攻略")).toBeInTheDocument();
    });
  });

  it("renders post cards when data loaded", async () => {
    fetchSpotPostsMock.mockResolvedValue({
      status: 200,
      data: {
        items: [
          {
            id: "p1",
            title: "Beijing Travel Guide",
            cover_image: "https://picsum.photos/400/300",
            tags: ["beijing"],
            status: "published",
            author_id: "a1",
            created_at: "2024-06-01T12:00:00Z",
            updated_at: "2024-06-01T12:00:00Z",
            comment_count: 0,
            up_vote_count: 0,
            bookmark_count: 0,
            request_id: "r1",
          },
        ],
        total: 1,
        page: 1,
        size: 6,
        request_id: "r1",
      },
    });

    render(<RelatedPosts spotId="s1" />);

    await waitFor(() => {
      expect(screen.getByText("Beijing Travel Guide")).toBeInTheDocument();
    });
  });

  it("calls fetchSpotPosts with correct spotId", () => {
    fetchSpotPostsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 6, request_id: "r1" },
    });

    render(<RelatedPosts spotId="spot-abc" />);

    expect(fetchSpotPostsMock).toHaveBeenCalledWith("spot-abc", { size: 6 });
  });
});
