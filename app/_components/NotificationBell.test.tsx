import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock auth store — must call selector
vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

// Mock notification store — must call selector
vi.mock("@/lib/stores/notifications", () => ({
  useNotificationStore: vi.fn(),
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

import { NotificationBell } from "./NotificationBell";
import { useAuthStore } from "@/lib/stores/auth";
import { useNotificationStore } from "@/lib/stores/notifications";

const useAuthStoreMock = vi.mocked(useAuthStore);
const useNotificationStoreMock = vi.mocked(useNotificationStore);

// Helper: make the mock call the selector against a given state object
function setupMocks(
  authState: { isAuthenticated: boolean },
  notifState: { unreadCount: number; fetchUnreadCount: () => void }
) {
  useAuthStoreMock.mockImplementation((selector: (s: typeof authState) => unknown) =>
    selector(authState)
  );
  useNotificationStoreMock.mockImplementation(
    (selector: (s: typeof notifState) => unknown) => selector(notifState)
  );
}

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render when user is not authenticated", () => {
    setupMocks({ isAuthenticated: false }, { unreadCount: 0, fetchUnreadCount: vi.fn() });

    const { container } = render(<NotificationBell />);
    expect(container.firstChild).toBeNull();
  });

  it("renders bell icon when authenticated", () => {
    setupMocks({ isAuthenticated: true }, { unreadCount: 0, fetchUnreadCount: vi.fn() });

    render(<NotificationBell />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/notifications");
  });

  it("shows no badge when unread count is 0", () => {
    setupMocks({ isAuthenticated: true }, { unreadCount: 0, fetchUnreadCount: vi.fn() });

    const { container } = render(<NotificationBell />);
    const badge = container.querySelector("[data-badge]");
    expect(badge).toBeNull();
  });

  it("shows badge with count when 1-9", () => {
    setupMocks({ isAuthenticated: true }, { unreadCount: 5, fetchUnreadCount: vi.fn() });

    render(<NotificationBell />);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows two-digit count when 10-99", () => {
    setupMocks({ isAuthenticated: true }, { unreadCount: 42, fetchUnreadCount: vi.fn() });

    render(<NotificationBell />);

    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows 99+ when count >= 100", () => {
    setupMocks({ isAuthenticated: true }, { unreadCount: 150, fetchUnreadCount: vi.fn() });

    render(<NotificationBell />);

    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("fetches unread count on mount", () => {
    const fetchMock = vi.fn();
    setupMocks({ isAuthenticated: true }, { unreadCount: 0, fetchUnreadCount: fetchMock });

    render(<NotificationBell />);

    expect(fetchMock).toHaveBeenCalled();
  });
});
