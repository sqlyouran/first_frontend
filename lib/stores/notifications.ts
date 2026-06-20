import { create } from "zustand";
import { fetchUnreadCount as apiFetchUnreadCount } from "@/lib/api/notifications";

interface NotificationState {
  unreadCount: number;
  isLoaded: boolean;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  resetUnread: () => void;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  isLoaded: false,

  setUnreadCount: (count: number) => set({ unreadCount: count, isLoaded: true }),

  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  resetUnread: () => set({ unreadCount: 0 }),

  fetchUnreadCount: async () => {
    const res = await apiFetchUnreadCount();
    if (res.status === 200 && res.data) {
      set({ unreadCount: res.data.unread_count, isLoaded: true });
    } else {
      set({ isLoaded: true });
    }
  },
}));
