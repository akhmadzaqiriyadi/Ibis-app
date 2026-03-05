import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as api from '../api';

export const AUTH_KEYS = {
  me: ['auth', 'me'] as const,
  pendingUsers: (params?: Record<string, unknown>) => ['auth', 'pending-users', params] as const,
  users: (params?: Record<string, unknown>) => ['auth', 'users', params] as const,
};

// ─── GET ME ──────────────────────────────────────

export const useGetMe = () => useQuery({
  queryKey: AUTH_KEYS.me,
  queryFn: api.getMe,
  retry: false, // Don't keep retrying if unauthenticated
});

// ─── LOGIN & REGISTER ────────────────────────────

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.loginUser,
    onSuccess: () => {
      // Invalidate get me
      qc.invalidateQueries({ queryKey: AUTH_KEYS.me });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: api.registerUser,
  });
};

// ─── VERIFIKASI AKUN (ADMIN ONLY) ────────────────

export const usePendingUsers = (params?: Record<string, unknown>) => useQuery({
  queryKey: AUTH_KEYS.pendingUsers(params),
  queryFn: () => api.getPendingUsers(params),
  placeholderData: keepPreviousData,
});

export const useVerifyUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.verifyUser,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['auth', 'pending-users'], refetchType: 'all' });
    },
  });
};

// ─── CRUD USER MANAGEMENT ────────────────────────
export const useUsers = (params?: Record<string, unknown>) => useQuery({
  queryKey: AUTH_KEYS.users(params),
  queryFn: () => api.getUsers(params),
  placeholderData: keepPreviousData,
});

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateUser,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['auth', 'users'], refetchType: 'all' });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['auth', 'users'], refetchType: 'all' });
    },
  });
};
