import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';

export const INKUBASI_KEYS = {
  allPeriods: ['inkubasi', 'periods'] as const,
  activePeriod: ['inkubasi', 'periods', 'active'] as const,
  myApps: ['inkubasi', 'applications', 'my'] as const,
  allApps: (params?: Record<string, unknown>) => ['inkubasi', 'applications', 'all', params] as const,
  appDetail: (id: string) => ['inkubasi', 'applications', 'detail', id] as const,
};

// ─── PERIOD HOOKS ──────────────────────────────────────────────

export const useGetPeriods = () => useQuery({ queryKey: INKUBASI_KEYS.allPeriods, queryFn: api.getPeriods });
export const useGetActivePeriod = () => useQuery({ queryKey: INKUBASI_KEYS.activePeriod, queryFn: api.getActivePeriod });

export const useCreatePeriod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPeriod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INKUBASI_KEYS.allPeriods });
      qc.invalidateQueries({ queryKey: INKUBASI_KEYS.activePeriod });
    },
  });
};

export const useUpdatePeriod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updatePeriod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INKUBASI_KEYS.allPeriods });
      qc.invalidateQueries({ queryKey: INKUBASI_KEYS.activePeriod });
    },
  });
};

export const useDeletePeriod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deletePeriod,
    onSuccess: () => qc.invalidateQueries({ queryKey: INKUBASI_KEYS.allPeriods }),
  });
};

// ─── APPLICATION HOOKS ─────────────────────────────────────────

export const useGetMyApplications = () => useQuery({ queryKey: INKUBASI_KEYS.myApps, queryFn: api.getMyApplications });

export const useGetAllApplications = (params?: Record<string, unknown>) => useQuery({
  queryKey: INKUBASI_KEYS.allApps(params),
  queryFn: () => api.getAllApplications(params),
});

export const useGetApplicationById = (id: string) => useQuery({
  queryKey: INKUBASI_KEYS.appDetail(id),
  queryFn: () => api.getApplicationById(id),
  enabled: !!id,
});

export const useSubmitApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.submitApplication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INKUBASI_KEYS.myApps });
      qc.invalidateQueries({ queryKey: INKUBASI_KEYS.allApps() });
    },
  });
};

export const useReviewApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.reviewApplication,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: INKUBASI_KEYS.allApps() });
      qc.invalidateQueries({ queryKey: INKUBASI_KEYS.appDetail(variables.id) });
    },
  });
};
