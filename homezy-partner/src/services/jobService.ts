import apiClient from './apiClient';
import { Job, JobStatus } from '@/types/models';

function normalizeJob(raw: any): Job {
  return {
    id: raw.id,
    serviceName: raw.serviceName || raw.service?.name || 'Homezy Service',
    categoryId: raw.categoryId || raw.service?.categoryId || 'general',
    scheduledAt: raw.scheduledAt || new Date().toISOString(),
    status: raw.status || 'PENDING',
    price: Number(raw.price) || 499,
    paymentMode: raw.paymentMode || 'ONLINE',
    paymentStatus: raw.paymentStatus || 'PENDING',
    customer: {
      name: raw.customer?.name || 'Valued Customer',
      phone: raw.customer?.phone || '+91 9999999999',
    },
    address: {
      line1: raw.address?.line1 || 'Customer Address',
      line2: raw.address?.line2 || '',
      city: raw.address?.city || 'Gurugram',
      state: raw.address?.state || 'Haryana',
      pincode: raw.address?.pincode || '122002',
      latitude: raw.address?.latitude || 28.4908,
      longitude: raw.address?.longitude || 77.0917,
    },
    notes: raw.notes || '',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export async function getIncomingJobs(): Promise<Job[]> {
  try {
    const { data } = await apiClient.get('/provider/jobs/incoming');
    if (Array.isArray(data)) {
      return data.map(normalizeJob);
    }
    return [];
  } catch (err) {
    console.warn('[jobService] getIncomingJobs error:', err);
    return [];
  }
}

export async function getActiveJobs(): Promise<Job[]> {
  try {
    const { data } = await apiClient.get('/provider/jobs/active');
    if (Array.isArray(data)) {
      return data.map(normalizeJob);
    }
    return [];
  } catch (err) {
    console.warn('[jobService] getActiveJobs error:', err);
    return [];
  }
}

export async function getJobHistory(): Promise<Job[]> {
  try {
    const { data } = await apiClient.get('/provider/jobs/history');
    if (Array.isArray(data)) {
      return data.map(normalizeJob);
    }
    return [];
  } catch (err) {
    console.warn('[jobService] getJobHistory error:', err);
    return [];
  }
}

export async function getJobById(id: string): Promise<Job> {
  try {
    const { data } = await apiClient.get(`/provider/jobs/${id}`);
    return normalizeJob(data);
  } catch (err) {
    console.warn(`[jobService] getJobById (${id}) error:`, err);
    throw err;
  }
}

export async function acceptJob(jobId: string): Promise<Job> {
  const { data } = await apiClient.post('/provider/accept', { jobId });
  return normalizeJob(data);
}

export async function rejectJob(jobId: string, reason?: string): Promise<void> {
  await apiClient.post('/provider/reject', { jobId, reason });
}

export async function updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
  const endpointByStatus: Partial<Record<JobStatus, string>> = {
    PROVIDER_ARRIVED: '/provider/arrived',
    IN_PROGRESS: '/provider/start',
    COMPLETED: '/provider/complete',
  };
  const endpoint = endpointByStatus[status] ?? '/provider/status';
  const { data } = await apiClient.post(endpoint, { jobId, status });
  return normalizeJob(data);
}
