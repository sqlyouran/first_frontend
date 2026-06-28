"use client";

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export async function createConversation(): Promise<{ id: string }> {
  const res = await fetch("/api/ai/conversations", { method: "POST" });
  const body = await res.json();
  return { id: body.id };
}

export async function streamChat(
  conversationId: string,
  message: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (message: string) => void,
): Promise<void> {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: conversationId, message }),
    });

    if (!res.body) {
      onError("No response body");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      // Keep the last incomplete chunk in the buffer
      buffer = events.pop() ?? "";

      for (const eventBlock of events) {
        const lines = eventBlock.split("\n");
        let eventName = "";
        let eventData = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventName = line.slice(6);
          } else if (line.startsWith("data:")) {
            eventData = line.slice(5);
          }
        }

        if (eventName === "token") {
          onToken(eventData);
        } else if (eventName === "done") {
          onDone();
          return;
        } else if (eventName === "error") {
          onError(eventData);
          return;
        }
      }
    }

    // Stream ended without a done event — treat as done
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : "Unknown error");
  }
}
