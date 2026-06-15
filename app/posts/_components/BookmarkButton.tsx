"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth";
import { toggleBookmark, fetchBookmarkStatus, type EntityType } from "@/lib/api/interactions";

interface BookmarkButtonProps {
  entityId: string;
  entityType: EntityType;
  initialBookmarked: boolean;
}

export default function BookmarkButton({ entityId, entityType, initialBookmarked }: BookmarkButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  // On mount, if logged in, re-fetch to get personal bookmark state
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarkStatus(entityId, entityType).then((res) => {
        if (res.data) {
          setBookmarked(res.data.bookmarked);
        }
      });
    }
  }, [entityId, entityType, isAuthenticated]);

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const prevBookmarked = bookmarked;

    // Optimistic update
    setLoading(true);
    setBookmarked(!bookmarked);

    const result = await toggleBookmark(entityId, entityType);

    if (result.status === 200 && result.data) {
      setBookmarked(result.data.bookmarked);
    } else {
      setBookmarked(prevBookmarked);
      toast.error("收藏失败，请重试");
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        bookmarked
          ? "text-blue-700"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
      aria-label={bookmarked ? "取消收藏" : "收藏"}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      <span>{bookmarked ? "已收藏" : "收藏"}</span>
    </button>
  );
}
