import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/components/auth/types';

interface AuthStore extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: (user: User) =>
        set({
          user,
          isAuthenticated: true,
          error: null,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
