import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageIcon } from "@/app/_components/MessageIcon";

const mockFetchTotalUnread = vi.fn();

vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/lib/stores/messages", () => ({
  useMessagesStore: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";

const useAuthStoreMock = vi.mocked(useAuthStore);
const useMessagesStoreMock = vi.mocked(useMessagesStore);

describe("MessageIcon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setupStores(auth: { isAuthenticated: boolean }, messages: { totalUnread: number }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStoreMock.mockImplementation(((selector: any) => selector(auth)) as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useMessagesStoreMock.mockImplementation(((selector: any) =>
      selector({ ...messages, fetchTotalUnread: mockFetchTotalUnread })) as any);
  }

  it("renders nothing when user is not authenticated", () => {
    setupStores({ isAuthenticated: false }, { totalUnread: 0 });

    const { container } = render(<MessageIcon />);

    expect(container.firstChild).toBeNull();
  });

  it("renders MessageCircle icon with link to /messages when authenticated", () => {
    setupStores({ isAuthenticated: true }, { totalUnread: 0 });

    render(<MessageIcon />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/messages");
    expect(link).toHaveAttribute("aria-label", "Messages");
  });

  it("does not show badge when unread count is 0", () => {
    setupStores({ isAuthenticated: true }, { totalUnread: 0 });

    render(<MessageIcon />);

    expect(screen.queryByText(/\d+/)).toBeNull();
  });

  it("shows badge with count when unread is 1-99", () => {
    setupStores({ isAuthenticated: true }, { totalUnread: 5 });

    render(<MessageIcon />);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows 99+ when unread count is 100 or more", () => {
    setupStores({ isAuthenticated: true }, { totalUnread: 150 });

    render(<MessageIcon />);

    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("calls fetchTotalUnread on mount when authenticated", () => {
    setupStores({ isAuthenticated: true }, { totalUnread: 0 });

    render(<MessageIcon />);

    expect(mockFetchTotalUnread).toHaveBeenCalled();
  });
});
