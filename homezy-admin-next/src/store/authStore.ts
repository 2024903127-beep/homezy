import { create } from 'zustand';
import { AdminUser } from '@/types/models';

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  setAuth: (token: string, admin: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('homezy_admin_token') : null,
  admin:
    typeof window !== 'undefined' && localStorage.getItem('homezy_admin_user')
      ? JSON.parse(localStorage.getItem('homezy_admin_user')!)
      : null,
  setAuth: (token, admin) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('homezy_admin_token', token);
      localStorage.setItem('homezy_admin_user', JSON.stringify(admin));
    }
    set({ token, admin });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('homezy_admin_token');
      localStorage.removeItem('homezy_admin_user');
    }
    set({ token: null, admin: null });
  },
}));
