"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { fetchSpots, type SpotListItem, type SpotSortType } from "@/lib/api/spots";
import { fetchCities, type CityItem } from "@/lib/api/cities";
import { SpotCard } from "./_components/SpotCard";
import { SpotCardSkeleton } from "./_components/SpotCardSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS: { value: SpotSortType; label: string }[] = [
  { value: "latest", label: "最新" },
  { value: "rating", label: "评分最高" },
  { value: "viewCount", label: "最热" },
  { value: "bookmarkCount", label: "最多收藏" },
];

const PAGE_SIZE = 12;

export default function SpotsListPage() {
  const [items, setItems] = useState<SpotListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citySlug, setCitySlug] = useState<string>("all");
  const [sort, setSort] = useState<SpotSortType>("latest");

  const [cities, setCities] = useState<CityItem[]>([]);

  useEffect(() => {
    fetchCities().then((res) => {
      if (res.status === 200 && res.data) {
        setCities(res.data.items);
      }
    });
  }, []);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef(sort);
  sortRef.current = sort;
  const citySlugRef = useRef(citySlug);
  citySlugRef.current = citySlug;
  const pageRef = useRef(page);
  pageRef.current = page;

  const loadFirst = useCallback(async (s: SpotSortType, c: string) => {
    setIsLoading(true);
    setError(null);
    setItems([]);
    setPage(1);
    setHasMore(false);

    const res = await fetchSpots({
      sort: s,
      size: PAGE_SIZE,
      citySlug: c === "all" ? null : c,
    });

    if (res.status === 200 && res.data) {
      setItems(res.data.items);
      setHasMore(res.data.has_more);
      setPage(1);
    } else {
      setError("加载失败，请稍后重试");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadFirst(sort, citySlug);
  }, [sort, citySlug, loadFirst]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const nextPage = pageRef.current + 1;
    const res = await fetchSpots({
      sort: sortRef.current,
      size: PAGE_SIZE,
      page: nextPage,
      citySlug: citySlugRef.current === "all" ? null : citySlugRef.current,
    });

    if (res.status === 200 && res.data) {
      setItems((prev) => [...prev, ...res.data!.items]);
      setHasMore(res.data.has_more);
      setPage(nextPage);
    }
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore]);

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

  const handleSortChange = (newSort: SpotSortType) => {
    if (newSort === sort) return;
    setSort(newSort);
  };

  const handleCityChange = (val: string | null) => {
    if (!val || val === citySlug) return;
    setCitySlug(val);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-8 py-16 sm:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
            探索景点
          </h1>
          <p className="mt-3 text-base text-slate-500">
            发现中国最值得探索的目的地
          </p>
          <div className="mt-8 h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent" />

          {/* Filters row */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {/* City filter */}
            <Select value={citySlug} onValueChange={handleCityChange}>
              <SelectTrigger aria-label="城市筛选">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部城市</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.slug}>
                    {city.name_zh || city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort tabs */}
            <div className="flex gap-2">
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
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SpotCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <RefreshCw className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">
              {error}
            </h3>
            <button
              onClick={() => loadFirst(sort, citySlug)}
              className="mt-4 rounded-lg bg-blue-700 px-6 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">
              暂无景点
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              换个城市或排序试试看
            </p>
          </div>
        )}

        {/* Spot grid */}
        {!isLoading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )}

        {/* Loading more */}
        {isLoadingMore && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SpotCardSkeleton key={`loading-${i}`} />
            ))}
          </div>
        )}

        {/* End of list */}
        {!hasMore && items.length > 0 && !isLoading && (
          <p className="mt-10 text-center text-sm text-slate-400">
            已经到底啦
          </p>
        )}

        {/* Sentinel */}
        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  );
}
