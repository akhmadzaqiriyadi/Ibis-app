import { User } from './auth';
import { KategoriUsaha } from './master-data';

export type InkubasiStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PlatformPenjualan = 'ONLINE' | 'OFFLINE' | 'KEDUANYA';

export interface InkubasiPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface InkubasiApplication {
  id: string;
  userId: string;
  periodId: string;
  namaPemilik: string;
  tahunBerdiri: number;
  kategoriUsahaId: string;
  rataOmsetPerBulan: string;
  platformPenjualan: PlatformPenjualan;
  uraianProduk: string;
  kendala: string;
  harapan: string;
  status: InkubasiStatus;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user?: Partial<User>;
  period?: Partial<InkubasiPeriod>;
  kategoriUsaha?: Partial<KategoriUsaha>;
  reviewedBy?: Partial<User>;
}

export interface InkubasiApplicationListResponse {
  items: InkubasiApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
