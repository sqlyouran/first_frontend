import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/api/authFetch", () => ({
  authFetch: vi.fn(),
}));

import { authFetch } from "@/lib/api/authFetch";
import {
  fetchNotifications,
  markAsRead,
  markAllRead,
  fetchUnreadCount,
} from "@/lib/api/notifications";

const authFetchMock = vi.mocked(authFetch);

describe("notifications API", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // === fetchNotifications ===

  describe("fetchNotifications", () => {
    it("sends GET /api/notifications with default pagination", async () => {
      const data = {
        request_id: "r1",
        items: [],
        total: 0,
        page: 1,
        size: 20,
      };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await fetchNotifications();

      expect(result.status).toBe(200);
      expect(result.data?.items).toEqual([]);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/notifications?page=1&size=20"
      );
    });

    it("sends GET /api/notifications with custom pagination", async () => {
      const data = {
        request_id: "r1",
        items: [],
        total: 0,
        page: 2,
        size: 10,
      };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      await fetchNotifications(2, 10);

      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/notifications?page=2&size=10"
      );
    });

    it("parses notification items correctly", async () => {
      const data = {
        request_id: "r1",
        items: [
          {
            id: "n1",
            type: "POST_LIKED",
            actor_id: "u2",
            actor_nickname: "Alice",
            actor_avatar_url: null,
            actor_username: "alice",
            entity_id: "p1",
            entity_type: "POST",
            target_title: "My Trip",
            content_preview: null,
            read: false,
            created_at: "2024-06-01T10:00:00Z",
          },
        ],
        total: 1,
        page: 1,
        size: 20,
      };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await fetchNotifications();

      expect(result.status).toBe(200);
      expect(result.data?.items).toHaveLength(1);
      expect(result.data?.items[0].type).toBe("POST_LIKED");
      expect(result.data?.items[0].actor_nickname).toBe("Alice");
    });

    it("returns serverError on 500", async () => {
      authFetchMock.mockResolvedValue(
        new Response("error", { status: 500 })
      );

      const result = await fetchNotifications();

      expect(result.status).toBe(500);
      expect(result.error?.error_code).toBe("server_error");
    });

    it("returns networkError on fetch failure", async () => {
      authFetchMock.mockRejectedValue(
        new Error("Network")
      );

      const result = await fetchNotifications();

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  // === markAsRead ===

  describe("markAsRead", () => {
    it("sends POST /api/notifications/{id}/read with authFetch", async () => {
      authFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      const result = await markAsRead("n1");

      expect(result.status).toBe(204);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/notifications/n1/read",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("returns networkError on authFetch failure", async () => {
      authFetchMock.mockRejectedValue(new Error("Network"));

      const result = await markAsRead("n1");

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  // === markAllRead ===

  describe("markAllRead", () => {
    it("sends POST /api/notifications/mark-all-read with authFetch", async () => {
      const data = { request_id: "r1", updated_count: 5 };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await markAllRead();

      expect(result.status).toBe(200);
      expect(result.data?.updated_count).toBe(5);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/notifications/mark-all-read",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("returns networkError on authFetch failure", async () => {
      authFetchMock.mockRejectedValue(new Error("Network"));

      const result = await markAllRead();

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  // === fetchUnreadCount ===

  describe("fetchUnreadCount", () => {
    it("sends GET /api/notifications/unread-count", async () => {
      const data = { request_id: "r1", unread_count: 3 };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await fetchUnreadCount();

      expect(result.status).toBe(200);
      expect(result.data?.unread_count).toBe(3);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/notifications/unread-count"
      );
    });

    it("returns serverError on 500", async () => {
      authFetchMock.mockResolvedValue(
        new Response("error", { status: 500 })
      );

      const result = await fetchUnreadCount();

      expect(result.status).toBe(500);
      expect(result.error?.error_code).toBe("server_error");
    });

    it("returns networkError on fetch failure", async () => {
      authFetchMock.mockRejectedValue(
        new Error("Network")
      );

      const result = await fetchUnreadCount();

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });
});
