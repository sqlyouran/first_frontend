import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/notifications", () => ({
  fetchUnreadCount: vi.fn(),
}));

import { fetchUnreadCount } from "@/lib/api/notifications";
import { useNotificationStore } from "@/lib/stores/notifications";

const fetchUnreadCountMock = vi.mocked(fetchUnreadCount);

describe("useNotificationStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotificationStore.setState({
      unreadCount: 0,
    });
  });

  describe("setUnreadCount", () => {
    it("sets the unread count", () => {
      useNotificationStore.getState().setUnreadCount(5);

      expect(useNotificationStore.getState().unreadCount).toBe(5);
    });
  });

  describe("decrementUnread", () => {
    it("decreases unread count by 1", () => {
      useNotificationStore.setState({ unreadCount: 3 });

      useNotificationStore.getState().decrementUnread();

      expect(useNotificationStore.getState().unreadCount).toBe(2);
    });

    it("does not go below 0", () => {
      useNotificationStore.setState({ unreadCount: 0 });

      useNotificationStore.getState().decrementUnread();

      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe("resetUnread", () => {
    it("resets unread count to 0", () => {
      useNotificationStore.setState({ unreadCount: 10 });

      useNotificationStore.getState().resetUnread();

      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe("fetchUnreadCount", () => {
    it("fetches and sets unread count on success", async () => {
      fetchUnreadCountMock.mockResolvedValue({
        status: 200,
        data: { request_id: "r1", unread_count: 7 },
      });

      await useNotificationStore.getState().fetchUnreadCount();

      expect(fetchUnreadCountMock).toHaveBeenCalled();
      expect(useNotificationStore.getState().unreadCount).toBe(7);
    });

    it("does not change count on API error", async () => {
      useNotificationStore.setState({ unreadCount: 3 });
      fetchUnreadCountMock.mockResolvedValue({
        status: 500,
        error: {
          request_id: "r1",
          error_code: "server_error",
          message: "error",
        },
      });

      await useNotificationStore.getState().fetchUnreadCount();

      expect(useNotificationStore.getState().unreadCount).toBe(3);
    });

    it("does not change count on network error", async () => {
      useNotificationStore.setState({ unreadCount: 3 });
      fetchUnreadCountMock.mockResolvedValue({
        status: 0,
        error: {
          request_id: "unknown",
          error_code: "network_error",
          message: "Network connection failed",
        },
      });

      await useNotificationStore.getState().fetchUnreadCount();

      expect(useNotificationStore.getState().unreadCount).toBe(3);
    });
  });
});
