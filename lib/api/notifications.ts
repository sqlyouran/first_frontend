"use client";

import {
  type ApiResponse,
  parseResponse,
  networkError,
  serverError,
} from "@/lib/api/client";
import { authFetch } from "@/lib/api/authFetch";

// === Types ===

export type NotificationType =
  | "POST_LIKED"
  | "POST_COMMENTED"
  | "COMMENT_REPLIED"
  | "POST_BOOKMARKED";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actor_id: string;
  actor_nickname: string;
  actor_avatar_url: string | null;
  actor_username: string;
  entity_id: string | null;
  entity_type: string | null;
  target_title: string | null;
  content_preview: string | null;
  read: boolean;
  created_at: string;
}

export interface NotificationData {
  request_id: string;
  items: NotificationItem[];
  total: number;
  page: number;
  size: number;
}

export interface UnreadCountData {
  request_id: string;
  unread_count: number;
}

export interface MarkAllReadData {
  request_id: string;
  updated_count: number;
}

// === API Functions ===

export async function fetchNotifications(
  page: number = 1,
  size: number = 20
): Promise<ApiResponse<NotificationData>> {
  try {
    const res = await fetch(
      `/api/notifications?page=${page}&size=${size}`
    );

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<NotificationData>(res);
  } catch {
    return networkError();
  }
}

export async function markAsRead(
  id: string
): Promise<ApiResponse<void>> {
  try {
    const res = await authFetch(`/api/notifications/${id}/read`, {
      method: "POST",
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<void>(res);
  } catch {
    return networkError();
  }
}

export async function markAllRead(): Promise<ApiResponse<MarkAllReadData>> {
  try {
    const res = await authFetch("/api/notifications/mark-all-read", {
      method: "POST",
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<MarkAllReadData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchUnreadCount(): Promise<
  ApiResponse<UnreadCountData>
> {
  try {
    const res = await fetch("/api/notifications/unread-count");

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<UnreadCountData>(res);
  } catch {
    return networkError();
  }
}
