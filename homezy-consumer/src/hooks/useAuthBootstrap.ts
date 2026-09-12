import { useEffect } from 'react';
import { getToken, getStoredUser } from '@/services/tokenStorage';
import { getProfile } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

// Runs once on app start: if a token is already stored, fetch the profile
// and mark the session as authenticated; otherwise fall through to Login.
export function useAuthBootstrap() {
  const { setUser, setBootstrapped } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const cachedUser = await getStoredUser();
        if (cachedUser) {
          setUser(cachedUser);
        }
        const token = await getToken();
        if (!token) {
          setBootstrapped();
          return;
        }
        useAuthStore.setState({ isAuthenticated: true });
        const user = await getProfile();
        if (user) {
          setUser(user);
        }
      } catch (err) {
        console.warn('[AuthBootstrap] Error during auth bootstrap:', err);
      } finally {
        setBootstrapped();
      }
    })();
  }, []);
}
