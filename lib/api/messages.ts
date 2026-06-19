"use client";

import { type ApiResponse, parseResponse, networkError, serverError } from "@/lib/api/client";
import { authFetch } from "@/lib/api/authFetch";

// === Types ===

export interface OtherUser {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  username: string;
  deleted: boolean;
}

export interface ConversationItem {
  conversation_id: string;
  other_user: OtherUser;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface ConversationData {
  items: ConversationItem[];
  total: number;
  page: number;
  size: number;
  request_id: string;
}

export interface CreateConversationData {
  conversation_id: string;
  message_id: string;
  request_id: string;
}

export interface MessageItem {
  message_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface MessageData {
  items: MessageItem[];
  total: number;
  page: number;
  size: number;
  request_id: string;
}

export interface UnreadCountData {
  unread_count: number;
  request_id: string;
}

export interface MarkReadData {
  marked_count: number;
  request_id: string;
}

// === API functions ===

export async function createConversation(
  recipientUsername: string,
  content: string
): Promise<ApiResponse<CreateConversationData>> {
  try {
    const res = await authFetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient_username: recipientUsername,
        content,
      }),
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<CreateConversationData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchConversations(
  page: number = 1,
  size: number = 20
): Promise<ApiResponse<ConversationData>> {
  try {
    const res = await authFetch(`/api/conversations?page=${page}&size=${size}`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<ConversationData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchMessages(
  conversationId: string,
  page: number = 1,
  size: number = 50
): Promise<ApiResponse<MessageData>> {
  try {
    const res = await authFetch(
      `/api/conversations/${conversationId}/messages?page=${page}&size=${size}`
    );

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<MessageData>(res);
  } catch {
    return networkError();
  }
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ApiResponse<MessageItem>> {
  try {
    const res = await authFetch(
      `/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }
    );

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<MessageItem>(res);
  } catch {
    return networkError();
  }
}

export async function markConversationRead(
  conversationId: string
): Promise<ApiResponse<MarkReadData>> {
  try {
    const res = await authFetch(
      `/api/conversations/${conversationId}/mark-read`,
      { method: "POST" }
    );

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<MarkReadData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchUnreadCount(): Promise<ApiResponse<UnreadCountData>> {
  try {
    const res = await authFetch("/api/conversations/unread-count");

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<UnreadCountData>(res);
  } catch {
    return networkError();
  }
}
