import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';

export const KONSULTASI_KEYS = {
  myApps: ['konsultasi', 'my'] as const,
  allApps: (params?: Record<string, unknown>) => ['konsultasi', 'all', params] as const,
  appDetail: (id: string) => ['konsultasi', 'detail', id] as const,
  mentorMyApps: ['konsultasi', 'mentor', 'my'] as const,
};

// ─── QUERIES ───────────────────────────────────────────────────

export const useGetMyKonsultasiApps = () => useQuery({
  queryKey: KONSULTASI_KEYS.myApps,
  queryFn: api.getMyKonsultasiApps,
});

export const useGetAllKonsultasiApps = (params?: Record<string, unknown>) => useQuery({
  queryKey: KONSULTASI_KEYS.allApps(params),
  queryFn: () => api.getAllKonsultasiApps(params),
});

export const useGetKonsultasiAppById = (id: string) => useQuery({
  queryKey: KONSULTASI_KEYS.appDetail(id),
  queryFn: () => api.getKonsultasiAppById(id),
  enabled: !!id,
});

export const useGetMyMentorApps = () => useQuery({
  queryKey: KONSULTASI_KEYS.mentorMyApps,
  queryFn: api.getMyMentorApps,
});

// ─── MUTATIONS ─────────────────────────────────────────────────

export const useSubmitKonsultasiApp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.submitKonsultasiApp,
    onSuccess: () => qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.myApps }),
  });
};

export const useAssignMentor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.assignMentor,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.allApps() });
      qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.appDetail(vars.id) });
    },
  });
};

export const useConfirmKonsultasi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.confirmKonsultasi,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.allApps() });
      qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.appDetail(vars.id) });
    },
  });
};

export const useCancelKonsultasi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.cancelKonsultasi,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.allApps() });
      qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.appDetail(vars.id) });
    },
  });
};

export const useCompleteKonsultasi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.completeKonsultasi,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.allApps() });
      qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.appDetail(id) });
    },
  });
};

export const useMentorRespond = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.mentorRespond,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.mentorMyApps });
      // Invalidate if the user somehow looks at detail immediately
      qc.invalidateQueries({ queryKey: KONSULTASI_KEYS.appDetail(vars.id) });
    },
  });
};
