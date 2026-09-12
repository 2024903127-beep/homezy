import axios, { AxiosError, AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { getToken, clearToken, clearStoredUser } from './tokenStorage';
import { useAuthStore } from '@/store/authStore';

function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  try {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
    if (hostUri && typeof hostUri === 'string') {
      const hostIp = hostUri.split(':')[0];
      if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
        return 'http://' + hostIp + ':4000/v1';
      }
    }
  } catch {}

  const configuredUrl = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
  if (configuredUrl) {
    return configuredUrl;
  }

  return 'http://10.244.82.126:4000/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token && token !== 'mock-token' && !token.startsWith('mock-')) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Track if we already showed the session-expired state (prevents multiple firings)
let _sessionExpiredPending = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const authHeader = error.config?.headers?.Authorization;
      // Only handle 401s that had an auth token — ignore public endpoints
      if (authHeader && String(authHeader).startsWith('Bearer ') && !_sessionExpiredPending) {
        _sessionExpiredPending = true;
        // Clear token + user from storage — keep name/phone cached so profile loads fast after re-login
        await clearToken();
        await clearStoredUser();
        // Set auth state to unauthenticated → RootNavigator shows Login screen gracefully
        useAuthStore.setState({ isAuthenticated: false, user: null });
        // Reset flag after short delay so future expirations are handled again
        setTimeout(() => { _sessionExpiredPending = false; }, 3000);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
