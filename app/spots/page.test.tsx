import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SpotsListPage from "./page";
import * as spotsApi from "@/lib/api/spots";
import * as citiesApi from "@/lib/api/cities";

vi.mock("@/lib/api/spots", () => ({
  fetchSpots: vi.fn(),
}));

vi.mock("@/lib/api/cities", () => ({
  fetchCities: vi.fn(),
}));

// IntersectionObserver polyfill
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

const fetchSpotsMock = vi.mocked(spotsApi.fetchSpots);
const fetchCitiesMock = vi.mocked(citiesApi.fetchCities);

describe("SpotsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchCitiesMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 100, request_id: "c1" },
    });
  });

  it("renders page title and subtitle", async () => {
    fetchSpotsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 12, has_more: false, request_id: "r1" },
    });

    render(<SpotsListPage />);

    await waitFor(() => {
      expect(screen.getByText("探索景点")).toBeInTheDocument();
      expect(screen.getByText("发现中国最值得探索的目的地")).toBeInTheDocument();
    });
  });

  it("renders 4 sort tabs: 最新, 评分最高, 最热, 最多收藏", async () => {
    fetchSpotsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 12, has_more: false, request_id: "r1" },
    });

    render(<SpotsListPage />);

    await waitFor(() => {
      expect(screen.getByText("最新")).toBeInTheDocument();
      expect(screen.getByText("评分最高")).toBeInTheDocument();
      expect(screen.getByText("最热")).toBeInTheDocument();
      expect(screen.getByText("最多收藏")).toBeInTheDocument();
    });
  });

  it("renders city filter select", async () => {
    fetchSpotsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 12, has_more: false, request_id: "r1" },
    });

    render(<SpotsListPage />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /城市筛选/ })).toBeInTheDocument();
    });
  });

  it("renders empty state when no spots", async () => {
    fetchSpotsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 12, has_more: false, request_id: "r1" },
    });

    render(<SpotsListPage />);

    await waitFor(() => {
      expect(screen.getByText("暂无景点")).toBeInTheDocument();
    });
  });

  it("renders spot cards when data loaded", async () => {
    fetchSpotsMock.mockResolvedValue({
      status: 200,
      data: {
        items: [
          {
            id: "s1",
            name: "Forbidden City",
            name_zh: "故宫博物院",
            slug: "forbidden-city",
            cover_image: "https://picsum.photos/800/600",
            tags: ["culture"],
            city_id: "c1",
            city_name: "Beijing",
            rating: "4.9",
            view_count: 1000,
            bookmark_count: 500,
          },
        ],
        total: 1,
        page: 1,
        size: 12,
        has_more: false,
        request_id: "r1",
      },
    });

    render(<SpotsListPage />);

    await waitFor(() => {
      expect(screen.getByText("Forbidden City")).toBeInTheDocument();
      expect(screen.getByText("故宫博物院")).toBeInTheDocument();
    });
  });

  it("shows end-of-list message when no more items", async () => {
    fetchSpotsMock.mockResolvedValue({
      status: 200,
      data: {
        items: [
          {
            id: "s1",
            name: "West Lake",
            name_zh: "西湖",
            slug: "west-lake",
            cover_image: "https://picsum.photos/800/600",
            tags: ["nature"],
            city_id: "c2",
            city_name: "Hangzhou",
            rating: "4.7",
            view_count: 500,
            bookmark_count: 200,
          },
        ],
        total: 1,
        page: 1,
        size: 12,
        has_more: false,
        request_id: "r1",
      },
    });

    render(<SpotsListPage />);

    await waitFor(() => {
      expect(screen.getByText("已经到底啦")).toBeInTheDocument();
    });
  });
});
