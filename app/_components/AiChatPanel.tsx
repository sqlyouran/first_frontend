"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAiChatStore } from "@/lib/stores/aiChat";

export function AiChatPanel() {
  const messages = useAiChatStore((s) => s.messages);
  const isStreaming = useAiChatStore((s) => s.isStreaming);
  const sendMessage = useAiChatStore((s) => s.sendMessage);
  const conversationId = useAiChatStore((s) => s.conversationId);
  const createConversation = useAiChatStore((s) => s.createConversation);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-create conversation on first mount
  useEffect(() => {
    if (conversationId === null) {
      createConversation();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage(text);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-slate-400">
            Ask me anything about traveling in China!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Input area */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Input
          className="h-10 flex-1"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="icon"
          className="h-10 w-10 bg-blue-700 hover:bg-blue-800"
          disabled={isStreaming || !input.trim()}
          onClick={handleSend}
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
