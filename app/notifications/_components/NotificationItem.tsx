import Link from "next/link";
import { toast } from "sonner";
import type { NotificationItem as NotificationItemType } from "@/lib/api/notifications";
import { NotificationTypeIcon } from "./NotificationTypeIcon";
import { cn } from "@/lib/utils";

// Format relative time: just now / Xm / Xh / Xd / Xw / date
export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;
  if (diffWeek < 52) return `${diffWeek}w`;

  return new Date(dateStr).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

function getActionText(type: NotificationItemType["type"]): string {
  switch (type) {
    case "POST_LIKED":
      return "赞了你的帖子";
    case "POST_COMMENTED":
      return "评论了你的帖子";
    case "COMMENT_REPLIED":
      return "回复了你的评论";
    case "POST_BOOKMARKED":
      return "收藏了你的帖子";
  }
}

interface NotificationItemProps {
  notification: NotificationItemType;
  onClick?: (notification: NotificationItemType) => void;
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const {
    type,
    actor_nickname,
    entity_id,
    target_title,
    content_preview,
    read,
    created_at,
  } = notification;

  const isDeleted = target_title === null;
  const href = entity_id ? `/posts/${entity_id}` : "#";

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (isDeleted || !entity_id) {
          e.preventDefault();
          toast.error("该内容已被删除");
        }
        onClick?.(notification);
      }}
      className={cn(
        "flex items-start gap-3 rounded-xl px-4 py-3 transition-colors",
        "hover:bg-slate-50",
        !read && "bg-blue-50/40"
      )}
    >
      <NotificationTypeIcon type={type} />

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-slate-800">
          <span className="font-semibold">{actor_nickname}</span>{" "}
          {getActionText(type)}
        </p>

        {isDeleted ? (
          <p className="mt-1 text-xs text-slate-400">[内容已删除]</p>
        ) : (
          <p className="mt-1 truncate text-xs font-medium text-slate-600">
            {target_title}
          </p>
        )}

        {content_preview && (
          <p className="mt-1 truncate text-xs text-slate-500">
            {content_preview}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-xs text-slate-400">
          {formatRelativeTime(created_at)}
        </span>
        {!read && (
          <span
            data-unread
            className="h-2.5 w-2.5 rounded-full bg-blue-500"
            aria-label="未读"
          />
        )}
      </div>
    </Link>
  );
}
