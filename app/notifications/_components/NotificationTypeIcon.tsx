import { Heart, MessageCircle, CornerDownRight, Bookmark } from "lucide-react";
import type { NotificationType } from "@/lib/api/notifications";
import { cn } from "@/lib/utils";

const iconConfig: Record<
  NotificationType,
  { icon: typeof Heart; color: string }
> = {
  POST_LIKED: { icon: Heart, color: "text-rose-500" },
  POST_COMMENTED: { icon: MessageCircle, color: "text-blue-500" },
  COMMENT_REPLIED: { icon: CornerDownRight, color: "text-emerald-500" },
  POST_BOOKMARKED: { icon: Bookmark, color: "text-amber-500" },
};

interface NotificationTypeIconProps {
  type: NotificationType;
  className?: string;
}

export function NotificationTypeIcon({
  type,
  className,
}: NotificationTypeIconProps) {
  const config = iconConfig[type];
  const Icon = config.icon;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50",
        config.color,
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}
