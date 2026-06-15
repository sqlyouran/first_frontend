import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/api/authFetch", () => ({
  authFetch: vi.fn(),
}));

import { authFetch } from "@/lib/api/authFetch";
import {
  fetchVoteStats,
  vote,
  removeVote,
  fetchBookmarkStatus,
  toggleBookmark,
  fetchComments,
  fetchReplies,
  createComment,
  deleteComment,
} from "@/lib/api/interactions";

const authFetchMock = vi.mocked(authFetch);

describe("interactions API", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // === Vote ===

  describe("fetchVoteStats", () => {
    it("sends GET /api/posts/{id}/vote-stats", async () => {
      const data = { request_id: "r1", up_count: 5, down_count: 1, user_vote: null };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await fetchVoteStats("p1");

      expect(result.status).toBe(200);
      expect(result.data?.up_count).toBe(5);
      expect(global.fetch).toHaveBeenCalledWith("/api/posts/p1/vote-stats");
    });

    it("returns networkError on fetch failure", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network"));

      const result = await fetchVoteStats("p1");

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  describe("vote", () => {
    it("sends POST /api/posts/{id}/vote with authFetch", async () => {
      const data = { request_id: "r1", vote_type: "up" };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await vote("p1", "up");

      expect(result.status).toBe(200);
      expect(result.data?.vote_type).toBe("up");
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/posts/p1/vote",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ vote_type: "up" }),
        })
      );
    });

    it("returns networkError on authFetch failure", async () => {
      authFetchMock.mockRejectedValue(new Error("Network"));

      const result = await vote("p1", "up");

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  describe("removeVote", () => {
    it("sends DELETE /api/posts/{id}/vote with authFetch", async () => {
      authFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      const result = await removeVote("p1");

      expect(result.status).toBe(204);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/posts/p1/vote",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  // === Bookmark ===

  describe("fetchBookmarkStatus", () => {
    it("sends GET /api/posts/{id}/bookmark-status with authFetch", async () => {
      const data = { request_id: "r1", bookmarked: true };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await fetchBookmarkStatus("p1", "post");

      expect(result.status).toBe(200);
      expect(result.data?.bookmarked).toBe(true);
      expect(authFetchMock).toHaveBeenCalledWith("/api/posts/p1/bookmark-status");
    });

    it("sends GET /api/spots/{id}/bookmark-status for spots", async () => {
      const data = { request_id: "r1", bookmarked: false };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await fetchBookmarkStatus("s1", "spot");

      expect(result.status).toBe(200);
      expect(authFetchMock).toHaveBeenCalledWith("/api/spots/s1/bookmark-status");
    });
  });

  describe("toggleBookmark", () => {
    it("sends POST /api/posts/{id}/bookmark with authFetch", async () => {
      const data = { request_id: "r1", bookmarked: true };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await toggleBookmark("p1", "post");

      expect(result.status).toBe(200);
      expect(result.data?.bookmarked).toBe(true);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/posts/p1/bookmark",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("sends POST /api/spots/{id}/bookmark for spots", async () => {
      const data = { request_id: "r1", bookmarked: true };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      await toggleBookmark("s1", "spot");

      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/spots/s1/bookmark",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  // === Comment ===

  describe("fetchComments", () => {
    it("sends GET /api/posts/{id}/comments with pagination", async () => {
      const data = { request_id: "r1", items: [], total: 0, page: 1, size: 20 };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await fetchComments("p1", "post", 2, 10);

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith("/api/posts/p1/comments?page=2&size=10");
    });

    it("uses default pagination", async () => {
      const data = { request_id: "r1", items: [], total: 0, page: 1, size: 20 };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      await fetchComments("p1", "post");

      expect(global.fetch).toHaveBeenCalledWith("/api/posts/p1/comments?page=1&size=20");
    });

    it("sends GET /api/spots/{id}/comments for spots", async () => {
      const data = { request_id: "r1", items: [], total: 0, page: 1, size: 20 };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      await fetchComments("s1", "spot");

      expect(global.fetch).toHaveBeenCalledWith("/api/spots/s1/comments?page=1&size=20");
    });
  });

  describe("fetchReplies", () => {
    it("sends GET /api/comments/{id}/replies", async () => {
      const data = { request_id: "r1", items: [], total: 0, page: 1, size: 20 };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      await fetchReplies("c1");

      expect(global.fetch).toHaveBeenCalledWith("/api/comments/c1/replies?page=1&size=20");
    });
  });

  describe("createComment", () => {
    it("sends POST /api/posts/{id}/comments with authFetch", async () => {
      const data = {
        request_id: "r1",
        id: "c1",
        entity_id: "p1",
        entity_type: "POST",
        user_id: "u1",
        content: "Hello",
        parent_comment_id: null,
        created_at: "2024-01-01T00:00:00Z",
        deleted: false,
      };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 201 })
      );

      const result = await createComment("p1", "post", "Hello");

      expect(result.status).toBe(201);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/posts/p1/comments",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ content: "Hello" }),
        })
      );
    });

    it("includes parent_comment_id when provided", async () => {
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify({
          request_id: "r1", id: "c2", entity_id: "p1", entity_type: "POST",
          user_id: "u1", content: "Reply", parent_comment_id: "c1",
          created_at: "2024-01-01T00:00:00Z", deleted: false,
        }), { status: 201 })
      );

      await createComment("p1", "post", "Reply", "c1");

      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/posts/p1/comments",
        expect.objectContaining({
          body: JSON.stringify({ content: "Reply", parent_comment_id: "c1" }),
        })
      );
    });

    it("sends POST /api/spots/{id}/comments for spots", async () => {
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify({
          request_id: "r1", id: "c1", entity_id: "s1", entity_type: "SPOT",
          user_id: "u1", content: "Nice", parent_comment_id: null,
          created_at: "2024-01-01T00:00:00Z", deleted: false,
        }), { status: 201 })
      );

      await createComment("s1", "spot", "Nice");

      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/spots/s1/comments",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ content: "Nice" }),
        })
      );
    });
  });

  describe("deleteComment", () => {
    it("sends DELETE /api/posts/{entityId}/comments/{commentId}", async () => {
      authFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      const result = await deleteComment("p1", "post", "c1");

      expect(result.status).toBe(204);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/posts/p1/comments/c1",
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("sends DELETE /api/spots/{entityId}/comments/{commentId} for spots", async () => {
      authFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await deleteComment("s1", "spot", "c1");

      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/spots/s1/comments/c1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
