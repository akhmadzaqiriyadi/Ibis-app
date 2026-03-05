import { fetcher, apiClient } from '@/lib/api';
import { KategoriUsaha, ProgramStudi } from '@/types';

export const getKategoriUsahaList = () => fetcher<KategoriUsaha[]>('/master-data/kategori-usaha');

export const createKategoriUsaha = async (data: { name: string; order?: number }) => {
  const res = await apiClient.post('/master-data/kategori-usaha', data);
  return res.data;
};

export const updateKategoriUsaha = async ({ id, ...data }: { id: string; name?: string; isActive?: boolean; order?: number }) => {
  const res = await apiClient.put(`/master-data/kategori-usaha/${id}`, data);
  return res.data;
};

export const deleteKategoriUsaha = async (id: string) => {
  const res = await apiClient.delete(`/master-data/kategori-usaha/${id}`);
  return res.data;
};

export const getProgramStudiList = () => fetcher<ProgramStudi[]>('/master-data/program-studi');

export const createProgramStudi = async (data: { name: string; code?: string; fakultas?: string; order?: number }) => {
  const res = await apiClient.post('/master-data/program-studi', data);
  return res.data;
};

export const updateProgramStudi = async ({ id, ...data }: { id: string; name?: string; code?: string; fakultas?: string; isActive?: boolean; order?: number }) => {
  const res = await apiClient.put(`/master-data/program-studi/${id}`, data);
  return res.data;
};

export const deleteProgramStudi = async (id: string) => {
  const res = await apiClient.delete(`/master-data/program-studi/${id}`);
  return res.data;
};
