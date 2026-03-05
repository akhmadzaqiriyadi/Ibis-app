import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';

export const MK_KEYS = {
  kursusList: (all: boolean) => ['mikro-kredensial', 'kursus', { all }] as const,
  kursusDetail: (slug: string) => ['mikro-kredensial', 'kursus', slug] as const,
  myEnrollments: ['mikro-kredensial', 'enroll', 'my'] as const,
  allEnrollments: (params?: Record<string, unknown>) => ['mikro-kredensial', 'enroll', 'all', params] as const,
  myCertificates: ['mikro-kredensial', 'certificates', 'my'] as const,
  verifyCertificate: (certNum: string) => ['mikro-kredensial', 'certificates', 'verify', certNum] as const,
};

// ─── KURSUS HOOKS ───────────────────────────────────

export const useGetKursusList = (all: boolean = false) => useQuery({
  queryKey: MK_KEYS.kursusList(all),
  queryFn: () => api.getKursusList(all),
});

export const useGetKursusBySlug = (slug: string) => useQuery({
  queryKey: MK_KEYS.kursusDetail(slug),
  queryFn: () => api.getKursusBySlug(slug),
  enabled: !!slug,
});

export const useCreateKursus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createKursus,
    onSuccess: () => qc.invalidateQueries({ queryKey: MK_KEYS.kursusList(true) }),
  });
};

export const useUpdateKursus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateKursus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MK_KEYS.kursusList(true) });
      qc.invalidateQueries({ queryKey: MK_KEYS.kursusList(false) });
    },
  });
};

export const useDeleteKursus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteKursus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MK_KEYS.kursusList(true) });
      qc.invalidateQueries({ queryKey: MK_KEYS.kursusList(false) });
    },
  });
};

// ─── ENROLLMENT HOOKS ───────────────────────────────

export const useGetMyEnrollments = () => useQuery({
  queryKey: MK_KEYS.myEnrollments,
  queryFn: api.myEnrollments,
});

export const useGetAllEnrollments = (params?: Record<string, unknown>) => useQuery({
  queryKey: MK_KEYS.allEnrollments(params),
  queryFn: () => api.getAllEnrollments(params),
});

export const useEnrollKursus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.enrollKursus,
    onSuccess: () => qc.invalidateQueries({ queryKey: MK_KEYS.myEnrollments }),
  });
};

export const useCompleteEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.completeEnrollment,
    onSuccess: () => {
      // Auto ceritificate created or failed status updated
      qc.invalidateQueries({ queryKey: MK_KEYS.allEnrollments() });
      qc.invalidateQueries({ queryKey: MK_KEYS.myEnrollments }); // just in case user is viewing their own somehow? admin side usually
    },
  });
};

// ─── CERTIFICATES HOOKS ─────────────────────────────

export const useGetMyCertificates = () => useQuery({
  queryKey: MK_KEYS.myCertificates,
  queryFn: api.myCertificates,
});

export const useVerifyCertificate = (certNum: string) => useQuery({
  queryKey: MK_KEYS.verifyCertificate(certNum),
  queryFn: () => api.verifyCertificate(certNum),
  enabled: !!certNum,
});
