import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/stores/aiChat", () => ({
  useAiChatStore: vi.fn(),
}));

import { useAiChatStore } from "@/lib/stores/aiChat";
import { AiChatPanel } from "./AiChatPanel";

const useAiChatStoreMock = vi.mocked(useAiChatStore);

interface StoreState {
  conversationId: string | null;
  messages: { role: "user" | "assistant"; content: string }[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  createConversation: () => Promise<void>;
  reset: () => void;
}

function setupStore(overrides: Partial<StoreState> = {}) {
  const state: StoreState = {
    conversationId: null,
    messages: [],
    isStreaming: false,
    error: null,
    sendMessage: vi.fn(),
    createConversation: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
  useAiChatStoreMock.mockImplementation(
    (selector: (s: StoreState) => unknown) => selector(state),
  );
  return state;
}

describe("AiChatPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows guidance text when messages is empty", () => {
    setupStore();

    render(<AiChatPanel />);

    expect(screen.getByText(/ask me/i)).toBeInTheDocument();
  });

  it("renders user message as right-aligned blue bubble", () => {
    setupStore({
      messages: [{ role: "user", content: "Where is Beijing?" }],
    });

    render(<AiChatPanel />);

    const bubble = screen.getByText("Where is Beijing?");
    expect(bubble).toBeInTheDocument();
    // Find the parent bubble element that has styling
    const bubbleWrapper = bubble.closest("[class]");
    expect(bubbleWrapper?.className).toMatch(/bg-blue-700/);
  });

  it("renders assistant message as left-aligned gray bubble", () => {
    setupStore({
      messages: [{ role: "assistant", content: "Beijing is the capital of China." }],
    });

    render(<AiChatPanel />);

    const bubble = screen.getByText("Beijing is the capital of China.");
    expect(bubble).toBeInTheDocument();
    const bubbleWrapper = bubble.closest("[class]");
    expect(bubbleWrapper?.className).toMatch(/bg-slate-100|bg-slate-200/);
  });

  it("disables send button and shows Loader2 when streaming", () => {
    setupStore({ isStreaming: true });

    render(<AiChatPanel />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    // Loader2 is an SVG with animate-spin class
    const svg = button.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("sends message on Enter and clears input", async () => {
    const sendMessage = vi.fn();
    setupStore({ sendMessage });
    const user = userEvent.setup();

    render(<AiChatPanel />);

    const input = screen.getByRole("textbox");
    await user.type(input, "hello");
    await user.keyboard("{Enter}");

    expect(sendMessage).toHaveBeenCalledWith("hello");
    expect((input as HTMLInputElement).value).toBe("");
  });
});
