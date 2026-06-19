import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotificationTypeIcon } from "./NotificationTypeIcon";

describe("NotificationTypeIcon", () => {
  it("renders Heart icon for POST_LIKED", () => {
    const { container } = render(<NotificationTypeIcon type="POST_LIKED" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    // Check the wrapper has the correct color class
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("text-rose-500");
  });

  it("renders MessageCircle icon for POST_COMMENTED", () => {
    const { container } = render(<NotificationTypeIcon type="POST_COMMENTED" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("text-blue-500");
  });

  it("renders CornerDownRight icon for COMMENT_REPLIED", () => {
    const { container } = render(<NotificationTypeIcon type="COMMENT_REPLIED" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("text-emerald-500");
  });

  it("renders Bookmark icon for POST_BOOKMARKED", () => {
    const { container } = render(<NotificationTypeIcon type="POST_BOOKMARKED" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("text-amber-500");
  });

  it("applies custom className", () => {
    const { container } = render(
      <NotificationTypeIcon type="POST_LIKED" className="h-6 w-6" />
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("h-6");
    expect(wrapper?.className).toContain("w-6");
  });

  it("has aria-hidden on the wrapper div", () => {
    const { container } = render(<NotificationTypeIcon type="POST_LIKED" />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });
});
