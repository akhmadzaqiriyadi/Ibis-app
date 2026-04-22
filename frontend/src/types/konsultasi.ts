import { User } from './auth';
import { KategoriUsaha } from './master-data';
import { PlatformPenjualan } from './inkubasi';

export type KonsultasiStatus = 'PENDING' | 'ASSIGNED' | 'MENTOR_CONFIRMED' | 'MENTOR_DECLINED' | 'MENTOR_TIMEOUT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type MetodeKonsultasi = 'ONLINE' | 'OFFLINE';

export interface KonsultasiApplication {
  id: string;
  userId: string;
  namaPemilik: string;
  tahunBerdiri: number;
  kategoriUsahaId: string;
  rataOmsetPerBulan: string;
  platformPenjualan: PlatformPenjualan;
  uraianProduk: string;
  topikKonsultasi: string;
  preferredDate: string;
  metode: MetodeKonsultasi;
  
  status: KonsultasiStatus;
  assignedMentorId?: string | null;
  assignedAt?: string | null;
  assignedById?: string | null;
  mentorResponseDeadline?: string | null;
  mentorConfirmedAt?: string | null;
  mentorDeclineReason?: string | null;
  
  confirmedAt?: string | null;
  confirmedById?: string | null;
  confirmedDate?: string | null;
  meetingLink?: string | null;
  meetingLocation?: string | null;
  
  cancelledAt?: string | null;
  cancelReason?: string | null;
  completedAt?: string | null;

  // Laporan pasca konsultasi
  laporanMahasiswa?: string | null;
  laporanSubmittedAt?: string | null;

  createdAt: string;
  updatedAt: string;
  
  // Relations
  user?: Partial<User>;
  kategoriUsaha?: Partial<KategoriUsaha>;
  assignedMentor?: Partial<User>;
  assignedBy?: Partial<User>;
  confirmedBy?: Partial<User>;
}

export interface KonsultasiApplicationListResponse {
  items: KonsultasiApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KonsultasiWaLink {
  waLink: string;
  adminPhone: string;
}
