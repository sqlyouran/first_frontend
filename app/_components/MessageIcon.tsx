"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";

export function MessageIcon() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const totalUnread = useMessagesStore((s) => s.totalUnread);
  const fetchTotalUnread = useMessagesStore((s) => s.fetchTotalUnread);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchTotalUnread();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchTotalUnread();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    const interval = setInterval(fetchTotalUnread, 60_000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [isAuthenticated, fetchTotalUnread]);

  if (!isAuthenticated) return null;

  const badgeText = totalUnread >= 100 ? "99+" : totalUnread > 0 ? String(totalUnread) : null;

  return (
    <Link href="/messages" aria-label="Messages" className="relative inline-flex items-center justify-center p-2">
      <MessageCircle className="size-5 text-slate-600" />
      {badgeText && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
          {badgeText}
        </span>
      )}
    </Link>
  );
}
