"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { useNotificationStore } from "@/lib/stores/notifications";

const POLL_INTERVAL = 60_000; // 60 seconds

function formatBadge(count: number): string | null {
  if (count === 0) return null;
  if (count < 100) return String(count);
  return "99+";
}

export function NotificationBell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isLoaded = useNotificationStore((s) => s.isLoaded);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
  }, [isAuthenticated, fetchUnreadCount]);

  // 60s polling
  useEffect(() => {
    if (!isAuthenticated) return;

    timerRef.current = setInterval(() => {
      fetchUnreadCount();
    }, POLL_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuthenticated, fetchUnreadCount]);

  // Re-fetch when tab becomes visible
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadCount();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [isAuthenticated, fetchUnreadCount]);

  if (!isAuthenticated) return null;

  const badge = formatBadge(unreadCount);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      aria-label={`通知${badge ? `，${unreadCount} 条未读` : ""}`}
    >
      <Bell className={`h-5 w-5 ${!isLoaded ? "animate-pulse" : ""}`} />
      {badge && (
        <span
          data-badge
          className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white"
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
