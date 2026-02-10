import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';
import { Event, EventFilters } from '@/types/event';

// Fetch multiple events (Public)
export const useEvents = (filters: EventFilters = {}) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.published !== undefined) params.append('published', filters.published.toString());

      const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Event>>>(`/events?${params.toString()}`);
      return data.data; // Return PaginatedResponse<Event>
    },
  });
};

// Fetch single event by slug
export const useEventBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['events', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Event>>(`/events/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
};
