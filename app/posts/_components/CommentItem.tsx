"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import type { CommentData } from "@/lib/api/interactions";
import type { EntityType } from "@/lib/api/interactions";
import CommentInput from "./CommentInput";

interface CommentItemProps {
  comment: CommentData;
  entityId: string;
  entityType: EntityType;
  depth: number;
  replies?: CommentData[];
  replyCount?: number;
  onReply?: (comment: CommentData) => void;
  onLoadMoreReplies?: (commentId: string) => void;
  onNewReply?: (comment: CommentData) => void;
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 30) return `${diffDay}天前`;
  return new Date(dateString).toLocaleDateString("zh-CN");
}

export default function CommentItem({
  comment,
  entityId,
  entityType,
  depth,
  replies = [],
  replyCount = 0,
  onReply,
  onLoadMoreReplies,
  onNewReply,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  if (comment.deleted) {
    return (
      <div className="flex gap-3">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-200" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400">已删除用户</span>
          </div>
          <p className="mt-1 text-sm italic text-slate-400">[已删除]</p>
          {replies.length > 0 && (
            <div className="mt-3 space-y-4 border-l-2 border-slate-100 pl-4">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  entityId={entityId}
                  entityType={entityType}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const hasMoreReplies = replies.length < replyCount;

  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center">
        <span className="text-xs font-medium text-slate-500">
          {comment.user_id.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900">
            {comment.user_id.slice(0, 8)}
          </span>
          <span className="text-xs text-slate-400">
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
        <div className="mt-2 flex items-center gap-4">
          {onReply && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-700 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              回复
            </button>
          )}
        </div>
        {showReplyInput && (
          <div className="mt-3">
            <CommentInput
              entityId={entityId}
              entityType={entityType}
              parentCommentId={comment.id}
              placeholder={`回复 ${comment.user_id.slice(0, 8)}...`}
              onSuccess={(newComment) => {
                setShowReplyInput(false);
                onNewReply?.(newComment);
              }}
              onCancel={() => setShowReplyInput(false)}
            />
          </div>
        )}
        {replies.length > 0 && (
          <div className="mt-3 space-y-4 border-l-2 border-slate-100 pl-4">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                entityId={entityId}
                entityType={entityType}
                depth={depth + 1}
                onReply={onReply}
                onNewReply={onNewReply}
              />
            ))}
          </div>
        )}
        {hasMoreReplies && onLoadMoreReplies && (
          <button
            onClick={() => onLoadMoreReplies(comment.id)}
            className="mt-2 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
          >
            查看更多 {replyCount - replies.length} 条回复
          </button>
        )}
      </div>
    </div>
  );
}

export { formatRelativeTime };
export type { CommentItemProps };
