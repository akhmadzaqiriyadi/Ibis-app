import { fetcher, apiClient, PaginatedResponse, ApiResponse } from '@/lib/api';
import { User, AuthResponse } from '@/types';

// ─── LOGIN & REGISTER ────────────────────────────────────

export const loginUser = async (data: Record<string, unknown>) => {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return res.data;
};

export const registerUser = async (data: Record<string, unknown>) => {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return res.data;
};

export const getMe = () => fetcher<User>('/auth/me');

// ─── VERIFIKASI AKUN (ADMIN ONLY) ────────────────────────

export const getPendingUsers = (params?: { page?: number; limit?: number; search?: string; userType?: string }) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v != null && v !== '')
  );
  const query = new URLSearchParams(cleanParams as Record<string, string>).toString();
  return fetcher<PaginatedResponse<User>>(`/auth/pending-users?${query}`);
};

export const verifyUser = async ({ id, status, rejectionReason }: { id: string; status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }) => {
  const res = await apiClient.post(`/auth/verify/${id}`, { status, rejectionReason });
  return res.data;
};

// ─── MANAJEMEN PENGGUNA (CRUD) ───────────────────────────

export const getUsers = (params?: { page?: number; limit?: number; search?: string; roleFilter?: string, statusFilter?: string }) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v != null && v !== '')
  );
  const query = new URLSearchParams(cleanParams as Record<string, string>).toString();
  return fetcher<PaginatedResponse<User>>(`/auth/users?${query}`);
};

export const updateUser = async ({ id, data }: { id: string; data: Partial<User> }) => {
  const res = await apiClient.put(`/auth/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await apiClient.delete(`/auth/users/${id}`);
  return res.data;
};
