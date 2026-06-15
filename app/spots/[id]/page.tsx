import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Bookmark, Star } from "lucide-react";
import { fetchFromBackend } from "@/lib/backend";
import { Badge } from "@/components/ui/badge";
import SpotGallery from "./_components/SpotGallery";
import SpotInfo from "./_components/SpotInfo";
import type { SpotInfoData } from "./_components/SpotInfo";
import BookmarkButton from "@/app/posts/_components/BookmarkButton";
import CommentSection from "@/app/posts/_components/CommentSection";
import RelatedPosts from "./_components/RelatedPosts";

interface SpotDetail {
  request_id: string;
  id: string;
  name: string;
  name_zh: string;
  slug: string;
  description: string | null;
  description_zh: string | null;
  cover_image: string | null;
  gallery: string[];
  tags: string[];
  city_id: string;
  city_name: string;
  status: string;
  rating: string;
  view_count: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
}

interface SpotDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SpotDetailPage({ params }: SpotDetailPageProps) {
  const { id } = await params;

  const [spotRes, bookmarkStatusRes] = await Promise.all([
    fetchFromBackend(`/api/spots/${id}`),
    fetchFromBackend(`/api/spots/${id}/bookmark-status`),
  ]);

  if (spotRes.status === 404 || !spotRes.ok) {
    notFound();
  }

  const spot: SpotDetail = await spotRes.json();

  let initialBookmarked = false;
  if (bookmarkStatusRes.ok) {
    const bookmarkData = await bookmarkStatusRes.json();
    initialBookmarked = bookmarkData.bookmarked ?? false;
  }

  // Build images: coverImage (if exists) + gallery
  const images: string[] = [
    ...(spot.cover_image ? [spot.cover_image] : []),
    ...(spot.gallery ?? []),
  ];

  // Description: prefer description_zh, fallback to description
  const description = spot.description_zh || spot.description;

  const spotInfo: SpotInfoData = {
    city_name: spot.city_name,
    name: spot.name,
    name_zh: spot.name_zh,
    status: spot.status,
    rating: spot.rating,
    view_count: spot.view_count,
    bookmark_count: spot.bookmark_count,
    created_at: spot.created_at,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-8 py-16 sm:px-12 lg:px-16">
        {/* Back link */}
        <Link
          href="/spots"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回景点列表
        </Link>

        <div className="space-y-8">
          {/* Gallery */}
          <SpotGallery images={images} />

          {/* Title area */}
          <header>
            <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">{spot.name}</h1>
            <p className="mt-2 text-base text-slate-500">{spot.city_name}</p>

            {/* Tags */}
            {spot.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {spot.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats row */}
            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-slate-900 font-medium">{spot.rating}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-slate-400" />
                {spot.view_count.toLocaleString()} 浏览
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bookmark className="h-4 w-4 text-slate-400" />
                {spot.bookmark_count.toLocaleString()} 收藏
              </span>
            </div>
          </header>

          {/* Bookmark button */}
          <div className="flex items-center gap-3 border-y border-slate-200 py-4">
            <BookmarkButton entityId={spot.id} entityType="spot" initialBookmarked={initialBookmarked} />
          </div>

          {/* Spot Info */}
          <SpotInfo spot={spotInfo} />

          {/* Description */}
          {description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">景点介绍</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-300 to-transparent" />

          {/* Comment section */}
          <CommentSection entityId={spot.id} entityType="spot" />

          {/* Related posts */}
          <RelatedPosts spotId={spot.id} />
        </div>
      </div>
    </div>
  );
}
