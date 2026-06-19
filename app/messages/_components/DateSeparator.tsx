"use client";

import { useMemo } from "react";

interface DateSeparatorProps {
  date: string;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const label = useMemo(() => formatDateLabel(date), [date]);

  return (
    <div role="separator" aria-label={label} className="flex items-center gap-3 py-4">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
