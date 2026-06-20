"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { type ConversationItem } from "@/lib/api/messages";
import { formatRelativeTime } from "@/lib/utils";

interface ConversationCardProps {
  conversation: ConversationItem;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const { conversation_id, other_user, last_message, last_message_at, unread_count } = conversation;
  const isDeleted = other_user.deleted;
  const displayName = isDeleted ? "Deleted user" : other_user.nickname;
  const username = isDeleted ? null : `@${other_user.username}`;

  return (
    <Link
      href={`/messages/${conversation_id}`}
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-slate-50"
    >
      {/* Avatar */}
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-200">
        {!isDeleted && other_user.avatar_url ? (
          <img
            src={other_user.avatar_url}
            alt={other_user.nickname}
            className="absolute inset-0 size-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        {(isDeleted || !other_user.avatar_url) && (
          <div className="flex size-full items-center justify-center">
            <User className="size-6 text-slate-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className={`truncate text-sm font-medium ${isDeleted ? "text-slate-400 italic" : "text-slate-900"}`}>
            {displayName}
          </span>
          {username && (
            <span className="truncate text-xs text-slate-500">{username}</span>
          )}
          <span className="ml-auto shrink-0 text-xs text-slate-400">
            {formatRelativeTime(last_message_at)}
          </span>
        </div>
        <p className={`truncate text-sm ${unread_count > 0 ? "font-medium text-slate-900" : "text-slate-500"}`}>
          {last_message}
        </p>
      </div>

      {/* Unread badge */}
      {unread_count > 0 && (
        <span className="ml-2 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
          {unread_count}
        </span>
      )}
    </Link>
  );
}
