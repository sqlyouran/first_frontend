import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock authFetch for createPost
vi.mock("@/lib/api/authFetch", () => ({
  authFetch: vi.fn(),
}));

import { authFetch } from "@/lib/api/authFetch";
import { createPost, fetchPost, fetchPosts, fetchUserPosts } from "@/lib/api/posts";

const authFetchMock = vi.mocked(authFetch);

describe("posts API", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("createPost", () => {
    it("sends POST /api/posts with authFetch", async () => {
      const postData = {
        id: "p1",
        title: "Test",
        content: "# Hello",
        cover_image: null,
        tags: [],
        status: "published",
        author_id: "u1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        request_id: "r1",
      };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(postData), { status: 201 })
      );

      const result = await createPost({
        title: "Test",
        content: "# Hello",
      });

      expect(result.status).toBe(201);
      expect(result.data?.id).toBe("p1");
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/posts",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("returns networkError on fetch failure", async () => {
      authFetchMock.mockRejectedValue(new Error("Network"));

      const result = await createPost({ title: "T", content: "C" });

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  describe("fetchPost", () => {
    it("sends GET /api/posts/{id}", async () => {
      const postData = {
        id: "p1",
        title: "Test",
        content: "# Hello",
        cover_image: null,
        tags: ["travel"],
        status: "published",
        author_id: "u1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        request_id: "r1",
      };
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(postData), { status: 200 })
      );

      const result = await fetchPost("p1");

      expect(result.status).toBe(200);
      expect(result.data?.title).toBe("Test");
      expect(global.fetch).toHaveBeenCalledWith("/api/posts/p1");
    });

    it("returns 404 error when post not found", async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ request_id: "r1", error_code: "not_found", message: "Post not found" }),
          { status: 404 }
        )
      );

      const result = await fetchPost("nonexistent");

      expect(result.status).toBe(404);
      expect(result.error?.error_code).toBe("not_found");
    });
  });

  describe("fetchPosts", () => {
    it("sends GET /api/posts with pagination and sort", async () => {
      const listData = { items: [], total: 0, page: 2, size: 10, next_cursor: null, has_more: false, request_id: "r1" };
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(listData), { status: 200 })
      );

      const result = await fetchPosts({ page: 2, size: 10 });

      expect(result.status).toBe(200);
      expect(result.data?.page).toBe(2);
      expect(global.fetch).toHaveBeenCalledWith("/api/posts?size=10&sort=latest&page=2");
    });

    it("sends GET /api/posts with sort parameter", async () => {
      const listData = { items: [], total: 0, page: 1, size: 20, next_cursor: null, has_more: false, request_id: "r1" };
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(listData), { status: 200 })
      );

      const result = await fetchPosts({ sort: "most_upvoted" });

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith("/api/posts?size=20&sort=most_upvoted&page=1");
    });

    it("sends GET /api/posts with cursor (no page param)", async () => {
      const listData = { items: [], total: 0, page: null, size: 20, next_cursor: "2025-01-01T00:00:00Z", has_more: true, request_id: "r1" };
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(listData), { status: 200 })
      );

      const result = await fetchPosts({ cursor: "2025-01-01T00:00:00Z" });

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith("/api/posts?size=20&sort=latest&cursor=2025-01-01T00%3A00%3A00Z");
    });
  });

  describe("fetchUserPosts", () => {
    it("sends GET /api/users/{userId}/posts with sort", async () => {
      const listData = { items: [], total: 0, page: 1, size: 20, next_cursor: null, has_more: false, request_id: "r1" };
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(listData), { status: 200 })
      );

      const result = await fetchUserPosts("u1");

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith("/api/users/u1/posts?size=20&sort=latest&page=1");
    });
  });
});
