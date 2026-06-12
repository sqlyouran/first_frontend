"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { FileText, PenLine } from "lucide-react";
import { fetchPosts, type PostListItem, type PostSortType } from "@/lib/api/posts";
import { PostCard } from "./_components/PostCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SORT_OPTIONS: { value: PostSortType; label: string }[] = [
  { value: "latest", label: "最新" },
  { value: "most_upvoted", label: "最热" },
  { value: "most_commented", label: "最多讨论" },
];

const PAGE_SIZE = 20;

function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/3" />
      </div>
    </Card>
  );
}

export default function PostsListPage() {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sort, setSort] = useState<PostSortType>("latest");

  const sentinelRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef(sort);
  sortRef.current = sort;

  // First load / sort change
  const loadFirst = useCallback(async (s: PostSortType) => {
    setIsLoading(true);
    setItems([]);
    setNextCursor(null);
    setHasMore(false);
    const res = await fetchPosts({ sort: s, size: PAGE_SIZE });
    if (res.status === 200 && res.data) {
      setItems(res.data.items);
      setNextCursor(res.data.next_cursor);
      setHasMore(res.data.has_more);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadFirst(sort);
  }, [sort, loadFirst]);

  // Load more (cursor pagination)
  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    const res = await fetchPosts({ sort: sortRef.current, size: PAGE_SIZE, cursor: nextCursor });
    if (res.status === 200 && res.data) {
      setItems((prev) => [...prev, ...res.data!.items]);
      setNextCursor(res.data.next_cursor);
      setHasMore(res.data.has_more);
    }
    setIsLoadingMore(false);
  }, [nextCursor, isLoadingMore]);

  // IntersectionObserver on sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  const handleSortChange = (newSort: PostSortType) => {
    if (newSort === sort) return;
    setSort(newSort);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <div className="mx-auto max-w-5xl px-8 py-16 sm:px-12 lg:px-16">
      {/* Page Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
              探索帖子
            </h1>
            <p className="mt-3 text-base text-slate-500">
              发现旅途中的精彩故事与实用攻略
            </p>
          </div>
          <Link href="/posts/create">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white gap-2">
              <PenLine className="h-4 w-4" />
              发布帖子
            </Button>
          </Link>
        </div>
        <div className="mt-8 h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent" />

        {/* Sort tabs */}
        <div className="mt-6 flex gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                sort === opt.value
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton (initial) */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-slate-900">
            还没有帖子
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            成为第一个分享旅行故事的人，你的经历可能帮助到更多旅行者。
          </p>
          <Link href="/posts/create" className="mt-6">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white gap-2">
              <PenLine className="h-4 w-4" />
              发布第一篇帖子
            </Button>
          </Link>
        </div>
      )}

      {/* Post grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Loading more skeleton */}
      {isLoadingMore && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}

      {/* End of list */}
      {!hasMore && items.length > 0 && !isLoading && (
        <p className="mt-10 text-center text-sm text-slate-400">
          已经到底啦
        </p>
      )}

      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} className="h-1" />
    </div>
    </div>
  );
}
