import apiClient from './apiClient';
import { User } from '@/types/models';

export interface RequestOtpPayload {
  phone: string;
  email?: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: User;
  isNewUser: boolean;
}

// POST /auth/request-otp — matches proposal's OTP-based customer login
export async function requestOtp(payload: RequestOtpPayload): Promise<{ sent: boolean }> {
  const { data } = await apiClient.post('/auth/request-otp', payload);
  return data;
}

// POST /auth/verify-otp
export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const { data } = await apiClient.post('/auth/verify-otp', payload);
  return data;
}

// PATCH /users/me
export async function updateProfile(update: Partial<User>): Promise<User> {
  const { data } = await apiClient.patch('/users/me', update);
  return data;
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get('/users/me');
  return data;
}
