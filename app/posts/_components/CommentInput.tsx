"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth";
import { createComment, type CommentData, type EntityType } from "@/lib/api/interactions";

interface CommentInputProps {
  entityId: string;
  entityType: EntityType;
  parentCommentId?: string;
  placeholder?: string;
  onSuccess?: (comment: CommentData) => void;
  onCancel?: () => void;
}

export default function CommentInput({
  entityId,
  entityType,
  parentCommentId,
  placeholder = "写下你的评论...",
  onSuccess,
  onCancel,
}: CommentInputProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    if (parentCommentId) return null;
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-blue-700 hover:text-blue-800">
          登录
        </Link>
        后即可参与评论
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;

    setLoading(true);
    const result = await createComment(entityId, entityType, content.trim(), parentCommentId);

    if (result.status === 201 && result.data) {
      setContent("");
      toast.success("评论已发布");
      onSuccess?.(result.data);
    } else {
      toast.error("评论失败，请重试");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            取消
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          className="rounded-md bg-blue-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "发布中..." : "发布"}
        </button>
      </div>
    </div>
  );
}
