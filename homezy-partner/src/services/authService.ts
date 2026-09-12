import apiClient from './apiClient';
import { Provider } from '@/types/models';

export interface RequestOtpPayload { phone: string; email?: string; }
export interface VerifyOtpPayload { phone: string; otp: string; }
export interface EmailLoginPayload { email: string; password: string; }

export interface AuthResponse {
  token: string;
  provider: Provider;
  isNewProvider: boolean;
}

export async function requestOtp(payload: RequestOtpPayload): Promise<{ sent: boolean }> {
  try {
    const { data } = await apiClient.post('/provider/auth/request-otp', payload);
    return data;
  } catch (err: any) {
    console.error('[authService] requestOtp error:', err?.response?.data || err.message);
    throw err;
  }
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post('/provider/auth/verify-otp', payload);
    return data;
  } catch (err: any) {
    console.error('[authService] verifyOtp error:', err?.response?.data || err.message);
    throw err;
  }
}

export async function loginWithPassword(payload: EmailLoginPayload): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post('/provider/auth/login', payload);
    return data;
  } catch (err: any) {
    console.error('[authService] loginWithPassword error:', err?.response?.data || err.message);
    throw err;
  }
}

export async function getProfile(): Promise<Provider> {
  try {
    const { data } = await apiClient.get('/provider/me');
    return data;
  } catch (err: any) {
    console.error('[authService] getProfile error:', err?.response?.data || err.message);
    throw err;
  }
}

export async function updateProfile(update: Partial<Provider>): Promise<Provider> {
  const { data } = await apiClient.patch('/provider/me', update);
  return data;
}

export async function setDutyStatus(isOnDuty: boolean): Promise<Provider> {
  const { data } = await apiClient.patch('/provider/me/duty', { isOnDuty });
  return data;
}
