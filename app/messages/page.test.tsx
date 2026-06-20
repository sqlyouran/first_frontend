import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MessagesPage from "@/app/messages/page";
import type { ConversationItem } from "@/lib/api/messages";

vi.mock("@/lib/api/messages", () => ({
  fetchConversations: vi.fn(),
}));

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

import { fetchConversations } from "@/lib/api/messages";
import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";

const fetchConversationsMock = vi.mocked(fetchConversations);
const useAuthStoreMock = vi.mocked(useAuthStore);
const useMessagesStoreMock = vi.mocked(useMessagesStore);

describe("MessagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStoreMock.mockImplementation(((selector: any) =>
      selector({ isAuthenticated: true })) as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useMessagesStoreMock.mockImplementation(((selector: any) =>
      selector({ totalUnread: 0, fetchTotalUnread: vi.fn() })) as any);
  });

  it("shows loading skeletons initially", () => {
    fetchConversationsMock.mockReturnValue(new Promise(() => {}));

    render(<MessagesPage />);

    const skeletons = screen.getAllByTestId("conversation-skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("shows conversation list on success", async () => {
    const conversations: ConversationItem[] = [
      {
        conversation_id: "c1",
        other_user: { user_id: "u1", nickname: "Alice", avatar_url: null, username: "alice", deleted: false },
        last_message: "Hi there!",
        last_message_at: new Date().toISOString(),
        unread_count: 2,
      },
      {
        conversation_id: "c2",
        other_user: { user_id: "u2", nickname: "Bob", avatar_url: null, username: "bob", deleted: false },
        last_message: "See you!",
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      },
    ];
    fetchConversationsMock.mockResolvedValue({
      status: 200,
      data: { items: conversations, total: 2, page: 1, size: 20, request_id: "r1" },
    });

    render(<MessagesPage />);

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(await screen.findByText("Bob")).toBeInTheDocument();
  });

  it("shows empty state when no conversations", async () => {
    fetchConversationsMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 20, request_id: "r1" },
    });

    render(<MessagesPage />);

    expect(await screen.findByText("No conversations yet")).toBeInTheDocument();
    expect(screen.getByText("Browse Travelers")).toBeInTheDocument();
  });

  it("shows error state on API failure", async () => {
    fetchConversationsMock.mockResolvedValue({
      status: 500,
      error: { request_id: "r1", error_code: "server_error", message: "Server error" },
    });

    render(<MessagesPage />);

    expect(await screen.findByText(/Failed to load conversations/)).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("shows page header with title", () => {
    fetchConversationsMock.mockReturnValue(new Promise(() => {}));

    render(<MessagesPage />);

    expect(screen.getByText("Messages")).toBeInTheDocument();
  });
});
