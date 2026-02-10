import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/lib/api';

export interface TeamMember {
  id: string;
  name: string;
  title?: string;
  type: 'LEADER' | 'STAFF' | 'MENTOR' | 'MEMBER';
  division?: string;
  image?: string;
  bio?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  isActive: boolean;
}

export interface TeamFilters {
  type?: string;
  division?: string;
  active?: boolean;
}

export const useTeam = (filters: TeamFilters = {}) => {
  return useQuery({
    queryKey: ['team', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.division) params.append('division', filters.division);
      if (filters.active !== undefined) params.append('active', filters.active.toString());

      const { data } = await apiClient.get<ApiResponse<TeamMember[]>>(`/team?${params.toString()}`);
      return data.data; // TeamMember[]
    },
  });
};
