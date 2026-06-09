"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileText, PenLine } from "lucide-react";
import { fetchPosts, type PostListData } from "@/lib/api/posts";
import { PostCard } from "./_components/PostCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [data, setData] = useState<PostListData | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const size = 20;

  const loadPosts = useCallback(async (p: number) => {
    setIsLoading(true);
    const res = await fetchPosts(p, size);
    if (res.status === 200 && res.data) {
      setData(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPosts(page);
  }, [page, loadPosts]);

  const totalPages = data ? Math.ceil(data.total / size) : 0;

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
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data && data.items.length === 0 && (
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
      {!isLoading && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                上一页
              </Button>

              <span className="min-w-[80px] text-center text-sm font-medium text-slate-700">
                {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
    </div>
  );
}
