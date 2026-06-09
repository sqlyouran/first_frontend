import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PostListItem } from "@/lib/api/posts";

interface PostCardProps {
  post: PostListItem;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        {/* Cover image or gradient placeholder */}
        <div
          className="aspect-[16/9] bg-cover bg-center"
          style={
            post.cover_image
              ? { backgroundImage: `url(${post.cover_image})` }
              : undefined
          }
          aria-hidden={!post.cover_image}
        >
          {!post.cover_image && (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
              <MapPin className="h-10 w-10 text-blue-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
            {post.title}
          </h3>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-0.5">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-slate-400">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Meta */}
          <p className="mt-4 text-sm text-slate-400">
            {new Date(post.created_at).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </Card>
    </Link>
  );
}
