"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, MessageCircle, User } from "lucide-react";
import { toast } from "sonner";
import {
  fetchConversation,
  fetchMessages,
  sendMessage,
  markConversationRead,
  type MessageItem,
  type OtherUser,
} from "@/lib/api/messages";
import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";
import { MessageBubble } from "../_components/MessageBubble";
import { MessageInput } from "../_components/MessageInput";
import { DateSeparator } from "../_components/DateSeparator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 50;

type InputStatus = "idle" | "typing" | "sending" | "disabled" | "rate_limited";

function shouldShowDateSeparator(messages: MessageItem[], index: number): boolean {
  if (index === 0) return true;
  const prevDate = new Date(messages[index - 1].created_at).toDateString();
  const currDate = new Date(messages[index].created_at).toDateString();
  return prevDate !== currDate;
}

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;

  const userId = useAuthStore((s) => s.user?.id);
  const decrementUnread = useMessagesStore((s) => s.decrementUnread);

  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputStatus, setInputStatus] = useState<InputStatus>("idle");
  const [page, setPage] = useState(1);
  const hasMore = messages.length < total;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  // Load conversation detail + messages on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [convRes, msgRes] = await Promise.all([
        fetchConversation(conversationId),
        fetchMessages(conversationId, 1, PAGE_SIZE),
      ]);

      if (convRes.status === 200 && convRes.data) {
        setOtherUser(convRes.data.other_user);
        setInputStatus(convRes.data.other_user.deleted ? "disabled" : "idle");
      } else {
        setError(convRes.error?.message ?? "Failed to load conversation");
        setLoading(false);
        return;
      }

      if (msgRes.status === 200 && msgRes.data) {
        const sorted = [...msgRes.data.items].reverse();
        setMessages(sorted);
        setTotal(msgRes.data.total);
        setPage(1);
      } else {
        setError(msgRes.error?.message ?? "Failed to load messages");
      }
      setLoading(false);
    };

    load();
  }, [conversationId]);

  // Mark as read on mount
  useEffect(() => {
    if (!conversationId) return;
    markConversationRead(conversationId).then((res) => {
      if (res.status === 200 && res.data) {
        decrementUnread(res.data.marked_count);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [loading, messages.length]);

  // Load older messages via IntersectionObserver on top sentinel
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadMoreMessages();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadingMore, hasMore, page]);

  const loadMoreMessages = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await fetchMessages(conversationId, nextPage, PAGE_SIZE);
    if (res.status === 200 && res.data) {
      setMessages((prev) => [...res.data!.items.reverse(), ...prev]);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  const handleSend = async (content: string) => {
    setInputStatus("sending");

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageItem = {
      message_id: tempId,
      sender_id: userId ?? "",
      content,
      read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const res = await sendMessage(conversationId, content);

    if (res.status === 201 && res.data) {
      setMessages((prev) =>
        prev.map((m) => (m.message_id === tempId ? res.data! : m))
      );
    } else if (res.status === 429) {
      setMessages((prev) => prev.filter((m) => m.message_id !== tempId));
      setInputStatus("rate_limited");
      toast.error("Too many messages. Please wait a moment.");
      setTimeout(() => setInputStatus(otherUser?.deleted ? "disabled" : "idle"), 30000);
      return;
    } else {
      setMessages((prev) => prev.filter((m) => m.message_id !== tempId));
      toast.error("Failed to send message. Please try again.");
    }

    setInputStatus(otherUser?.deleted ? "disabled" : "idle");
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    const [convRes, msgRes] = await Promise.all([
      fetchConversation(conversationId),
      fetchMessages(conversationId, 1, PAGE_SIZE),
    ]);
    if (convRes.status === 200 && convRes.data) {
      setOtherUser(convRes.data.other_user);
    }
    if (msgRes.status === 200 && msgRes.data) {
      const sorted = [...msgRes.data.items].reverse();
      setMessages(sorted);
      setTotal(msgRes.data.total);
      setPage(1);
    } else {
      setError(msgRes.error?.message ?? "Failed to load messages");
    }
    setLoading(false);
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Header user info (fallback while loading)
  const displayName = otherUser?.deleted ? "Deleted user" : (otherUser?.nickname ?? "");
  const displayUsername = otherUser?.username ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-8 py-3 sm:px-12 lg:px-16">
          <Link href="/messages" aria-label="Back to messages" className="flex items-center text-slate-600 hover:text-slate-900">
            <ArrowLeft className="size-5" />
          </Link>
          {otherUser && (
            <div className="flex items-center gap-2">
              <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-slate-200">
                {otherUser.avatar_url && !otherUser.deleted ? (
                  <img
                    src={otherUser.avatar_url}
                    alt={otherUser.nickname}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <User className="size-4 text-slate-400" />
                  </div>
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${otherUser.deleted ? "text-slate-400 italic" : "text-slate-900"}`}>
                  {displayName}
                </p>
                {!otherUser.deleted && (
                  <p className="text-xs text-slate-500">@{displayUsername}</p>
                )}
              </div>
            </div>
          )}
          {loading && !otherUser && (
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          )}
        </div>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-8 py-4 sm:px-12 lg:px-16">
          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} data-testid="message-skeleton" className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className="h-16 w-[70%] rounded-2xl" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="size-12 text-red-400" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Failed to load messages
              </h2>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
              <Button onClick={handleRetry} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && sortedMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle className="size-12 text-slate-300" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No messages yet
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Send the first message to start a conversation
              </p>
            </div>
          )}

          {/* Messages */}
          {!loading && !error && sortedMessages.length > 0 && (
            <>
              {/* Load more sentinel */}
              {hasMore && (
                <div ref={topSentinelRef} className="flex justify-center py-4">
                  {loadingMore && <Skeleton className="h-4 w-24" />}
                </div>
              )}

              <div className="space-y-2">
                {sortedMessages.map((msg, idx) => (
                  <div key={msg.message_id}>
                    {shouldShowDateSeparator(sortedMessages, idx) && (
                      <DateSeparator date={msg.created_at} />
                    )}
                    <MessageBubble message={msg} isOwn={msg.sender_id === userId} />
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Input */}
      <div className="sticky bottom-0">
        <div className="mx-auto max-w-2xl px-8 sm:px-12 lg:px-16">
          <MessageInput onSend={handleSend} status={inputStatus} partnerDeleted={otherUser?.deleted} />
        </div>
      </div>
    </div>
  );
}
