import axios, { AxiosError, AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { getToken, clearToken } from './tokenStorage';
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

// Dedup flag — prevents multiple parallel 401s from triggering multiple logouts
let _sessionExpiredPending = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const authHeader = error.config?.headers?.Authorization;
      if (authHeader && String(authHeader).startsWith('Bearer ') && !_sessionExpiredPending) {
        _sessionExpiredPending = true;
        await clearToken();
        // Send back to login gracefully without nuking cached profile data
        useAuthStore.setState({ isAuthenticated: false, provider: null });
        setTimeout(() => { _sessionExpiredPending = false; }, 3000);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
