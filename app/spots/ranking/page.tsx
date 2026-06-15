"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Medal, MapPin, Star, Eye, Bookmark, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchRanking,
  type RankingType,
  type RankingData,
  type SpotListItem,
} from "@/lib/api/spots";
import { formatCount } from "@/app/spots/_components/SpotCard";

const TABS: { type: RankingType; label: string }[] = [
  { type: "heat", label: "热门" },
  { type: "rating", label: "高分" },
  { type: "bookmark", label: "收藏" },
];

const METRIC_KEY: Record<RankingType, string> = {
  heat: "view",
  rating: "rating",
  bookmark: "bookmark",
};

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<RankingType>("heat");
  const [cache, setCache] = useState<Map<RankingType, SpotListItem[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRanking = useCallback(
    async (type: RankingType) => {
      if (cache.has(type)) {
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      const res = await fetchRanking(type, 50);
      if (res.status === 200 && res.data) {
        setCache((prev) => new Map(prev).set(type, res.data!.items));
      } else {
        setError(res.error?.message ?? "加载失败，请稍后重试");
      }
      setIsLoading(false);
    },
    [cache]
  );

  useEffect(() => {
    loadRanking(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const items = cache.get(activeTab) ?? [];
  const activeMetric = METRIC_KEY[activeTab];

  const handleRetry = () => {
    // Remove from cache to force refetch
    setCache((prev) => {
      const next = new Map(prev);
      next.delete(activeTab);
      return next;
    });
    loadRanking(activeTab);
  };

  const handleTabChange = (type: RankingType) => {
    setActiveTab(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-8 py-16 sm:px-12 lg:px-16">
        {/* Back navigation */}
        <Link
          href="/spots"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          返回景点列表
        </Link>

        {/* Page title */}
        <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
          景点排行榜
        </h1>
        <p className="mt-3 text-base text-slate-500">
          发现最受欢迎的旅行目的地
        </p>

        {/* Tabs */}
        <div className="mt-8 mb-10 flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.type}
              role="button"
              onClick={() => handleTabChange(tab.type)}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.type
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                data-testid="ranking-skeleton"
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-20 w-28 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
            <p className="text-sm text-slate-500">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              <RefreshCw className="h-4 w-4" />
              重试
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
            <Trophy className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-400">暂无排行数据</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;

              return (
                <Link
                  key={item.id}
                  href={`/spots/${item.slug}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg"
                  data-rank={rank}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank badge */}
                    <div className="flex w-10 flex-shrink-0 flex-col items-center justify-center">
                      {rank === 1 && (
                        <>
                          <Trophy className="h-6 w-6 text-yellow-500" />
                          <span className="text-sm font-bold text-yellow-500">1</span>
                        </>
                      )}
                      {rank === 2 && (
                        <>
                          <Medal className="h-6 w-6 text-slate-400" />
                          <span className="text-sm font-bold text-slate-400">2</span>
                        </>
                      )}
                      {rank === 3 && (
                        <>
                          <Medal className="h-6 w-6 text-amber-700" />
                          <span className="text-sm font-bold text-amber-700">3</span>
                        </>
                      )}
                      {rank > 3 && (
                        <span className="text-lg font-semibold text-slate-600">{rank}</span>
                      )}
                    </div>

                    {/* Cover image */}
                    <div
                      className="h-20 w-28 flex-shrink-0 rounded-lg bg-cover bg-center bg-slate-100"
                      style={{ backgroundImage: `url(${item.cover_image})` }}
                      aria-hidden="true"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {item.name_zh}
                      </h3>
                      <p className="text-sm text-slate-500">{item.name}</p>
                      <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.city_name}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-shrink-0 items-center gap-5 text-sm">
                      {/* Rating */}
                      <span
                        data-testid={`metric-rating-${rank}`}
                        className={`flex items-center gap-1 ${
                          activeMetric === "rating"
                            ? "font-semibold text-blue-700"
                            : "text-slate-500"
                        }`}
                      >
                        <Star className="h-3.5 w-3.5" />
                        {item.rating}
                      </span>

                      {/* View count */}
                      <span
                        data-testid={`metric-view-${rank}`}
                        className={`flex items-center gap-1 ${
                          activeMetric === "view"
                            ? "font-semibold text-blue-700"
                            : "text-slate-500"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {formatCount(item.view_count) ?? "0"}
                      </span>

                      {/* Bookmark count */}
                      <span
                        data-testid={`metric-bookmark-${rank}`}
                        className={`flex items-center gap-1 ${
                          activeMetric === "bookmark"
                            ? "font-semibold text-blue-700"
                            : "text-slate-500"
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        {formatCount(item.bookmark_count) ?? "0"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
