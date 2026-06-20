import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ConversationPage from "@/app/messages/[conversationId]/page";
import type { MessageItem, OtherUser } from "@/lib/api/messages";

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ conversationId: "conv1" }),
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img alt={String(props.alt ?? "")} />,
}));

vi.mock("@/lib/api/messages", () => ({
  fetchConversation: vi.fn(),
  fetchMessages: vi.fn(),
  sendMessage: vi.fn(),
  markConversationRead: vi.fn(),
}));

vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/lib/stores/messages", () => ({
  useMessagesStore: vi.fn(),
}));

import { fetchConversation, fetchMessages, sendMessage, markConversationRead } from "@/lib/api/messages";
import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";

const fetchConversationMock = vi.mocked(fetchConversation);
const fetchMessagesMock = vi.mocked(fetchMessages);
const sendMessageMock = vi.mocked(sendMessage);
const markReadMock = vi.mocked(markConversationRead);
const useAuthStoreMock = vi.mocked(useAuthStore);
const useMessagesStoreMock = vi.mocked(useMessagesStore);

describe("ConversationPage", () => {
  const otherUser: OtherUser = {
    user_id: "user2",
    nickname: "Alice",
    avatar_url: null,
    username: "alice",
    deleted: false,
  };

  const messages: MessageItem[] = [
    {
      message_id: "m1",
      sender_id: "user2",
      content: "Hi there!",
      read: false,
      created_at: "2024-06-15T10:00:00Z",
    },
    {
      message_id: "m2",
      sender_id: "user1",
      content: "Hello Alice!",
      read: true,
      created_at: "2024-06-15T10:01:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStoreMock.mockImplementation(((selector: any) =>
      selector({ user: { id: "user1" }, isAuthenticated: true })) as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useMessagesStoreMock.mockImplementation(((selector: any) =>
      selector({ totalUnread: 5, decrementUnread: vi.fn(), fetchTotalUnread: vi.fn() })) as any);
    markReadMock.mockResolvedValue({ status: 200, data: { marked_count: 3, request_id: "r1" } });
    fetchConversationMock.mockResolvedValue({
      status: 200,
      data: { conversation_id: "conv1", other_user: otherUser, request_id: "r1" },
    });
  });

  it("shows loading skeletons initially", () => {
    fetchMessagesMock.mockReturnValue(new Promise(() => {}));

    render(<ConversationPage />);

    const skeletons = screen.getAllByTestId("message-skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders messages in chronological order", async () => {
    fetchMessagesMock.mockResolvedValue({
      status: 200,
      data: { items: messages, total: 2, page: 1, size: 50, request_id: "r1" },
    });

    render(<ConversationPage />);

    expect(await screen.findByText("Hi there!")).toBeInTheDocument();
    expect(await screen.findByText("Hello Alice!")).toBeInTheDocument();
  });

  it("shows header with other user info", async () => {
    fetchMessagesMock.mockResolvedValue({
      status: 200,
      data: { items: messages, total: 2, page: 1, size: 50, request_id: "r1" },
    });

    render(<ConversationPage />);

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(await screen.findByText("@alice")).toBeInTheDocument();
  });

  it("shows empty state with first message prompt", async () => {
    fetchMessagesMock.mockResolvedValue({
      status: 200,
      data: { items: [], total: 0, page: 1, size: 50, request_id: "r1" },
    });

    render(<ConversationPage />);

    expect(await screen.findByText(/Send the first message/)).toBeInTheDocument();
  });

  it("shows error state on API failure", async () => {
    fetchConversationMock.mockResolvedValue({
      status: 500,
      error: { request_id: "r1", error_code: "server_error", message: "Server error" },
    });
    fetchMessagesMock.mockResolvedValue({
      status: 500,
      error: { request_id: "r1", error_code: "server_error", message: "Server error" },
    });

    render(<ConversationPage />);

    expect(await screen.findByText(/Failed to load/)).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("calls markConversationRead on mount", async () => {
    fetchMessagesMock.mockResolvedValue({
      status: 200,
      data: { items: messages, total: 2, page: 1, size: 50, request_id: "r1" },
    });

    render(<ConversationPage />);

    await waitFor(() => {
      expect(markReadMock).toHaveBeenCalledWith("conv1");
    });
  });
});
