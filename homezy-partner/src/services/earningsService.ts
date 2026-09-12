import apiClient from './apiClient';
import { EarningsEntry, EarningsSummary } from '@/types/models';

export async function getEarningsSummary(): Promise<EarningsSummary> {
  try {
    const { data } = await apiClient.get('/provider/earnings/summary');
    return data;
  } catch (err: any) {
    console.warn('[earningsService] getEarningsSummary fallback to 0:', err?.message);
    return {
      todayEarnings: 0,
      weekEarnings: 0,
      monthEarnings: 0,
      completedJobsToday: 0,
      completedJobsTotal: 0,
    };
  }
}

export async function getEarningsHistory(): Promise<EarningsEntry[]> {
  try {
    const { data } = await apiClient.get('/provider/earnings/history');
    if (Array.isArray(data)) return data;
    return [];
  } catch (err: any) {
    console.warn('[earningsService] getEarningsHistory error:', err?.message);
    return [];
  }
}
