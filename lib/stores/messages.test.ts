import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/messages", () => ({
  fetchUnreadCount: vi.fn(),
}));

import { fetchUnreadCount } from "@/lib/api/messages";
import { useMessagesStore } from "@/lib/stores/messages";

const fetchUnreadCountMock = vi.mocked(fetchUnreadCount);

describe("useMessagesStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMessagesStore.setState({ totalUnread: 0 });
  });

  describe("setTotalUnread", () => {
    it("sets totalUnread count", () => {
      useMessagesStore.getState().setTotalUnread(5);

      expect(useMessagesStore.getState().totalUnread).toBe(5);
    });
  });

  describe("decrementUnread", () => {
    it("decreases totalUnread by given count", () => {
      useMessagesStore.setState({ totalUnread: 10 });

      useMessagesStore.getState().decrementUnread(3);

      expect(useMessagesStore.getState().totalUnread).toBe(7);
    });

    it("does not go below 0", () => {
      useMessagesStore.setState({ totalUnread: 2 });

      useMessagesStore.getState().decrementUnread(5);

      expect(useMessagesStore.getState().totalUnread).toBe(0);
    });
  });

  describe("fetchTotalUnread", () => {
    it("fetches unread count from API and updates state", async () => {
      fetchUnreadCountMock.mockResolvedValue({
        status: 200,
        data: { count: 7, request_id: "r1" },
      });

      await useMessagesStore.getState().fetchTotalUnread();

      expect(fetchUnreadCountMock).toHaveBeenCalled();
      expect(useMessagesStore.getState().totalUnread).toBe(7);
    });

    it("does not update state on API error", async () => {
      useMessagesStore.setState({ totalUnread: 5 });
      fetchUnreadCountMock.mockResolvedValue({
        status: 500,
        error: { request_id: "r1", error_code: "server_error", message: "err" },
      });

      await useMessagesStore.getState().fetchTotalUnread();

      expect(useMessagesStore.getState().totalUnread).toBe(5);
    });

    it("does not update state on network error", async () => {
      useMessagesStore.setState({ totalUnread: 3 });
      fetchUnreadCountMock.mockResolvedValue({
        status: 0,
        error: { request_id: "unknown", error_code: "network_error", message: "fail" },
      });

      await useMessagesStore.getState().fetchTotalUnread();

      expect(useMessagesStore.getState().totalUnread).toBe(3);
    });
  });
});
