import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpotCard, formatCount } from "./SpotCard";
import type { SpotListItem } from "@/lib/api/spots";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const sampleSpot: SpotListItem = {
  id: "test-id",
  name: "Forbidden City",
  name_zh: "故宫博物院",
  slug: "forbidden-city",
  cover_image: "https://picsum.photos/800/600?random=1",
  tags: ["culture", "heritage"],
  city_id: "city-1",
  city_name: "Beijing",
  rating: "4.8",
  view_count: 12300,
  bookmark_count: 3200,
};

describe("SpotCard", () => {
  it("renders spot name and Chinese name", () => {
    render(<SpotCard spot={sampleSpot} />);
    expect(screen.getByText("Forbidden City")).toBeInTheDocument();
    expect(screen.getByText("故宫博物院")).toBeInTheDocument();
  });

  it("renders rating", () => {
    render(<SpotCard spot={sampleSpot} />);
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("renders city name", () => {
    render(<SpotCard spot={sampleSpot} />);
    expect(screen.getByText("Beijing")).toBeInTheDocument();
  });

  it("renders all tags", () => {
    render(<SpotCard spot={sampleSpot} />);
    expect(screen.getByText("culture")).toBeInTheDocument();
    expect(screen.getByText("heritage")).toBeInTheDocument();
  });

  it("renders formatted view and bookmark counts", () => {
    render(<SpotCard spot={sampleSpot} />);
    expect(screen.getByText("12k")).toBeInTheDocument();
    expect(screen.getByText("3.2k")).toBeInTheDocument();
  });

  it("renders cover image as background", () => {
    const { container } = render(<SpotCard spot={sampleSpot} />);
    const imgDiv = container.querySelector("[aria-hidden='true']");
    expect(imgDiv).toBeTruthy();
  });

  it("links to spot detail page", () => {
    const { container } = render(<SpotCard spot={sampleSpot} />);
    const link = container.querySelector("a");
    expect(link).toBeTruthy();
    expect(link?.getAttribute("href")).toBe("/spots/forbidden-city");
  });
});

describe("formatCount", () => {
  it("returns null for 0", () => {
    expect(formatCount(0)).toBeNull();
  });

  it("returns raw number for < 1000", () => {
    expect(formatCount(123)).toBe("123");
    expect(formatCount(999)).toBe("999");
  });

  it("formats thousands with one decimal", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1200)).toBe("1.2k");
    expect(formatCount(9900)).toBe("9.9k");
  });

  it("formats 10000+ as integer k", () => {
    expect(formatCount(10000)).toBe("10k");
    expect(formatCount(25800)).toBe("25k");
  });
});
