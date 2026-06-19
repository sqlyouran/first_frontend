import { create } from "zustand";
import { refreshToken, fetchMe as apiFetchMe, logout as apiLogout } from "@/lib/api/auth";

export interface User {
  id: string;
  email: string;
  state: string;
  created_at: string;
  nickname: string | null;
  avatar_url: string | null;
  username: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setToken: (token: string) => set({ accessToken: token, isAuthenticated: true }),

  setUser: (user: User) => set({ user }),

  clearAuth: () => set({ accessToken: null, user: null, isAuthenticated: false }),

  fetchMe: async () => {
    const token = get().accessToken;
    if (!token) return;

    const res = await apiFetchMe(token);
    if (res.status === 200 && res.data) {
      set({
        user: {
          id: res.data.id,
          email: res.data.email,
          state: res.data.state,
          created_at: res.data.created_at,
          nickname: res.data.nickname,
          avatar_url: res.data.avatar_url,
          username: res.data.username,
        },
      });
    }
  },

  logout: async () => {
    const token = get().accessToken;
    if (token) {
      await apiLogout(token);
    }
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const res = await refreshToken();
      if (res.status === 200 && res.data?.access_token) {
        set({ accessToken: res.data.access_token, isAuthenticated: true });
        await get().fetchMe();
      }
    } catch {
      // refresh failed, stay unauthenticated
    } finally {
      set({ isInitialized: true });
    }
  },
}));
