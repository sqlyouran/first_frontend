import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "@/app/messages/_components/MessageInput";

vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
  return {
    ...actual,
    Send: (props: Record<string, unknown>) => <span data-testid="send-icon" {...props} />,
  };
});

describe("MessageInput", () => {
  it("renders textarea and send button", () => {
    render(<MessageInput onSend={vi.fn()} status="idle" />);

    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    expect(screen.getByTestId("send-icon")).toBeInTheDocument();
  });

  it("calls onSend with trimmed content when Enter is pressed", async () => {
    const handleSend = vi.fn();
    render(<MessageInput onSend={handleSend} status="idle" />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    await userEvent.type(textarea, "Hello!{enter}");

    expect(handleSend).toHaveBeenCalledWith("Hello!");
  });

  it("does not call onSend for Shift+Enter (newline)", async () => {
    const handleSend = vi.fn();
    render(<MessageInput onSend={handleSend} status="idle" />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    await userEvent.type(textarea, "Hello{shift>}{enter}{/shift}World{enter}");

    expect(handleSend).toHaveBeenCalledWith("Hello\nWorld");
  });

  it("does not send empty message", () => {
    const handleSend = vi.fn();
    render(<MessageInput onSend={handleSend} status="idle" />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

    expect(handleSend).not.toHaveBeenCalled();
  });

  it("disables input when status is disabled", () => {
    render(<MessageInput onSend={vi.fn()} status="disabled" />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    expect(textarea).toBeDisabled();
  });

  it("shows character count when content exceeds 1800 characters", () => {
    render(<MessageInput onSend={vi.fn()} status="idle" />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    const longText = "a".repeat(1850);
    fireEvent.change(textarea, { target: { value: longText } });

    expect(screen.getByText("1850/2000")).toBeInTheDocument();
  });

  it("does not show character count for short content", () => {
    render(<MessageInput onSend={vi.fn()} status="idle" />);

    expect(screen.queryByText(/\d+\/2000/)).toBeNull();
  });

  it("shows rate limited warning", () => {
    render(<MessageInput onSend={vi.fn()} status="rate_limited" />);

    expect(screen.getByText(/Too many messages/)).toBeInTheDocument();
  });

  it("shows 'Cannot send' placeholder when partner is deleted", () => {
    render(<MessageInput onSend={vi.fn()} status="disabled" partnerDeleted />);

    expect(screen.getByPlaceholderText("Cannot send messages to this user")).toBeInTheDocument();
  });

  it("hides send button when partner is deleted", () => {
    render(<MessageInput onSend={vi.fn()} status="disabled" partnerDeleted />);

    expect(screen.queryByTestId("send-icon")).toBeNull();
  });

  it("clears input after successful send", async () => {
    const handleSend = vi.fn();
    render(<MessageInput onSend={handleSend} status="idle" />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    await userEvent.type(textarea, "Test message");
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

    expect(handleSend).toHaveBeenCalledWith("Test message");
    expect(textarea).toHaveValue("");
  });
});
