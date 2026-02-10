import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api';

export type Role = 'ADMIN' | 'STAFF' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => {
        // Set the token for future API requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        // Clear the token from API requests
        delete apiClient.defaults.headers.common['Authorization'];
        set({ token: null, user: null, isAuthenticated: false });
      },

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage', // key in local storage
      // Ensure apiClient header is set on rehydration
      onRehydrateStorage: () => (state) => {
          if (state?.token) {
              apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          }
      }
    }
  )
);

// Helper to initialize axios headers on load (in case persist middleware hasn't run yet or for SSR/hydration)
if (typeof window !== 'undefined') {
    const storageData = localStorage.getItem('auth-storage');
    if (storageData) {
        try {
            const { state } = JSON.parse(storageData);
            if (state?.token) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
            }
        } catch (e) {
            console.error('Failed to restore auth token', e);
        }
    }
}
