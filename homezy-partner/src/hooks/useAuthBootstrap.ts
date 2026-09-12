import { useEffect } from 'react';
import { getToken } from '@/services/tokenStorage';
import { getProfile } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export function useAuthBootstrap() {
  const { setProvider, setBootstrapped, logout } = useAuthStore();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setBootstrapped();
        return;
      }
      try {
        const provider = await getProfile();
        setProvider(provider);
        useAuthStore.setState({ isAuthenticated: true });
      } catch {
        // Token invalid/expired - clear stale credentials
        await logout();
      } finally {
        setBootstrapped();
      }
    })();
  }, []);
}
