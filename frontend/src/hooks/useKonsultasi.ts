import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/lib/api';
import {
  KonsultasiApplication,
  KonsultasiApplicationListResponse,
  KonsultasiWaLink,
} from '@/types/konsultasi';

// =================================================================
// USER HOOKS
// =================================================================

// Check apakah ada aplikasi yang masih aktif (untuk guard tombol apply)
export const useMyKonsultasiAppsRaw = () => {
  return useQuery({
    queryKey: ['my-konsultasi-applications-raw'],
    queryFn: async (): Promise<KonsultasiApplication[]> => {
      const { data } = await apiClient.get<ApiResponse<KonsultasiApplicationListResponse>>(
        '/konsultasi/applications/my?limit=100'
      );
      return data.data.items;
    },
  });
};

export const useMyKonsultasiApplications = (filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());

  return useQuery({
    queryKey: ['my-konsultasi-applications', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<KonsultasiApplicationListResponse>>(
        `/konsultasi/applications/my?${queryParams.toString()}`
      );
      return data.data;
    },
  });
};

export const useSubmitKonsultasi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      namaPemilik: string;
      tahunBerdiri: number;
      kategoriUsahaId: string;
      rataOmsetPerBulan: string;
      platformPenjualan: string;
      uraianProduk: string;
      topikKonsultasi: string;
      preferredDate: string;
      metode: string;
    }) => {
      const { data } = await apiClient.post<ApiResponse<KonsultasiApplication>>('/konsultasi/applications', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-konsultasi-applications'] });
    },
  });
};

// =================================================================
// ADMIN HOOKS
// =================================================================

export const useAllKonsultasiApplications = (filters: {
  status?: string;
  mentorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.mentorId) queryParams.append('mentorId', filters.mentorId);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());

  return useQuery({
    queryKey: ['all-konsultasi-applications', filters],
    queryFn: async (): Promise<KonsultasiApplicationListResponse> => {
      const { data } = await apiClient.get<ApiResponse<KonsultasiApplicationListResponse>>(
        `/konsultasi/applications?${queryParams.toString()}`
      );
      return data.data;
    },
  });
};

export const useKonsultasiApplicationById = (id: string) => {
  return useQuery({
    queryKey: ['konsultasi-application', id],
    queryFn: async (): Promise<KonsultasiApplication> => {
      const { data } = await apiClient.get<ApiResponse<KonsultasiApplication>>(`/konsultasi/applications/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useAssignMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; assignedMentorId: string; mentorResponseDeadline: string }) =>
      apiClient.patch(`/konsultasi/applications/${id}/assign`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['all-konsultasi-applications'] });
      queryClient.invalidateQueries({ queryKey: ['konsultasi-application', id] });
    },
  });
};

export const useConfirmKonsultasi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; confirmedDate: string; meetingLink?: string; meetingLocation?: string }) =>
      apiClient.patch(`/konsultasi/applications/${id}/confirm`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['all-konsultasi-applications'] });
      queryClient.invalidateQueries({ queryKey: ['konsultasi-application', id] });
    },
  });
};

export const useCancelKonsultasi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.patch(`/konsultasi/applications/${id}/cancel`, { reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['all-konsultasi-applications'] });
      queryClient.invalidateQueries({ queryKey: ['konsultasi-application', id] });
      queryClient.invalidateQueries({ queryKey: ['my-konsultasi-applications'] });
    },
  });
};

export const useCompleteKonsultasi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/konsultasi/applications/${id}/complete`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['all-konsultasi-applications'] });
      queryClient.invalidateQueries({ queryKey: ['konsultasi-application', id] });
    },
  });
};

export const useGenerateWaLink = (id: string) => {
  return useQuery({
    queryKey: ['wa-link', id],
    queryFn: async (): Promise<KonsultasiWaLink> => {
      const { data } = await apiClient.get<ApiResponse<KonsultasiWaLink>>(`/konsultasi/applications/${id}/wa-link`);
      return data.data;
    },
    enabled: false,
  });
};

// =================================================================
// MENTOR HOOKS
// =================================================================

export const useMentorKonsultasiApplications = (filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());

  return useQuery({
    queryKey: ['mentor-konsultasi-applications', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<KonsultasiApplicationListResponse>>(
        `/konsultasi/applications/mentor/my?${queryParams.toString()}`
      );
      return data.data;
    },
  });
};

export const useMentorRespond = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; bersedia: boolean; declineReason?: string }) =>
      apiClient.patch(`/konsultasi/applications/${id}/mentor-response`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['mentor-konsultasi-applications'] });
      queryClient.invalidateQueries({ queryKey: ['konsultasi-application', id] });
    },
  });
};

// =================================================================
// MAHASISWA — Laporan Pasca Konsultasi
// =================================================================

export const useSubmitLaporan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, laporanMahasiswa }: { id: string; laporanMahasiswa: string }) =>
      apiClient.post(`/konsultasi/applications/${id}/laporan`, { laporanMahasiswa }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['konsultasi-application', id] });
      queryClient.invalidateQueries({ queryKey: ['my-konsultasi-applications'] });
    },
  });
};
