import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';

export interface Update {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image?: string;
  date: string;
  category?: string;
  isPublished: boolean;
}

export interface UpdateFilters {
  page?: number;
  limit?: number;
  category?: string;
  published?: boolean;
}

export const useUpdates = (filters: UpdateFilters = {}) => {
  return useQuery({
    queryKey: ['updates', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.published !== undefined) params.append('published', filters.published.toString());

      const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Update>>>(`/updates?${params.toString()}`);
      return data.data; // PaginatedResponse<Update>
    },
  });
};

export const useUpdateBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['updates', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Update>>(`/updates/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
};
