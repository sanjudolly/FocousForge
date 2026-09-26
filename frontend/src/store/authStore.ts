import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Theme } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setAuth: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  setTheme: (theme: Theme) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setTheme: (theme) =>
        set((state) => ({
          user: state.user ? { ...state.user, theme } : null,
        })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: 'focusforge-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
