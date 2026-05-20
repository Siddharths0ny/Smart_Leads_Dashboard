import { create } from 'zustand';
import { User } from '../types/index.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load initial token and user state from localStorage
  const savedToken = localStorage.getItem('auth_token');
  const savedUserJson = localStorage.getItem('auth_user');
  let savedUser: User | null = null;

  if (savedUserJson) {
    try {
      savedUser = JSON.parse(savedUserJson);
    } catch {
      localStorage.removeItem('auth_user');
    }
  }

  return {
    user: savedUser,
    token: savedToken,
    isAuthenticated: !!savedToken && !!savedUser,
    isLoading: false,
    setAuth: (user, token) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ user: null, token: null, isAuthenticated: false });
    },
    setLoading: (isLoading) => set({ isLoading }),
  };
});
