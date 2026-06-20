import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { NotificationItem as NotificationItemType } from "@/lib/api/notifications";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

import { NotificationItem } from "./NotificationItem";
import { toast } from "sonner";

const toastMock = vi.mocked(toast);

function createNotification(
  overrides: Partial<NotificationItemType> = {}
): NotificationItemType {
  return {
    id: "n1",
    type: "POST_LIKED",
    actor_id: "u2",
    actor_nickname: "Alice",
    actor_avatar_url: null,
    actor_username: "alice",
    entity_id: "p1",
    entity_type: "POST",
    target_title: "My Trip to Beijing",
    content_preview: null,
    read: false,
    created_at: "2024-06-15T10:00:00Z",
    ...overrides,
  };
}

describe("NotificationItem", () => {
  it("renders actor nickname and target title", () => {
    const notification = createNotification();
    render(<NotificationItem notification={notification} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("My Trip to Beijing")).toBeInTheDocument();
  });

  it("shows unread indicator when notification is unread", () => {
    const notification = createNotification({ read: false });
    const { container } = render(
      <NotificationItem notification={notification} />
    );

    const unreadDot = container.querySelector("[data-unread]");
    expect(unreadDot).toBeTruthy();
    expect(unreadDot).toHaveAttribute("aria-label", "未读");
  });

  it("does not show unread indicator when read", () => {
    const notification = createNotification({ read: true });
    const { container } = render(
      <NotificationItem notification={notification} />
    );

    const unreadDot = container.querySelector("[data-unread]");
    expect(unreadDot).toBeNull();
  });

  it("shows content preview for comment/reply types", () => {
    const notification = createNotification({
      type: "POST_COMMENTED",
      content_preview: "Great trip report!",
    });
    render(<NotificationItem notification={notification} />);

    expect(screen.getByText("Great trip report!")).toBeInTheDocument();
  });

  it("links to post when entity_id is present", () => {
    const notification = createNotification({ entity_id: "p1" });
    render(<NotificationItem notification={notification} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/posts/p1");
  });

  it("shows deleted target message when target_title is null", () => {
    const notification = createNotification({ target_title: null });
    render(<NotificationItem notification={notification} />);

    expect(screen.getByText("[内容已删除]")).toBeInTheDocument();
  });

  it("shows toast when clicking deleted target", async () => {
    const notification = createNotification({ target_title: null });
    render(<NotificationItem notification={notification} />);

    const link = screen.getByRole("link");
    link.click();

    expect(toastMock.error).toHaveBeenCalledWith("该内容已被删除");
  });

  it("renders relative time", () => {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const notification = createNotification({ created_at: fiveMinAgo });
    render(<NotificationItem notification={notification} />);

    expect(screen.getByText("5m")).toBeInTheDocument();
  });

  it("calls onClick when provided", async () => {
    const onClick = vi.fn();
    const notification = createNotification();
    render(<NotificationItem notification={notification} onClick={onClick} />);

    const item = screen.getByRole("link");
    item.click();

    expect(onClick).toHaveBeenCalledWith(notification);
  });
});
