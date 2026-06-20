"use client";

import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { Send } from "lucide-react";

type MessageInputStatus = "idle" | "typing" | "sending" | "disabled" | "rate_limited";

interface MessageInputProps {
  onSend: (content: string) => void;
  status: MessageInputStatus;
  partnerDeleted?: boolean;
}

const MAX_CHARS = 2000;
const CHAR_COUNT_THRESHOLD = 1800;

export function MessageInput({ onSend, status, partnerDeleted }: MessageInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = status === "disabled" || status === "sending" || status === "rate_limited";

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const lineHeight = 24;
    const maxHeight = lineHeight * 5;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = content.trim();
      if (!trimmed || isDisabled || trimmed.length > MAX_CHARS) return;
      onSend(trimmed);
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setContent(value);
    }
    autoResize();
  };

  const handleSendClick = () => {
    const trimmed = content.trim();
    if (!trimmed || isDisabled || trimmed.length > MAX_CHARS) return;
    onSend(trimmed);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const showCharCount = content.length >= CHAR_COUNT_THRESHOLD;
  const placeholder = status === "disabled" && partnerDeleted
    ? "Cannot send messages to this user"
    : "Type a message...";

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3">
      {status === "rate_limited" && (
        <div className="mb-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
          Too many messages. Please wait a moment before sending again.
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ minHeight: "40px", maxHeight: "120px" }}
        />
        {!(status === "disabled" && partnerDeleted) && (
          <button
            type="button"
            onClick={handleSendClick}
            disabled={isDisabled || !content.trim()}
            aria-label="Send message"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        )}
      </div>

      {showCharCount && (
        <div className="mt-1 text-right text-xs text-slate-400">
          {content.length}/{MAX_CHARS}
        </div>
      )}
    </div>
  );
}
