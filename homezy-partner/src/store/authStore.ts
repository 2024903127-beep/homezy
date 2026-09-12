import { create } from 'zustand';
import { Provider } from '@/types/models';
import { setToken, clearToken } from '@/services/tokenStorage';

interface AuthState {
  provider: Provider | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (token: string, provider: Provider) => Promise<void>;
  logout: () => Promise<void>;
  setProvider: (provider: Provider) => void;
  setBootstrapped: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  provider: null,
  isAuthenticated: false,
  isBootstrapping: true,
  login: async (token, provider) => {
    await setToken(token);
    set({ provider, isAuthenticated: true, isBootstrapping: false });
  },
  logout: async () => {
    await clearToken();
    set({ provider: null, isAuthenticated: false });
  },
  setProvider: (provider) => set({ provider }),
  setBootstrapped: () => set({ isBootstrapping: false }),
}));

