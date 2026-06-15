import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SpotDetailPage from "./page";

vi.mock("@/lib/backend", () => ({
  fetchFromBackend: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Mock client components
vi.mock("./_components/SpotGallery", () => ({
  default: ({ images }: { images: string[] }) => (
    <div data-testid="spot-gallery" data-image-count={images.length}>
      SpotGallery
    </div>
  ),
}));

vi.mock("./_components/SpotInfo", () => ({
  default: ({ spot }: { spot: { name: string } }) => (
    <div data-testid="spot-info" data-name={spot.name}>
      SpotInfo
    </div>
  ),
}));

vi.mock("@/app/posts/_components/BookmarkButton", () => ({
  default: ({ entityId, entityType }: { entityId: string; entityType: string }) => (
    <div data-testid="bookmark-button" data-entity-id={entityId} data-entity-type={entityType}>
      BookmarkButton
    </div>
  ),
}));

vi.mock("@/app/posts/_components/CommentSection", () => ({
  default: ({ entityId, entityType }: { entityId: string; entityType: string }) => (
    <div data-testid="comment-section" data-entity-id={entityId} data-entity-type={entityType}>
      CommentSection
    </div>
  ),
}));

vi.mock("./_components/RelatedPosts", () => ({
  default: ({ spotId }: { spotId: string }) => (
    <div data-testid="related-posts" data-spot-id={spotId}>
      RelatedPosts
    </div>
  ),
}));

import { fetchFromBackend } from "@/lib/backend";

const fetchMock = vi.mocked(fetchFromBackend);

function mockSpotResponse() {
  return new Response(
    JSON.stringify({
      request_id: "r1",
      id: "s1",
      name: "Forbidden City",
      name_zh: "故宫博物院",
      slug: "forbidden-city",
      description: "A historic palace complex",
      description_zh: "历史宫殿建筑群",
      cover_image: "https://picsum.photos/seed/cover/800/450",
      gallery: [
        "https://picsum.photos/seed/g1/800/450",
        "https://picsum.photos/seed/g2/800/450",
      ],
      tags: ["culture", "history"],
      city_id: "city-1",
      city_name: "Beijing",
      status: "open",
      rating: "4.8",
      view_count: 12500,
      bookmark_count: 830,
      created_at: "2024-06-01T12:00:00Z",
      updated_at: "2024-06-01T12:00:00Z",
    }),
    { status: 200 }
  );
}

function mockBookmarkStatusResponse(bookmarked = false) {
  return new Response(
    JSON.stringify({ request_id: "r2", bookmarked }),
    { status: 200 }
  );
}

describe("SpotDetailPage", () => {
  const params = Promise.resolve({ id: "s1" });

  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("renders spot name, gallery, and interaction components", async () => {
    fetchMock
      .mockResolvedValueOnce(mockSpotResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await SpotDetailPage({ params });
    render(page);

    expect(screen.getByText("Forbidden City")).toBeInTheDocument();
    expect(screen.getByTestId("spot-gallery")).toBeInTheDocument();
    expect(screen.getByTestId("spot-info")).toBeInTheDocument();
    expect(screen.getByTestId("bookmark-button")).toBeInTheDocument();
    expect(screen.getByTestId("comment-section")).toBeInTheDocument();
    expect(screen.getByTestId("related-posts")).toBeInTheDocument();
  });

  it("passes entityId and entityType='spot' to BookmarkButton", async () => {
    fetchMock
      .mockResolvedValueOnce(mockSpotResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await SpotDetailPage({ params });
    render(page);

    const btn = screen.getByTestId("bookmark-button");
    expect(btn).toHaveAttribute("data-entity-id", "s1");
    expect(btn).toHaveAttribute("data-entity-type", "spot");
  });

  it("passes entityId and entityType='spot' to CommentSection", async () => {
    fetchMock
      .mockResolvedValueOnce(mockSpotResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await SpotDetailPage({ params });
    render(page);

    const section = screen.getByTestId("comment-section");
    expect(section).toHaveAttribute("data-entity-id", "s1");
    expect(section).toHaveAttribute("data-entity-type", "spot");
  });

  it("calls notFound when spot returns 404", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error_code: "not_found", message: "Spot not found" }),
          { status: 404 }
        )
      )
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    await expect(SpotDetailPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders tags", async () => {
    fetchMock
      .mockResolvedValueOnce(mockSpotResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await SpotDetailPage({ params });
    render(page);

    expect(screen.getByText("culture")).toBeInTheDocument();
    expect(screen.getByText("history")).toBeInTheDocument();
  });

  it("renders back link to /spots", async () => {
    fetchMock
      .mockResolvedValueOnce(mockSpotResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await SpotDetailPage({ params });
    render(page);

    expect(screen.getByText("返回景点列表")).toBeInTheDocument();
  });

  it("renders gallery with correct image count (cover + gallery)", async () => {
    fetchMock
      .mockResolvedValueOnce(mockSpotResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await SpotDetailPage({ params });
    render(page);

    // cover_image + 2 gallery images = 3
    expect(screen.getByTestId("spot-gallery")).toHaveAttribute("data-image-count", "3");
  });

  it("renders description_zh when available", async () => {
    fetchMock
      .mockResolvedValueOnce(mockSpotResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await SpotDetailPage({ params });
    render(page);

    expect(screen.getByText("历史宫殿建筑群")).toBeInTheDocument();
  });

  it("renders stats row with rating and counts", async () => {
    fetchMock
      .mockResolvedValueOnce(mockSpotResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await SpotDetailPage({ params });
    render(page);

    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText(/浏览/)).toBeInTheDocument();
    expect(screen.getByText(/收藏/)).toBeInTheDocument();
  });

  it("passes spotId to RelatedPosts", async () => {
    fetchMock
      .mockResolvedValueOnce(mockSpotResponse())
      .mockResolvedValueOnce(mockBookmarkStatusResponse());

    const page = await SpotDetailPage({ params });
    render(page);

    const related = screen.getByTestId("related-posts");
    expect(related).toHaveAttribute("data-spot-id", "s1");
  });
});
