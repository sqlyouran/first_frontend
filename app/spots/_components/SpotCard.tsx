import Link from "next/link";
import { Star, MapPin, Eye, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SpotListItem } from "@/lib/api/spots";

interface SpotCardProps {
  spot: SpotListItem;
}

export function formatCount(n: number): string | null {
  if (n === 0) return null;
  if (n < 1000) return String(n);
  if (n < 10000) {
    const k = n / 1000;
    return k % 1 === 0 ? `${k}k` : `${Math.floor(k * 10) / 10}k`;
  }
  return `${Math.floor(n / 1000)}k`;
}

export function SpotCard({ spot }: SpotCardProps) {
  const viewStr = formatCount(spot.view_count);
  const bookmarkStr = formatCount(spot.bookmark_count);

  return (
    <Link href={`/spots/${spot.slug}`} className="block">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {/* Cover image */}
      <div className="relative">
        <div
          className="aspect-[4/3] bg-cover bg-center bg-slate-100"
          style={{ backgroundImage: `url(${spot.cover_image})` }}
          aria-hidden="true"
        />
        {/* Rating badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-sm font-medium text-white">
          <Star className="h-3.5 w-3.5 fill-current" />
          {spot.rating}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* City */}
        <div className="mb-2 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {spot.city_name}
        </div>

        {/* Names */}
        <h3 className="text-lg font-semibold text-slate-900">{spot.name}</h3>
        <p className="mt-0.5 text-sm text-slate-500">{spot.name_zh}</p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {spot.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        {(viewStr || bookmarkStr) && (
          <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
            {viewStr && (
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {viewStr}
              </span>
            )}
            {bookmarkStr && (
              <span className="flex items-center gap-1">
                <Bookmark className="h-3.5 w-3.5" />
                {bookmarkStr}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
    </Link>
  );
}
