"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSpotPosts, type SpotPostItem } from "@/lib/api/spots";

interface RelatedPostsProps {
  spotId: string;
}

export default function RelatedPosts({ spotId }: RelatedPostsProps) {
  const [posts, setPosts] = useState<SpotPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSpotPosts(spotId, { size: 6 }).then((res) => {
      if (res.status === 200 && res.data) {
        setPosts(res.data.items);
      }
      setIsLoading(false);
    });
  }, [spotId]);

  return (
    <section>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">相关攻略</h3>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-5 shadow-sm border border-slate-200">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <Card className="p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BookOpen className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">暂无相关攻略</p>
          </div>
        </Card>
      )}

      {!isLoading && posts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.slug}`}>
              <Card className="p-5 shadow-sm border border-slate-200 transition-shadow hover:shadow-md">
                {/* Cover thumbnail */}
                {post.cover_image && (
                  <div
                    className="mb-3 aspect-[16/9] bg-cover bg-center rounded-md bg-slate-100"
                    style={{ backgroundImage: `url(${post.cover_image})` }}
                    aria-hidden="true"
                  />
                )}
                <h4 className="text-base font-semibold text-slate-900 line-clamp-2">
                  {post.title}
                </h4>
                {post.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(post.created_at).toLocaleDateString("zh-CN")}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
