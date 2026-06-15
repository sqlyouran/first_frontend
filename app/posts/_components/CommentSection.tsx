"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import {
  fetchComments,
  fetchReplies,
  type CommentData,
  type EntityType,
} from "@/lib/api/interactions";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";

interface CommentSectionProps {
  entityId: string;
  entityType: EntityType;
}

interface CommentWithReplies {
  comment: CommentData;
  replies: CommentData[];
  replyCount: number;
}

export default function CommentSection({ entityId, entityType }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const loadComments = useCallback(async (pageNum: number) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    const result = await fetchComments(entityId, entityType, pageNum, 20);

    if (result.status === 200 && result.data) {
      const newComments: CommentWithReplies[] = result.data.items.map((c) => ({
        comment: c,
        replies: [],
        replyCount: 0,
      }));

      if (pageNum === 1) {
        setComments(newComments);
      } else {
        setComments((prev) => [...prev, ...newComments]);
      }

      setPage(pageNum);
      setTotal(result.data.total);
      setHasMore(pageNum * 20 < result.data.total);
    }

    if (pageNum === 1) setLoading(false);
    else setLoadingMore(false);
  }, [entityId, entityType]);

  useEffect(() => {
    loadComments(1);
  }, [loadComments]);

  const handleNewComment = (comment: CommentData) => {
    setComments((prev) => [
      { comment, replies: [], replyCount: 0 },
      ...prev,
    ]);
    setTotal((prev) => prev + 1);
  };

  const handleLoadMoreReplies = async (commentId: string) => {
    const result = await fetchReplies(commentId);
    const data = result.data;
    if (result.status === 200 && data) {
      setComments((prev) =>
        prev.map((cw) =>
          cw.comment.id === commentId
            ? { ...cw, replies: data.items, replyCount: data.total }
            : cw
        )
      );
    }
  };

  const handleNewReply = (parentCommentId: string, reply: CommentData) => {
    setComments((prev) =>
      prev.map((cw) =>
        cw.comment.id === parentCommentId
          ? { ...cw, replies: [...cw.replies, reply], replyCount: cw.replyCount + 1 }
          : cw
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">评论</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">
        评论 {total > 0 && <span className="text-sm font-normal text-slate-500">({total})</span>}
      </h3>

      <CommentInput entityId={entityId} entityType={entityType} onSuccess={handleNewComment} />

      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">暂无评论，发表第一条评论吧</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(({ comment, replies, replyCount }) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              entityId={entityId}
              entityType={entityType}
              depth={0}
              replies={replies}
              replyCount={replyCount}
              onReply={comment.deleted ? undefined : () => {}}
              onLoadMoreReplies={handleLoadMoreReplies}
              onNewReply={(reply) => handleNewReply(comment.id, reply)}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => loadComments(page + 1)}
            disabled={loadingMore}
            className="rounded-md border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {loadingMore ? "加载中..." : "加载更多评论"}
          </button>
        </div>
      )}
    </div>
  );
}
