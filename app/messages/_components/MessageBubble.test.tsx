import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/app/messages/_components/MessageBubble";

vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
  return {
    ...actual,
    CheckCheck: (props: Record<string, unknown>) => <span data-testid="check-check" {...props} />,
  };
});

describe("MessageBubble", () => {
  const baseMessage = {
    message_id: "m1",
    sender_id: "user1",
    content: "Hello, how are you?",
    read: false,
    created_at: "2024-06-15T10:30:00Z",
  };

  it("renders own message on the right side with blue background", () => {
    render(<MessageBubble message={baseMessage} isOwn={true} />);

    const bubble = screen.getByText("Hello, how are you?").closest("div");
    expect(bubble).toHaveClass("bg-blue-600");
    expect(bubble).toHaveClass("text-white");
  });

  it("renders other's message on the left side with gray background", () => {
    render(<MessageBubble message={baseMessage} isOwn={false} />);

    const bubble = screen.getByText("Hello, how are you?").closest("div");
    expect(bubble).toHaveClass("bg-slate-100");
    expect(bubble).toHaveClass("text-slate-900");
  });

  it("shows read indicator (CheckCheck) for own messages that are read", () => {
    const msg = { ...baseMessage, read: true };
    render(<MessageBubble message={msg} isOwn={true} />);

    expect(screen.getByTestId("check-check")).toBeInTheDocument();
  });

  it("does not show read indicator for own messages that are unread", () => {
    render(<MessageBubble message={baseMessage} isOwn={true} />);

    expect(screen.queryByTestId("check-check")).toBeNull();
  });

  it("does not show read indicator for other's messages", () => {
    const msg = { ...baseMessage, read: true };
    render(<MessageBubble message={msg} isOwn={false} />);

    expect(screen.queryByTestId("check-check")).toBeNull();
  });

  it("renders message content", () => {
    render(<MessageBubble message={baseMessage} isOwn={true} />);

    expect(screen.getByText("Hello, how are you?")).toBeInTheDocument();
  });
});
