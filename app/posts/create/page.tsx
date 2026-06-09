"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createPost } from "@/lib/api/posts";
import { PostForm, type PostFormData } from "../_components/PostForm";

export default function CreatePostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    setError(null);

    const res = await createPost(data);

    if (res.status === 201 && res.data) {
      router.push(`/posts/${res.data.id}`);
      return;
    }

    if (res.error) {
      setError(res.error.message || "发布失败，请重试");
    } else {
      setError("发布失败，请重试");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-8 py-16 sm:px-12 lg:px-16">
        {/* Navigation */}
        <Link
          href="/posts"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </Link>

        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
            发布帖子
          </h1>
          <p className="mt-3 text-base text-slate-500">
            分享你的旅行故事与攻略
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <PostForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
