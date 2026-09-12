import { create } from 'zustand';
import { User } from '@/types/models';
import { setToken, clearToken, setStoredUser, clearStoredUser } from '@/services/tokenStorage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean; // true while checking stored token on app start
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setBootstrapped: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,
  login: async (token, user) => {
    await setToken(token);
    await setStoredUser(user);
    set({ user, isAuthenticated: true, isBootstrapping: false });
  },
  logout: async () => {
    await clearToken();
    await clearStoredUser();
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => {
    setStoredUser(user);
    set({ user });
  },
  setBootstrapped: () => set({ isBootstrapping: false }),
}));
