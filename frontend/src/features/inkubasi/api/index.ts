import { fetcher, apiClient, PaginatedResponse } from '@/lib/api';
import { InkubasiPeriod, InkubasiApplication, InkubasiStatus } from '@/types';

// ─── PERIOD ──────────────────────────────────────────────

export const getPeriods = () => fetcher<InkubasiPeriod[]>('/inkubasi/periods');

export const getActivePeriod = () => fetcher<InkubasiPeriod | null>('/inkubasi/periods/active');

export const createPeriod = async (data: { name: string; startDate: string; endDate: string; description?: string }) => {
  const res = await apiClient.post('/inkubasi/periods', data);
  return res.data;
};

export const updatePeriod = async ({ id, ...data }: { id: string; name?: string; startDate?: string; endDate?: string; isActive?: boolean; description?: string }) => {
  const res = await apiClient.put(`/inkubasi/periods/${id}`, data);
  return res.data;
};

export const deletePeriod = async (id: string) => {
  const res = await apiClient.delete(`/inkubasi/periods/${id}`);
  return res.data;
};

// ─── APPLICATION ─────────────────────────────────────────

export const getMyApplications = () => fetcher<InkubasiApplication[]>('/inkubasi/applications/my');

export const getAllApplications = (params?: { page?: number; limit?: number; status?: InkubasiStatus; periodId?: string }) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return fetcher<PaginatedResponse<InkubasiApplication>>(`/inkubasi/applications?${query}`);
};

export const getApplicationById = (id: string) => fetcher<InkubasiApplication>(`/inkubasi/applications/${id}`);

export const submitApplication = async (data: Record<string, unknown>) => {
  const res = await apiClient.post('/inkubasi/applications', data);
  return res.data;
};

export const reviewApplication = async ({ id, status, reviewNote }: { id: string; status: 'APPROVED' | 'REJECTED'; reviewNote?: string }) => {
  const res = await apiClient.patch(`/inkubasi/applications/${id}/review`, { status, reviewNote });
  return res.data;
};
