"use client";

import { type ApiResponse, parseResponse, networkError, serverError } from "@/lib/api/client";
import { authFetch } from "@/lib/api/authFetch";

// === Types ===

export interface VoteStatsData {
  request_id: string;
  up_count: number;
  down_count: number;
  user_vote: string | null;
}

export interface VoteData {
  request_id: string;
  vote_type: string | null;
}

export interface BookmarkStatusData {
  request_id: string;
  bookmarked: boolean;
}

export interface BookmarkData {
  request_id: string;
  bookmarked: boolean;
}

export interface CommentData {
  request_id: string;
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  deleted: boolean;
}

export interface CommentListData {
  request_id: string;
  items: CommentData[];
  total: number;
  page: number;
  size: number;
}

// === Vote API ===

export async function fetchVoteStats(postId: string): Promise<ApiResponse<VoteStatsData>> {
  try {
    const res = await fetch(`/api/posts/${postId}/vote-stats`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<VoteStatsData>(res);
  } catch {
    return networkError();
  }
}

export async function vote(postId: string, voteType: string): Promise<ApiResponse<VoteData>> {
  try {
    const res = await authFetch(`/api/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: voteType }),
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<VoteData>(res);
  } catch {
    return networkError();
  }
}

export async function removeVote(postId: string): Promise<ApiResponse<void>> {
  try {
    const res = await authFetch(`/api/posts/${postId}/vote`, {
      method: "DELETE",
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<void>(res);
  } catch {
    return networkError();
  }
}

// === Bookmark API ===

export async function fetchBookmarkStatus(postId: string): Promise<ApiResponse<BookmarkStatusData>> {
  try {
    const res = await authFetch(`/api/posts/${postId}/bookmark-status`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<BookmarkStatusData>(res);
  } catch {
    return networkError();
  }
}

export async function toggleBookmark(postId: string): Promise<ApiResponse<BookmarkData>> {
  try {
    const res = await authFetch(`/api/posts/${postId}/bookmark`, {
      method: "POST",
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<BookmarkData>(res);
  } catch {
    return networkError();
  }
}

// === Comment API ===

export async function fetchComments(
  postId: string,
  page: number = 1,
  size: number = 20
): Promise<ApiResponse<CommentListData>> {
  try {
    const res = await fetch(`/api/posts/${postId}/comments?page=${page}&size=${size}`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<CommentListData>(res);
  } catch {
    return networkError();
  }
}

export async function fetchReplies(
  commentId: string,
  page: number = 1,
  size: number = 20
): Promise<ApiResponse<CommentListData>> {
  try {
    const res = await fetch(`/api/comments/${commentId}/replies?page=${page}&size=${size}`);

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<CommentListData>(res);
  } catch {
    return networkError();
  }
}

export async function createComment(
  postId: string,
  content: string,
  parentCommentId?: string
): Promise<ApiResponse<CommentData>> {
  try {
    const body: Record<string, unknown> = { content };
    if (parentCommentId) {
      body.parent_comment_id = parentCommentId;
    }

    const res = await authFetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<CommentData>(res);
  } catch {
    return networkError();
  }
}

export async function deleteComment(
  postId: string,
  commentId: string
): Promise<ApiResponse<void>> {
  try {
    const res = await authFetch(`/api/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });

    if (res.status >= 500) return serverError(res.status);
    return parseResponse<void>(res);
  } catch {
    return networkError();
  }
}
