import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/lib/api';

export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'INCUBATION' | 'ACCELERATION' | 'WORKSHOP' | 'SEMINAR' | 'COMPETITION';
  image?: string;
  ctaText?: string;
  ctaUrl?: string;
  requiresAuth: boolean;
  isActive: boolean;
  order?: number;
}

export interface ProgramFilters {
  active?: boolean;
}

export const usePrograms = (filters: ProgramFilters = {}) => {
  return useQuery({
    queryKey: ['programs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.active !== undefined) params.append('active', filters.active.toString());

      const { data } = await apiClient.get<ApiResponse<Program[]>>(`/programs?${params.toString()}`);
      return data.data; // Program[]
    },
  });
};

export const useProgramBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['programs', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Program>>(`/programs/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
};
