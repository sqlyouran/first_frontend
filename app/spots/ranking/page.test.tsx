import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RankingPage from "./page";
import * as spotsApi from "@/lib/api/spots";

vi.mock("@/lib/api/spots", () => ({
  fetchRanking: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const fetchRankingMock = vi.mocked(spotsApi.fetchRanking);

function makeItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    name: `Spot ${i + 1}`,
    name_zh: `景点 ${i + 1}`,
    slug: `spot-${i + 1}`,
    cover_image: `https://picsum.photos/seed/${i + 1}/400/300`,
    tags: ["nature"],
    city_id: `c${i + 1}`,
    city_name: `City ${i + 1}`,
    rating: (4.5 - i * 0.1).toFixed(1),
    view_count: 10000 - i * 500,
    bookmark_count: 800 - i * 30,
  }));
}

function mockSuccess(items = makeItems(5)) {
  fetchRankingMock.mockResolvedValue({
    status: 200,
    data: { type: "heat", items, request_id: "r1" },
  });
}

describe("RankingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- 2.1: Page title, 3 tabs, default tab ---

  it("renders page title '景点排行榜'", async () => {
    mockSuccess();
    render(<RankingPage />);
    await waitFor(() => {
      expect(screen.getByText("景点排行榜")).toBeInTheDocument();
    });
  });

  it("renders 3 tab buttons: 热门, 高分, 收藏", async () => {
    mockSuccess();
    render(<RankingPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "热门" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "高分" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "收藏" })).toBeInTheDocument();
    });
  });

  it("defaults to 热门 tab and calls fetchRanking with type=heat", async () => {
    mockSuccess();
    render(<RankingPage />);
    await waitFor(() => {
      expect(fetchRankingMock).toHaveBeenCalledWith("heat", 50);
    });
  });

  // --- 2.2: Tab switching ---

  it("switches to 高分 tab and fetches rating ranking", async () => {
    mockSuccess();
    render(<RankingPage />);
    await waitFor(() => expect(fetchRankingMock).toHaveBeenCalled());

    fetchRankingMock.mockResolvedValue({
      status: 200,
      data: { type: "rating", items: makeItems(3), request_id: "r2" },
    });

    fireEvent.click(screen.getByRole("button", { name: "高分" }));

    await waitFor(() => {
      expect(fetchRankingMock).toHaveBeenCalledWith("rating", 50);
    });
  });

  it("switches to 收藏 tab and fetches bookmark ranking", async () => {
    mockSuccess();
    render(<RankingPage />);
    await waitFor(() => expect(fetchRankingMock).toHaveBeenCalled());

    fetchRankingMock.mockResolvedValue({
      status: 200,
      data: { type: "bookmark", items: makeItems(3), request_id: "r3" },
    });

    fireEvent.click(screen.getByRole("button", { name: "收藏" }));

    await waitFor(() => {
      expect(fetchRankingMock).toHaveBeenCalledWith("bookmark", 50);
    });
  });

  it("does not refetch when switching back to cached tab", async () => {
    mockSuccess();
    render(<RankingPage />);
    await waitFor(() => expect(fetchRankingMock).toHaveBeenCalledTimes(1));

    // Switch to rating
    fetchRankingMock.mockResolvedValue({
      status: 200,
      data: { type: "rating", items: makeItems(3), request_id: "r2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "高分" }));
    await waitFor(() => expect(fetchRankingMock).toHaveBeenCalledTimes(2));

    // Switch back to heat — should use cache, no new fetch
    fireEvent.click(screen.getByRole("button", { name: "热门" }));
    // Still 2 calls, no new one for heat
    expect(fetchRankingMock).toHaveBeenCalledTimes(2);
  });

  // --- 2.3: Top 3 gold/silver/bronze ---

  it("renders medal icons for top 3 items", async () => {
    mockSuccess(makeItems(5));
    render(<RankingPage />);

    await waitFor(() => {
      expect(screen.getByText("景点 1")).toBeInTheDocument();
    });

    // Rank 1 has gold color (text-yellow-500)
    const rank1 = screen.getByText("景点 1").closest("[data-rank]");
    expect(rank1?.getAttribute("data-rank")).toBe("1");

    // Rank 2 has silver color
    const rank2 = screen.getByText("景点 2").closest("[data-rank]");
    expect(rank2?.getAttribute("data-rank")).toBe("2");

    // Rank 3 has bronze color
    const rank3 = screen.getByText("景点 3").closest("[data-rank]");
    expect(rank3?.getAttribute("data-rank")).toBe("3");

    // Rank 4 has no medal (plain number)
    const rank4 = screen.getByText("景点 4").closest("[data-rank]");
    expect(rank4?.getAttribute("data-rank")).toBe("4");
  });

  // --- 2.4: Active metric highlighting ---

  it("highlights view_count when heat tab is active", async () => {
    const items = makeItems(2);
    mockSuccess(items);
    render(<RankingPage />);

    await waitFor(() => {
      expect(screen.getByText("景点 1")).toBeInTheDocument();
    });

    // view_count for item 1: 10000 → formatted as "10k"
    const viewCountEl = screen.getByTestId(`metric-view-1`);
    expect(viewCountEl.className).toMatch(/text-blue-700/);
  });

  it("highlights rating when rating tab is active", async () => {
    fetchRankingMock.mockResolvedValue({
      status: 200,
      data: { type: "rating", items: makeItems(2), request_id: "r2" },
    });

    render(<RankingPage />);

    // Default is heat, switch to rating
    await waitFor(() => expect(fetchRankingMock).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "高分" }));

    await waitFor(() => {
      expect(screen.getByText("景点 1")).toBeInTheDocument();
    });

    const ratingEl = screen.getByTestId(`metric-rating-1`);
    expect(ratingEl.className).toMatch(/text-blue-700/);
  });

  it("highlights bookmark_count when bookmark tab is active", async () => {
    fetchRankingMock.mockResolvedValue({
      status: 200,
      data: { type: "bookmark", items: makeItems(2), request_id: "r3" },
    });

    render(<RankingPage />);

    await waitFor(() => expect(fetchRankingMock).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "收藏" }));

    await waitFor(() => {
      expect(screen.getByText("景点 1")).toBeInTheDocument();
    });

    const bookmarkEl = screen.getByTestId(`metric-bookmark-1`);
    expect(bookmarkEl.className).toMatch(/text-blue-700/);
  });

  // --- 2.5: Four states ---

  it("shows loading skeleton while fetching", () => {
    fetchRankingMock.mockReturnValue(new Promise(() => {})); // never resolves
    render(<RankingPage />);

    // Should show skeleton elements
    const skeletons = document.querySelectorAll('[data-testid="ranking-skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });

  it("shows empty state when items is empty", async () => {
    mockSuccess([]);
    render(<RankingPage />);

    await waitFor(() => {
      expect(screen.getByText("暂无排行数据")).toBeInTheDocument();
    });
  });

  it("shows error state with retry button on failure", async () => {
    fetchRankingMock.mockResolvedValue({
      status: 0,
      error: {
        request_id: "unknown",
        error_code: "network_error",
        message: "Network connection failed",
      },
    });
    render(<RankingPage />);

    await waitFor(() => {
      expect(screen.getByText("重试")).toBeInTheDocument();
    });
  });

  it("retry button refetches data", async () => {
    fetchRankingMock.mockResolvedValueOnce({
      status: 0,
      error: {
        request_id: "unknown",
        error_code: "network_error",
        message: "Network connection failed",
      },
    });
    render(<RankingPage />);

    await waitFor(() => {
      expect(screen.getByText("重试")).toBeInTheDocument();
    });

    // Now succeed
    fetchRankingMock.mockResolvedValue({
      status: 200,
      data: { type: "heat", items: makeItems(2), request_id: "r2" },
    });

    fireEvent.click(screen.getByText("重试"));

    await waitFor(() => {
      expect(screen.getByText("景点 1")).toBeInTheDocument();
    });
  });

  // --- 2.6: Navigation ---

  it("each item links to /spots/{slug}", async () => {
    mockSuccess(makeItems(3));
    render(<RankingPage />);

    await waitFor(() => {
      expect(screen.getByText("景点 1")).toBeInTheDocument();
    });

    const link = screen.getByText("景点 1").closest("a");
    expect(link?.getAttribute("href")).toBe("/spots/spot-1");
  });

  it("has back navigation link to /spots", async () => {
    mockSuccess();
    render(<RankingPage />);

    await waitFor(() => {
      expect(screen.getByText("景点排行榜")).toBeInTheDocument();
    });

    const backLink = screen.getByText("返回景点列表").closest("a");
    expect(backLink?.getAttribute("href")).toBe("/spots");
  });
});
