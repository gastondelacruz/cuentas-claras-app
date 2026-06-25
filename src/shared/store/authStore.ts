import { create } from "zustand";

export type AuthUser = {
  id: string;
  name?: string;
  email: string;
};

type AuthStore = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, token: string) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setSession: (user, token) =>
    set({ user, accessToken: token, isAuthenticated: true }),
  clearSession: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
}));
