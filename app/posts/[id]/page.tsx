import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { fetchFromBackend } from "@/lib/backend";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import MarkdownRenderer from "./_components/MarkdownRenderer";

interface PostDetail {
  id: string;
  title: string;
  content: string;
  cover_image: string | null;
  tags: string[];
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  request_id: string;
}

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const res = await fetchFromBackend(`/api/posts/${id}`);

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    notFound();
  }

  const post: PostDetail = await res.json();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <article className="mx-auto max-w-4xl px-8 py-16 sm:px-12 lg:px-16">
      {/* Back link */}
      <Link
        href="/posts"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回帖子列表
      </Link>

      {/* Cover image */}
      {post.cover_image && (
        <div
          className="mb-8 aspect-[16/9] w-full rounded-xl bg-cover bg-center shadow-sm"
          style={{ backgroundImage: `url(${post.cover_image})` }}
          aria-hidden="true"
        />
      )}

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 lg:text-5xl leading-tight">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="h-4 w-4" />
            作者 {post.author_id.slice(0, 8)}
          </span>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Divider */}
      <div className="mb-8 h-px bg-gradient-to-r from-slate-200 via-slate-300 to-transparent" />

      {/* Markdown content */}
      <Card className="p-8 lg:p-10">
        <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-blue-700 prose-img:rounded-lg">
          <MarkdownRenderer content={post.content} />
        </div>
      </Card>
    </article>
    </div>
  );
}
