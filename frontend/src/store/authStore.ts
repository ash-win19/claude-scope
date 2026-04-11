import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
}

const MOCK_USER: User = {
  id: 'usr_01',
  name: 'Alex Chen',
  email: 'alex@example.com',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (_email: string, _password: string) => {
        set({ user: MOCK_USER, isAuthenticated: true });
      },
      signup: (name: string, email: string, _password: string) => {
        set({ user: { ...MOCK_USER, name, email }, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: 'cs-auth' }
  )
);
