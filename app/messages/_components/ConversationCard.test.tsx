import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConversationCard } from "@/app/messages/_components/ConversationCard";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("ConversationCard", () => {
  const baseConversation = {
    conversation_id: "conv1",
    other_user: {
      user_id: "user-1",
      nickname: "Alice",
      avatar_url: "https://example.com/avatar.jpg",
      username: "alice",
      deleted: false,
    },
    last_message: "See you tomorrow!",
    last_message_at: new Date().toISOString(),
    unread_count: 0,
  };

  it("renders conversation card with user info", () => {
    render(<ConversationCard conversation={baseConversation} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
    expect(screen.getByText("See you tomorrow!")).toBeInTheDocument();
  });

  it("renders link to conversation detail", () => {
    render(<ConversationCard conversation={baseConversation} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/messages/conv1");
  });

  it("shows unread badge when unread_count > 0", () => {
    const conv = { ...baseConversation, unread_count: 3 };
    render(<ConversationCard conversation={conv} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("does not show unread badge when unread_count is 0", () => {
    render(<ConversationCard conversation={baseConversation} />);

    expect(screen.queryByText("0")).toBeNull();
  });

  it("shows 'Deleted user' when other user is deleted", () => {
    const conv = {
      ...baseConversation,
      other_user: { ...baseConversation.other_user, deleted: true },
    };
    render(<ConversationCard conversation={conv} />);

    expect(screen.getByText("Deleted user")).toBeInTheDocument();
  });

  it("shows relative time for last message", () => {
    const conv = {
      ...baseConversation,
      last_message_at: new Date(Date.now() - 30 * 1000).toISOString(),
    };
    render(<ConversationCard conversation={conv} />);

    expect(screen.getByText("just now")).toBeInTheDocument();
  });
});
