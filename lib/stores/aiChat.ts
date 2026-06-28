import { create } from "zustand";
import {
  createConversation as apiCreateConversation,
  streamChat,
  type AiMessage,
} from "@/lib/api/aiChat";

interface AiChatState {
  conversationId: string | null;
  messages: AiMessage[];
  isStreaming: boolean;
  error: string | null;
  createConversation: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  reset: () => void;
}

export const useAiChatStore = create<AiChatState>((set, get) => ({
  conversationId: null,
  messages: [],
  isStreaming: false,
  error: null,

  createConversation: async () => {
    const result = await apiCreateConversation();
    set({ conversationId: result.id });
  },

  sendMessage: async (content: string) => {
    const conversationId = get().conversationId;
    if (!conversationId) return;

    const userMessage: AiMessage = { role: "user", content };
    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      error: null,
    }));

    return new Promise<void>((resolve) => {
      streamChat(
        conversationId,
        content,
        // onToken: append to last assistant message or create new one
        (token: string) => {
          set((state) => {
            const msgs = [...state.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant") {
              msgs[msgs.length - 1] = { ...last, content: last.content + token };
            } else {
              msgs.push({ role: "assistant", content: token });
            }
            return { messages: msgs };
          });
        },
        // onDone
        () => {
          set({ isStreaming: false });
          resolve();
        },
        // onError
        (errorMessage: string) => {
          set({ isStreaming: false, error: errorMessage });
          resolve();
        },
      );
    });
  },

  reset: () => {
    set({
      conversationId: null,
      messages: [],
      isStreaming: false,
      error: null,
    });
  },
}));
