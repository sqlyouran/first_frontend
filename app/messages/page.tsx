"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, AlertCircle, Users } from "lucide-react";
import { fetchConversations, type ConversationItem } from "@/lib/api/messages";
import { ConversationCard } from "./_components/ConversationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export default function MessagesPage() {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async (pageNum: number, append: boolean) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const res = await fetchConversations(pageNum, PAGE_SIZE);

    if (res.status === 200 && res.data) {
      const newItems = append ? [...items, ...res.data.items] : res.data.items;
      setItems(newItems);
      setHasMore(newItems.length < res.data.total);
      setPage(pageNum);
      setError(null);
    } else {
      setError(res.error?.message ?? "Failed to load conversations");
    }

    setLoading(false);
    setLoadingMore(false);
  }, [items]);

  useEffect(() => {
    loadConversations(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IntersectionObserver for pagination
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadConversations(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, page, loadConversations]);

  const handleRetry = () => {
    loadConversations(1, false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-8 py-4 sm:px-12 lg:px-16">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            <span>Home</span>
          </Link>
          <div className="flex-1" />
        </div>
        <div className="mx-auto max-w-2xl px-8 pb-3 sm:px-12 lg:px-16">
          <h1 className="text-xl font-bold text-slate-900">Messages</h1>
          <p className="text-sm text-slate-500">Your conversations with other travelers</p>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-8 py-4 sm:px-12 lg:px-16">
        {/* Loading state */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} data-testid="conversation-skeleton" className="flex items-center gap-3 rounded-xl px-4 py-3">
                <Skeleton className="size-12 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="size-12 text-red-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Failed to load conversations
            </h2>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <Button onClick={handleRetry} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle className="size-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No conversations yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Start a conversation by visiting a traveler&apos;s profile
            </p>
            <Link href="/posts">
              <Button className="mt-4 bg-blue-700 hover:bg-blue-800 text-white">
                <Users className="size-4" />
                Browse Travelers
              </Button>
            </Link>
          </div>
        )}

        {/* Content state */}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-1">
            {items.map((conv) => (
              <ConversationCard key={conv.conversation_id} conversation={conv} />
            ))}

            {/* Load more sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-4">
                {loadingMore && (
                  <Skeleton className="h-4 w-24" />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
