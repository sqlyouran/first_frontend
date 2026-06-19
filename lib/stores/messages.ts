import { create } from "zustand";
import { fetchUnreadCount } from "@/lib/api/messages";

interface MessagesState {
  totalUnread: number;
  setTotalUnread: (count: number) => void;
  decrementUnread: (count: number) => void;
  fetchTotalUnread: () => Promise<void>;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  totalUnread: 0,

  setTotalUnread: (count: number) => set({ totalUnread: count }),

  decrementUnread: (count: number) => {
    const current = get().totalUnread;
    set({ totalUnread: Math.max(0, current - count) });
  },

  fetchTotalUnread: async () => {
    const res = await fetchUnreadCount();
    if (res.status === 200 && res.data) {
      set({ totalUnread: res.data.unread_count });
    }
  },
}));
