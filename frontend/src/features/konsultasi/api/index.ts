import { fetcher, apiClient, PaginatedResponse } from '@/lib/api';
import { KonsultasiApplication, KonsultasiStatus } from '@/types';

// ─── USER (MAHASISWA) ─────────────────────────────────────────
export const getMyKonsultasiApps = () => fetcher<KonsultasiApplication[]>('/konsultasi/applications/my');

export const submitKonsultasiApp = async (data: Record<string, unknown>) => {
  const res = await apiClient.post('/konsultasi/applications', data);
  return res.data;
};

// ─── ADMIN / STAFF ────────────────────────────────────────────
export const getAllKonsultasiApps = (params?: { page?: number; limit?: number; status?: KonsultasiStatus; mentorId?: string }) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return fetcher<PaginatedResponse<KonsultasiApplication>>(`/konsultasi/applications?${query}`);
};

export const getKonsultasiAppById = (id: string) => fetcher<KonsultasiApplication>(`/konsultasi/applications/${id}`);

export const assignMentor = async ({ id, assignedMentorId, mentorResponseDeadline }: { id: string; assignedMentorId: string; mentorResponseDeadline: string }) => {
  const res = await apiClient.patch(`/konsultasi/applications/${id}/assign`, { assignedMentorId, mentorResponseDeadline });
  return res.data;
};

export const confirmKonsultasi = async ({ id, confirmedDate, meetingLink, meetingLocation }: { id: string; confirmedDate: string; meetingLink?: string; meetingLocation?: string }) => {
  const res = await apiClient.patch(`/konsultasi/applications/${id}/confirm`, { confirmedDate, meetingLink, meetingLocation });
  return res.data;
};

export const getKonsultasiWaLink = async (id: string) => {
  const res = await apiClient.get<{ waLink: string; adminPhone: string }>(`/konsultasi/applications/${id}/wa-link`);
  return res.data;
};

export const cancelKonsultasi = async ({ id, reason }: { id: string; reason?: string }) => {
  const res = await apiClient.patch(`/konsultasi/applications/${id}/cancel`, { reason });
  return res.data;
};

export const completeKonsultasi = async (id: string) => {
  const res = await apiClient.patch(`/konsultasi/applications/${id}/complete`);
  return res.data;
};

// ─── MENTOR ───────────────────────────────────────────────────
export const getMyMentorApps = () => fetcher<KonsultasiApplication[]>('/konsultasi/applications/mentor/my');

export const mentorRespond = async ({ id, bersedia, declineReason }: { id: string; bersedia: boolean; declineReason?: string }) => {
  const res = await apiClient.patch(`/konsultasi/applications/${id}/mentor-response`, { bersedia, declineReason });
  return res.data;
};
