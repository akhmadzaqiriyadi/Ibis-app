import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';

export const MASTER_DATA_KEYS = {
  allKategori: ['kategori-usaha'],
  allProdi: ['program-studi'],
};

// ─── KATEGORI USAHA ──────────────────────────────────────────────

export const useKategoriUsahaList = () => {
  return useQuery({
    queryKey: MASTER_DATA_KEYS.allKategori,
    queryFn: api.getKategoriUsahaList,
  });
};

export const useCreateKategoriUsaha = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createKategoriUsaha,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_DATA_KEYS.allKategori });
    },
  });
};

export const useUpdateKategoriUsaha = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateKategoriUsaha,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_DATA_KEYS.allKategori });
    },
  });
};

export const useDeleteKategoriUsaha = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteKategoriUsaha,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_DATA_KEYS.allKategori });
    },
  });
};

// ─── PROGRAM STUDI ──────────────────────────────────────────────

export const useProgramStudiList = () => {
  return useQuery({
    queryKey: MASTER_DATA_KEYS.allProdi,
    queryFn: api.getProgramStudiList,
  });
};

export const useCreateProgramStudi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createProgramStudi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_DATA_KEYS.allProdi });
    },
  });
};

export const useUpdateProgramStudi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateProgramStudi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_DATA_KEYS.allProdi });
    },
  });
};

export const useDeleteProgramStudi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteProgramStudi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_DATA_KEYS.allProdi });
    },
  });
};
