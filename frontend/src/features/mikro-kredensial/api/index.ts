import { fetcher, apiClient, PaginatedResponse } from '@/lib/api';
import {
  MikroKredensialKursus,
  MikroKredensialEnrollment,
  Certificate,
  MikroKredensialStatus,
  MikroKredensialModul,
  MikroKredensialQuiz,
} from '@/types';

// ─── KURSUS ─────────────────────────────────────────────

export const getKursusList = (all: boolean = false) => fetcher<MikroKredensialKursus[]>(`/mikro-kredensial/kursus?all=${all}`);

export const getKursusBySlug = (slug: string) => fetcher<MikroKredensialKursus>(`/mikro-kredensial/kursus/${slug}`);

export const createKursus = async (data: { title: string; slug: string; description: string; duration?: number; thumbnail?: string; order?: number }) => {
  const res = await apiClient.post('/mikro-kredensial/kursus', data);
  return res.data;
};

export const updateKursus = async ({ id, ...data }: { id: string; title?: string; slug?: string; description?: string; duration?: number; thumbnail?: string; isActive?: boolean; order?: number }) => {
  const res = await apiClient.put(`/mikro-kredensial/kursus/${id}`, data);
  return res.data;
};

export const deleteKursus = async (id: string) => {
  const res = await apiClient.delete(`/mikro-kredensial/kursus/${id}`);
  return res.data;
};

// ─── ENROLLMENT ──────────────────────────────────────────

export const myEnrollments = () => fetcher<MikroKredensialEnrollment[]>('/mikro-kredensial/enroll/my');

export const getEnrollmentById = (id: string) => fetcher<MikroKredensialEnrollment>(`/mikro-kredensial/enroll/${id}`);

export const getAllEnrollments = (params?: { page?: number; limit?: number; status?: MikroKredensialStatus }) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return fetcher<PaginatedResponse<MikroKredensialEnrollment>>(`/mikro-kredensial/enroll?${query}`);
};

export const enrollKursus = async (kursusId: string) => {
  const res = await apiClient.post('/mikro-kredensial/enroll', { kursusId });
  return res.data;
};

export const completeEnrollment = async ({ id, score }: { id: string; score: number }) => {
  const res = await apiClient.patch(`/mikro-kredensial/enroll/${id}/complete`, { score });
  return res.data;
};

// ─── CERTIFICATE ─────────────────────────────────────────

export const myCertificates = () => fetcher<Certificate[]>('/mikro-kredensial/certificates/my');

export const verifyCertificate = (certNumber: string) => fetcher<Certificate>(`/mikro-kredensial/certificates/verify/${encodeURIComponent(certNumber)}`);

// ─── MODUL & MATERI ──────────────────────────────────────

export const getModulesByKursus = (kursusId: string) =>
  fetcher<MikroKredensialModul[]>(`/mikro-kredensial/kursus/${kursusId}/modules`);

export const createModule = async (kursusId: string, data: { title: string; content: string; duration?: number; videoUrl?: string; fileUrl?: string; order?: number }) => {
  const res = await apiClient.post(`/mikro-kredensial/kursus/${kursusId}/modules`, data);
  return res.data;
};

export const updateModule = async ({ id, ...data }: { id: string; title?: string; content?: string; duration?: number; videoUrl?: string; fileUrl?: string; order?: number }) => {
  const res = await apiClient.put(`/mikro-kredensial/modules/${id}`, data);
  return res.data;
};

export const deleteModule = async (id: string) => {
  const res = await apiClient.delete(`/mikro-kredensial/modules/${id}`);
  return res.data;
};

// ─── BANK SOAL KUIS ──────────────────────────────────────

export const getQuizzesByKursus = (kursusId: string) =>
  fetcher<MikroKredensialQuiz[]>(`/mikro-kredensial/kursus/${kursusId}/quizzes`);

export const createQuiz = async (kursusId: string, data: { question: string; options: string[]; correctAnswer: number; explanation?: string; order?: number }) => {
  const res = await apiClient.post(`/mikro-kredensial/kursus/${kursusId}/quizzes`, data);
  return res.data;
};

export const updateQuiz = async ({ id, ...data }: { id: string; question?: string; options?: string[]; correctAnswer?: number; explanation?: string; order?: number }) => {
  const res = await apiClient.put(`/mikro-kredensial/quizzes/${id}`, data);
  return res.data;
};

export const deleteQuiz = async (id: string) => {
  const res = await apiClient.delete(`/mikro-kredensial/quizzes/${id}`);
  return res.data;
};
