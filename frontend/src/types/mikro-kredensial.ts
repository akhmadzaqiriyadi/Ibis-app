import { User } from './auth';

export type MikroKredensialStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface MikroKredensialKursus {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  duration?: number | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MikroKredensialEnrollment {
  id: string;
  userId: string;
  kursusId: string;
  status: MikroKredensialStatus;
  completedAt?: string | null;
  score?: number | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user?: Partial<User>;
  kursus?: Partial<MikroKredensialKursus>;
  certificate?: Partial<Certificate>;
}

export interface Certificate {
  id: string;
  userId: string;
  enrollmentId: string;
  certificateNumber: string;
  issuedAt: string;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user?: Partial<User>;
  enrollment?: Partial<MikroKredensialEnrollment>;
}
