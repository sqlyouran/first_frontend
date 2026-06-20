import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/api/authFetch", () => ({
  authFetch: vi.fn(),
}));

import { authFetch } from "@/lib/api/authFetch";
import {
  createConversation,
  fetchConversations,
  fetchMessages,
  sendMessage,
  markConversationRead,
  fetchUnreadCount,
} from "@/lib/api/messages";

const authFetchMock = vi.mocked(authFetch);

describe("messages API", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // === createConversation ===

  describe("createConversation", () => {
    it("sends POST /api/conversations with authFetch", async () => {
      const data = { request_id: "r1", conversation_id: "c1" };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 201 })
      );

      const result = await createConversation("alice", "Hello!");

      expect(result.status).toBe(201);
      expect(result.data?.conversation_id).toBe("c1");
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/conversations",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ recipient_username: "alice", content: "Hello!" }),
        })
      );
    });

    it("returns serverError on 5xx", async () => {
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify({ message: "err" }), { status: 500 })
      );

      const result = await createConversation("alice", "Hello!");

      expect(result.status).toBe(500);
      expect(result.error?.error_code).toBe("server_error");
    });

    it("returns networkError on fetch failure", async () => {
      authFetchMock.mockRejectedValue(new Error("Network"));

      const result = await createConversation("alice", "Hello!");

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  // === fetchConversations ===

  describe("fetchConversations", () => {
    it("sends GET /api/conversations with pagination", async () => {
      const data = { request_id: "r1", items: [], total: 0, page: 1, size: 20 };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await fetchConversations(2, 10);

      expect(result.status).toBe(200);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/conversations?page=2&size=10"
      );
    });

    it("uses default pagination", async () => {
      const data = { request_id: "r1", items: [], total: 0, page: 1, size: 20 };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      await fetchConversations();

      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/conversations?page=1&size=20"
      );
    });

    it("returns serverError on 5xx", async () => {
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify({ message: "err" }), { status: 502 })
      );

      const result = await fetchConversations();

      expect(result.status).toBe(502);
      expect(result.error?.error_code).toBe("server_error");
    });

    it("returns networkError on fetch failure", async () => {
      authFetchMock.mockRejectedValue(new Error("Network"));

      const result = await fetchConversations();

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  // === fetchMessages ===

  describe("fetchMessages", () => {
    it("sends GET /api/conversations/{id}/messages with pagination", async () => {
      const data = { request_id: "r1", items: [], total: 0, page: 1, size: 20 };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await fetchMessages("conv1", 2, 10);

      expect(result.status).toBe(200);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/conversations/conv1/messages?page=2&size=10"
      );
    });

    it("uses default pagination", async () => {
      const data = { request_id: "r1", items: [], total: 0, page: 1, size: 50 };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      await fetchMessages("conv1");

      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/conversations/conv1/messages?page=1&size=50"
      );
    });

    it("returns networkError on fetch failure", async () => {
      authFetchMock.mockRejectedValue(new Error("Network"));

      const result = await fetchMessages("conv1");

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  // === sendMessage ===

  describe("sendMessage", () => {
    it("sends POST /api/conversations/{id}/messages with authFetch", async () => {
      const data = {
        request_id: "r1",
        message_id: "m1",
        sender_id: "u1",
        content: "Hi!",
        read: false,
        created_at: "2024-01-01T00:00:00Z",
      };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 201 })
      );

      const result = await sendMessage("conv1", "Hi!");

      expect(result.status).toBe(201);
      expect(result.data?.content).toBe("Hi!");
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/conversations/conv1/messages",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ content: "Hi!" }),
        })
      );
    });

    it("returns serverError on 5xx", async () => {
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify({ message: "err" }), { status: 500 })
      );

      const result = await sendMessage("conv1", "Hi!");

      expect(result.status).toBe(500);
      expect(result.error?.error_code).toBe("server_error");
    });

    it("returns networkError on fetch failure", async () => {
      authFetchMock.mockRejectedValue(new Error("Network"));

      const result = await sendMessage("conv1", "Hi!");

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  // === markConversationRead ===

  describe("markConversationRead", () => {
    it("sends POST /api/conversations/{id}/mark-read", async () => {
      const data = { request_id: "r1", marked_count: 3 };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await markConversationRead("conv1");

      expect(result.status).toBe(200);
      expect(result.data?.marked_count).toBe(3);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/conversations/conv1/mark-read",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("returns networkError on fetch failure", async () => {
      authFetchMock.mockRejectedValue(new Error("Network"));

      const result = await markConversationRead("conv1");

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });

  // === fetchUnreadCount ===

  describe("fetchUnreadCount", () => {
    it("sends GET /api/conversations/unread-count", async () => {
      const data = { request_id: "r1", count: 5 };
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify(data), { status: 200 })
      );

      const result = await fetchUnreadCount();

      expect(result.status).toBe(200);
      expect(result.data?.count).toBe(5);
      expect(authFetchMock).toHaveBeenCalledWith(
        "/api/conversations/unread-count"
      );
    });

    it("returns serverError on 5xx", async () => {
      authFetchMock.mockResolvedValue(
        new Response(JSON.stringify({ message: "err" }), { status: 503 })
      );

      const result = await fetchUnreadCount();

      expect(result.status).toBe(503);
      expect(result.error?.error_code).toBe("server_error");
    });

    it("returns networkError on fetch failure", async () => {
      authFetchMock.mockRejectedValue(new Error("Network"));

      const result = await fetchUnreadCount();

      expect(result.status).toBe(0);
      expect(result.error?.error_code).toBe("network_error");
    });
  });
});
