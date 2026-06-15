import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SpotGallery from "./SpotGallery";

vi.mock("@/components/ui/carousel", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/ui/carousel")>();
  return {
    ...actual,
    // Use simple pass-through for setApi since we don't need embla behavior in tests
  };
});

describe("SpotGallery", () => {
  it("renders placeholder when images array is empty", () => {
    render(<SpotGallery images={[]} />);

    // Should show the MapPin icon (as svg with class containing map-pin)
    const container = document.querySelector("svg");
    expect(container).toBeInTheDocument();
  });

  it("renders images when provided", () => {
    const images = [
      "https://picsum.photos/seed/spot1/800/450",
      "https://picsum.photos/seed/spot2/800/450",
      "https://picsum.photos/seed/spot3/800/450",
    ];
    render(<SpotGallery images={images} />);

    // Should render image containers
    const imageElements = screen.getAllByRole("img");
    expect(imageElements).toHaveLength(3);
  });

  it("shows thumbnail strip when more than 1 image", () => {
    const images = [
      "https://picsum.photos/seed/spot1/800/450",
      "https://picsum.photos/seed/spot2/800/450",
    ];
    render(<SpotGallery images={images} />);

    // Thumbnail buttons should be present
    const thumbButtons = screen.getAllByRole("button", { name: /缩略图/ });
    expect(thumbButtons).toHaveLength(2);
  });

  it("does not show thumbnail strip when only 1 image", () => {
    const images = ["https://picsum.photos/seed/spot1/800/450"];
    render(<SpotGallery images={images} />);

    const thumbButtons = screen.queryAllByRole("button", { name: /缩略图/ });
    expect(thumbButtons).toHaveLength(0);
  });

  it("renders gradient placeholder with MapPin when no images", () => {
    const { container } = render(<SpotGallery images={[]} />);

    const gradientDiv = container.querySelector(".bg-gradient-to-br");
    expect(gradientDiv).toBeInTheDocument();
  });
});
