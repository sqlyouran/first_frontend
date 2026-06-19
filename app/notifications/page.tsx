"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BellOff, AlertCircle, CheckCheck } from "lucide-react";
import {
  fetchNotifications,
  markAsRead as apiMarkAsRead,
  markAllRead as apiMarkAllRead,
  type NotificationItem as NotificationItemType,
} from "@/lib/api/notifications";
import { useNotificationStore } from "@/lib/stores/notifications";
import { NotificationItem } from "./_components/NotificationItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type PageState = "loading" | "content" | "empty" | "error";
type LoadMoreState = "idle" | "loading" | "error" | "done";

function NotificationSkeleton() {
  return (
    <div
      data-testid="notification-skeleton"
      className="flex items-start gap-3 px-4 py-3"
    >
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-8" />
    </div>
  );
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItemType[]>([]);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [page, setPage] = useState(1);
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreState>("idle");
  const [markAllState, setMarkAllState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const sentinelRef = useRef<HTMLLIElement>(null);
  const { decrementUnread, resetUnread } = useNotificationStore();

  const PAGE_SIZE = 20;

  // Initial load
  const loadFirst = useCallback(async () => {
    setPageState("loading");
    setItems([]);
    setPage(1);
    setLoadMoreState("idle");

    const res = await fetchNotifications(1, PAGE_SIZE);
    if (res.status === 200 && res.data) {
      if (res.data.items.length === 0) {
        setPageState("empty");
      } else {
        setItems(res.data.items);
        setPageState("content");
        const total = res.data.total;
        setLoadMoreState(
          items.length >= total ? "done" : "idle"
        );
      }
    } else {
      setPageState("error");
    }
  }, []);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  // Load more
  const loadMore = useCallback(async () => {
    if (loadMoreState === "loading" || loadMoreState === "done") return;
    setLoadMoreState("loading");

    const nextPage = page + 1;
    const res = await fetchNotifications(nextPage, PAGE_SIZE);
    if (res.status === 200 && res.data) {
      setItems((prev) => {
        const combined = [...prev, ...res.data!.items];
        if (combined.length >= res.data!.total) {
          setLoadMoreState("done");
        } else {
          setLoadMoreState("idle");
        }
        return combined;
      });
      setPage(nextPage);
    } else {
      setLoadMoreState("error");
    }
  }, [page, loadMoreState]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || pageState !== "content") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          loadMoreState === "idle"
        ) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreState, pageState, loadMore]);

  // Mark single as read
  const handleItemClick = useCallback(
    (notification: NotificationItemType) => {
      if (!notification.read) {
        // Optimistic update
        setItems((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        decrementUnread();
        apiMarkAsRead(notification.id);
      }
    },
    [decrementUnread]
  );

  // Mark all as read
  const handleMarkAllRead = useCallback(async () => {
    if (markAllState === "submitting") return;
    setMarkAllState("submitting");

    const res = await apiMarkAllRead();
    if (res.status === 200) {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      resetUnread();
      setMarkAllState("success");
      setTimeout(() => setMarkAllState("idle"), 2000);
    } else {
      setMarkAllState("error");
      setTimeout(() => setMarkAllState("idle"), 3000);
    }
  }, [markAllState, resetUnread]);

  const hasUnread = items.some((n) => !n.read);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-2xl px-8 py-16 sm:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
            通知
          </h1>

          {pageState === "content" && (
            <Button
              variant="outline"
              size="sm"
              disabled={!hasUnread || markAllState === "submitting"}
              onClick={handleMarkAllRead}
              className="gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              {markAllState === "submitting" ? (
                "处理中…"
              ) : markAllState === "success" ? (
                "✓ 已标记"
              ) : markAllState === "error" ? (
                "失败，重试"
              ) : (
                <>
                  <CheckCheck className="h-4 w-4" />
                  全部标记已读
                </>
              )}
            </Button>
          )}
        </div>

        {/* Loading state */}
        {pageState === "loading" && (
          <div className="space-y-1" aria-busy="true" aria-label="正在加载通知">
            {Array.from({ length: 6 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {pageState === "empty" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <BellOff className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">
              暂无通知
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              当有人与你的帖子互动时，你会在这里收到通知。
            </p>
          </div>
        )}

        {/* Error state */}
        {pageState === "error" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/50 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">
              加载失败
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              无法加载通知，请稍后再试。
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={loadFirst}
            >
              重试
            </Button>
          </div>
        )}

        {/* Content state */}
        {pageState === "content" && (
          <>
          <ul role="list" className="space-y-1">
            {items.map((notification) => (
              <li key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onClick={handleItemClick}
                />
              </li>
            ))}

            {/* Load more states */}
            {loadMoreState === "loading" && (
              <div className="space-y-1 pt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <NotificationSkeleton key={`more-${i}`} />
                ))}
              </div>
            )}

            {loadMoreState === "error" && (
              <div className="py-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMore}
                  className="text-xs text-slate-500"
                >
                  加载更多失败，点击重试
                </Button>
              </div>
            )}

            {loadMoreState === "done" && items.length > 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                没有更多通知了
              </p>
            )}

            {/* Sentinel for IntersectionObserver */}
            <li ref={sentinelRef} className="h-1" aria-hidden="true" />
          </ul>

          {/* Mark all read status announcer */}
          <div aria-live="polite" className="sr-only">
            {markAllState === "success" && "所有通知已标记为已读"}
            {markAllState === "error" && "标记全部已读失败，请重试"}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
