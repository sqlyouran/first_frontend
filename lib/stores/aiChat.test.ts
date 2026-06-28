import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/aiChat", () => ({
  createConversation: vi.fn(),
  streamChat: vi.fn(),
}));

import { createConversation, streamChat } from "@/lib/api/aiChat";
import { useAiChatStore } from "./aiChat";

const createConversationMock = vi.mocked(createConversation);
const streamChatMock = vi.mocked(streamChat);

describe("useAiChatStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAiChatStore.setState({
      conversationId: null,
      messages: [],
      isStreaming: false,
      error: null,
    });
  });

  describe("initial state", () => {
    it("has conversationId null, empty messages, not streaming, no error", () => {
      const state = useAiChatStore.getState();

      expect(state.conversationId).toBeNull();
      expect(state.messages).toEqual([]);
      expect(state.isStreaming).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("createConversation", () => {
    it("calls API and sets conversationId", async () => {
      createConversationMock.mockResolvedValue({ id: "conv-abc" });

      await useAiChatStore.getState().createConversation();

      expect(createConversationMock).toHaveBeenCalled();
      expect(useAiChatStore.getState().conversationId).toBe("conv-abc");
    });
  });

  describe("sendMessage", () => {
    it("appends user message, sets isStreaming, and receives assistant tokens", async () => {
      useAiChatStore.setState({ conversationId: "conv-1" });

      // Mock streamChat to immediately invoke onToken + onDone
      streamChatMock.mockImplementation(async (_id, _msg, onToken, onDone, _onError) => {
        onToken("Hello");
        onToken(" world");
        onDone();
      });

      await useAiChatStore.getState().sendMessage("Hi there");

      const state = useAiChatStore.getState();
      // User message should be appended
      expect(state.messages[0]).toEqual({ role: "user", content: "Hi there" });
      // Assistant message should be appended with concatenated tokens
      expect(state.messages[1]).toEqual({ role: "assistant", content: "Hello world" });
      // After onDone, isStreaming should be false
      expect(state.isStreaming).toBe(false);
    });

    it("sets isStreaming to true while streaming", async () => {
      useAiChatStore.setState({ conversationId: "conv-1" });

      let capturedOnDone: (() => void) | null = null;
      streamChatMock.mockImplementation(async (_id, _msg, _onToken, onDone, _onError) => {
        capturedOnDone = onDone;
        // Don't call onDone yet — leave streaming in progress
      });

      // Start but don't await (it won't resolve since onDone isn't called)
      const promise = useAiChatStore.getState().sendMessage("Hi");

      // isStreaming should be true while stream is in progress
      expect(useAiChatStore.getState().isStreaming).toBe(true);

      // Complete the stream
      capturedOnDone!();
      await promise;
    });

    it("sets error on stream failure", async () => {
      useAiChatStore.setState({ conversationId: "conv-1" });

      streamChatMock.mockImplementation(async (_id, _msg, _onToken, _onDone, onError) => {
        onError("Connection lost");
      });

      await useAiChatStore.getState().sendMessage("Hi");

      expect(useAiChatStore.getState().error).toBe("Connection lost");
      expect(useAiChatStore.getState().isStreaming).toBe(false);
    });
  });

  describe("reset", () => {
    it("clears all state back to initial values", () => {
      useAiChatStore.setState({
        conversationId: "conv-1",
        messages: [{ role: "user", content: "Hi" }],
        isStreaming: true,
        error: "some error",
      });

      useAiChatStore.getState().reset();

      const state = useAiChatStore.getState();
      expect(state.conversationId).toBeNull();
      expect(state.messages).toEqual([]);
      expect(state.isStreaming).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
