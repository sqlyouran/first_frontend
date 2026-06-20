import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock API layer
vi.mock("@/lib/api/notifications", () => ({
  fetchNotifications: vi.fn(),
  markAsRead: vi.fn(),
  markAllRead: vi.fn(),
}));

// Mock store
vi.mock("@/lib/stores/notifications", () => ({
  useNotificationStore: vi.fn(() => ({
    unreadCount: 0,
    decrementUnread: vi.fn(),
    resetUnread: vi.fn(),
  })),
}));

// Mock next/link
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

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import NotificationsPage from "./page";
import { fetchNotifications, markAllRead } from "@/lib/api/notifications";

const fetchNotificationsMock = vi.mocked(fetchNotifications);
const markAllReadMock = vi.mocked(markAllRead);

describe("NotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton initially", () => {
    fetchNotificationsMock.mockReturnValue(new Promise(() => {}));

    render(<NotificationsPage />);

    const skeletons = screen.getAllByTestId("notification-skeleton");
    expect(skeletons.length).toBe(6);

    const loadingContainer = screen.getByLabelText("正在加载通知");
    expect(loadingContainer).toHaveAttribute("aria-busy", "true");
  });

  it("shows notification list on success", async () => {
    fetchNotificationsMock.mockResolvedValue({
      status: 200,
      data: {
        request_id: "r1",
        items: [
          {
            id: "n1",
            type: "POST_LIKED",
            actor_id: "u2",
            actor_nickname: "Alice",
            actor_avatar_url: null,
            actor_username: "alice",
            entity_id: "p1",
            entity_type: "POST",
            target_title: "My Trip",
            content_preview: null,
            read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: "n2",
            type: "POST_COMMENTED",
            actor_id: "u3",
            actor_nickname: "Bob",
            actor_avatar_url: null,
            actor_username: "bob",
            entity_id: "p2",
            entity_type: "POST",
            target_title: "Travel Guide",
            content_preview: "Nice guide!",
            read: true,
            created_at: new Date().toISOString(),
          },
        ],
        total: 2,
        page: 1,
        size: 20,
      },
    });

    render(<NotificationsPage />);

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("My Trip")).toBeInTheDocument();
    expect(screen.getByText("Travel Guide")).toBeInTheDocument();

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
  });

  it("shows empty state when no notifications", async () => {
    fetchNotificationsMock.mockResolvedValue({
      status: 200,
      data: {
        request_id: "r1",
        items: [],
        total: 0,
        page: 1,
        size: 20,
      },
    });

    render(<NotificationsPage />);

    expect(await screen.findByText("暂无通知")).toBeInTheDocument();
  });

  it("shows error state with retry button on API failure", async () => {
    fetchNotificationsMock.mockResolvedValue({
      status: 500,
      error: {
        request_id: "r1",
        error_code: "server_error",
        message: "Internal error",
      },
    });

    render(<NotificationsPage />);

    expect(await screen.findByText("加载失败")).toBeInTheDocument();
    expect(screen.getByText("重试")).toBeInTheDocument();
  });

  it("renders page heading with correct style", async () => {
    fetchNotificationsMock.mockResolvedValue({
      status: 200,
      data: {
        request_id: "r1",
        items: [],
        total: 0,
        page: 1,
        size: 20,
      },
    });

    render(<NotificationsPage />);

    const heading = await screen.findByText("通知");
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H1");
    expect(heading.className).toContain("text-3xl");
  });

  it("shows mark all as read button when there are notifications", async () => {
    fetchNotificationsMock.mockResolvedValue({
      status: 200,
      data: {
        request_id: "r1",
        items: [
          {
            id: "n1",
            type: "POST_LIKED",
            actor_id: "u2",
            actor_nickname: "Alice",
            actor_avatar_url: null,
            actor_username: "alice",
            entity_id: "p1",
            entity_type: "POST",
            target_title: "My Trip",
            content_preview: null,
            read: false,
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        size: 20,
      },
    });

    render(<NotificationsPage />);

    expect(
      await screen.findByText("全部标记已读")
    ).toBeInTheDocument();
  });

  it("hides mark all as read button when no notifications", async () => {
    fetchNotificationsMock.mockResolvedValue({
      status: 200,
      data: {
        request_id: "r1",
        items: [],
        total: 0,
        page: 1,
        size: 20,
      },
    });

    render(<NotificationsPage />);
    await screen.findByText("暂无通知");

    expect(screen.queryByText("全部标记已读")).toBeNull();
  });
});
