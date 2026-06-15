import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SpotInfo from "./SpotInfo";

const mockSpot = {
  city_name: "Beijing",
  name: "Forbidden City",
  name_zh: "故宫博物院",
  status: "open",
  rating: "4.8",
  view_count: 12500,
  bookmark_count: 830,
  created_at: "2024-06-01T12:00:00Z",
};

describe("SpotInfo", () => {
  it("renders city name", () => {
    render(<SpotInfo spot={mockSpot} />);
    expect(screen.getByText("Beijing")).toBeInTheDocument();
  });

  it("renders English name", () => {
    render(<SpotInfo spot={mockSpot} />);
    expect(screen.getByText("Forbidden City")).toBeInTheDocument();
  });

  it("renders Chinese name", () => {
    render(<SpotInfo spot={mockSpot} />);
    expect(screen.getByText("故宫博物院")).toBeInTheDocument();
  });

  it("renders status", () => {
    render(<SpotInfo spot={mockSpot} />);
    expect(screen.getByText("open")).toBeInTheDocument();
  });

  it("renders rating", () => {
    render(<SpotInfo spot={mockSpot} />);
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("renders view count with locale formatting", () => {
    render(<SpotInfo spot={mockSpot} />);
    expect(screen.getByText("12,500")).toBeInTheDocument();
  });

  it("renders bookmark count with locale formatting", () => {
    render(<SpotInfo spot={mockSpot} />);
    expect(screen.getByText("830")).toBeInTheDocument();
  });

  it("renders created_at formatted in zh-CN", () => {
    render(<SpotInfo spot={mockSpot} />);
    expect(screen.getByText(/2024年6月1日/)).toBeInTheDocument();
  });

  it("renders all labels", () => {
    render(<SpotInfo spot={mockSpot} />);
    expect(screen.getByText("城市")).toBeInTheDocument();
    expect(screen.getByText("英文名")).toBeInTheDocument();
    expect(screen.getByText("中文名")).toBeInTheDocument();
    expect(screen.getByText("状态")).toBeInTheDocument();
    expect(screen.getByText("评分")).toBeInTheDocument();
    expect(screen.getByText("浏览量")).toBeInTheDocument();
    expect(screen.getByText("收藏量")).toBeInTheDocument();
    expect(screen.getByText("创建时间")).toBeInTheDocument();
  });
});
