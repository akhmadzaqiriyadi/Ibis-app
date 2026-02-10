export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  endDate?: string | null;
  location?: string | null;
  image?: string | null;
  category?: string | null;
  status: EventStatus;
  maxParticipants?: number | null;
  registrationUrl?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  status?: EventStatus;
  category?: string;
  published?: boolean;
}
