"use client";

import { CheckCheck } from "lucide-react";
import { type MessageItem } from "@/lib/api/messages";

interface MessageBubbleProps {
  message: MessageItem;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const bubbleColor = isOwn
    ? "bg-blue-600 text-white"
    : "bg-slate-100 text-slate-900";

  const alignment = isOwn ? "ml-auto" : "mr-auto";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 md:max-w-[75%] ${alignment} ${bubbleColor}`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </p>
        <div className={`mt-1 flex items-center gap-1 text-[10px] ${isOwn ? "justify-end text-blue-200" : "text-slate-400"}`}>
          <span>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {isOwn && message.read && <CheckCheck className="size-3" />}
        </div>
      </div>
    </div>
  );
}
