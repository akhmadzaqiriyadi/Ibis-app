'use client';

import { useState } from 'react';
import {
  MikroKredensialKursus,
  MikroKredensialModul,
  MikroKredensialQuiz,
} from '@/types';
import {
  useGetModulesByKursus,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useGetQuizzesByKursus,
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
} from '@/features/mikro-kredensial/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getSafeStorageUrl } from '@/lib/image-utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BookOpen,
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  Loader2,
  Layers,
  FileText,
  Video,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ManageContentDialogProps {
  kursus: MikroKredensialKursus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageCourseContentDialog({
  kursus,
  open,
  onOpenChange,
}: ManageContentDialogProps) {
  const [activeTab, setActiveTab] = useState<'modules' | 'quizzes'>('modules');

  // ─── State Modul ──────────────────────────────────────────
  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<MikroKredensialModul | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDuration, setModuleDuration] = useState(15);
  const [moduleContent, setModuleContent] = useState('');
  const [moduleFileUrl, setModuleFileUrl] = useState('');
  const [moduleVideoUrl, setModuleVideoUrl] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // ─── State Kuis ───────────────────────────────────────────
  const [quizFormOpen, setQuizFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<MikroKredensialQuiz | null>(null);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<string[]>(['', '', '', '']);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState('');

  // ─── Queries & Mutations ──────────────────────────────────
  const kursusId = kursus?.id || '';
  const { data: modules = [], isLoading: loadingModules } = useGetModulesByKursus(kursusId);
  const { data: quizzes = [], isLoading: loadingQuizzes } = useGetQuizzesByKursus(kursusId);

  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();

  const createQuizMutation = useCreateQuiz();
  const updateQuizMutation = useUpdateQuiz();
  const deleteQuizMutation = useDeleteQuiz();

  // ─── Handlers Modul ───────────────────────────────────────
  const handleOpenCreateModule = () => {
    setEditingModule(null);
    setModuleTitle('');
    setModuleDuration(15);
    setModuleContent('');
    setModuleFileUrl('');
    setModuleVideoUrl('');
    setModuleFormOpen(true);
  };

  const handleOpenEditModule = (m: MikroKredensialModul) => {
    setEditingModule(m);
    setModuleTitle(m.title);
    setModuleDuration(m.duration || 15);
    setModuleContent(m.content);
    setModuleFileUrl(m.fileUrl || '');
    setModuleVideoUrl(m.videoUrl || '');
    setModuleFormOpen(true);
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'materi-pdf');

    setIsUploadingFile(true);
    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.url || res.data?.url;
      setModuleFileUrl(url);
      toast.success('File dokumen materi berhasil diunggah!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengunggah file materi');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kursusId || !moduleTitle.trim() || !moduleContent.trim()) {
      toast.error('Judul dan isi materi modul wajib diisi');
      return;
    }

    try {
      if (editingModule) {
        await updateModuleMutation.mutateAsync({
          id: editingModule.id,
          kursusId,
          title: moduleTitle.trim(),
          content: moduleContent.trim(),
          duration: moduleDuration,
          fileUrl: moduleFileUrl.trim() || undefined,
          videoUrl: moduleVideoUrl.trim() || undefined,
        });
        toast.success('Materi modul berhasil diperbarui');
      } else {
        await createModuleMutation.mutateAsync({
          kursusId,
          title: moduleTitle.trim(),
          content: moduleContent.trim(),
          duration: moduleDuration,
          fileUrl: moduleFileUrl.trim() || undefined,
          videoUrl: moduleVideoUrl.trim() || undefined,
        });
        toast.success('Modul materi baru berhasil ditambahkan');
      }
      setModuleFormOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan materi modul');
    }
  };

  const handleDeleteModule = async (id: string, title: string) => {
    if (!confirm(`Hapus modul "${title}"?`)) return;
    try {
      await deleteModuleMutation.mutateAsync({ id, kursusId });
      toast.success('Modul berhasil dihapus');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus modul');
    }
  };

  // ─── Handlers Kuis ────────────────────────────────────────
  const handleOpenCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setQuizCorrectAnswer(0);
    setQuizExplanation('');
    setQuizFormOpen(true);
  };

  const handleOpenEditQuiz = (q: MikroKredensialQuiz) => {
    setEditingQuiz(q);
    setQuizQuestion(q.question);
    setQuizOptions(q.options.length === 4 ? q.options : [...q.options, '', '', ''].slice(0, 4));
    setQuizCorrectAnswer(q.correctAnswer ?? 0);
    setQuizExplanation(q.explanation || '');
    setQuizFormOpen(true);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kursusId || !quizQuestion.trim()) {
      toast.error('Teks pertanyaan kuis wajib diisi');
      return;
    }

    const filledOptions = quizOptions.map((o) => o.trim());
    if (filledOptions.some((o) => !o)) {
      toast.error('Keempat pilihan jawaban (A, B, C, D) wajib diisi lengkap');
      return;
    }

    try {
      if (editingQuiz) {
        await updateQuizMutation.mutateAsync({
          id: editingQuiz.id,
          kursusId,
          question: quizQuestion.trim(),
          options: filledOptions,
          correctAnswer: quizCorrectAnswer,
          explanation: quizExplanation.trim() || undefined,
        });
        toast.success('Soal kuis berhasil diperbarui');
      } else {
        await createQuizMutation.mutateAsync({
          kursusId,
          question: quizQuestion.trim(),
          options: filledOptions,
          correctAnswer: quizCorrectAnswer,
          explanation: quizExplanation.trim() || undefined,
        });
        toast.success('Soal kuis baru berhasil ditambahkan ke bank soal');
      }
      setQuizFormOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan soal kuis');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Hapus soal kuis ini dari bank soal?')) return;
    try {
      await deleteQuizMutation.mutateAsync({ id, kursusId });
      toast.success('Soal kuis berhasil dihapus');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus soal kuis');
    }
  };

  if (!kursus) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Kelola Konten & Evaluasi
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Kursus: <span className="font-semibold text-gray-800">{kursus.title}</span> • Durasi: {kursus.duration || 60} menit
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="pt-2 flex-1 flex flex-col min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'modules' | 'quizzes')}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="grid grid-cols-2 max-w-md mx-auto bg-gray-100/80 p-1 rounded-xl mb-4">
              <TabsTrigger value="modules" className="flex items-center gap-2 text-xs font-semibold">
                <BookOpen className="w-4 h-4" />
                Materi Modul ({modules.length})
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="flex items-center gap-2 text-xs font-semibold">
                <HelpCircle className="w-4 h-4" />
                Bank Soal Kuis ({quizzes.length})
              </TabsTrigger>
            </TabsList>

            {/* ════════ TAB 1: MODUL MATERI ════════ */}
            <TabsContent value="modules" className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
              {moduleFormOpen ? (
                /* Form Tambah/Edit Modul */
                <form onSubmit={handleSaveModule} className="bg-gray-50/80 border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      {editingModule ? 'Edit Materi Modul' : 'Tambah Modul Materi Baru'}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setModuleFormOpen(false)}
                      className="text-xs text-gray-500"
                    >
                      Batal
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">Judul Modul</Label>
                      <Input
                        value={moduleTitle}
                        onChange={(e) => setModuleTitle(e.target.value)}
                        placeholder="Contoh: Modul 1: Pengenalan Digital Marketing"
                        required
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">Estimasi Baca (Menit)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={moduleDuration}
                        onChange={(e) => setModuleDuration(Number(e.target.value))}
                        required
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Konten Materi Lengkap (Teks / Ringkasan)</Label>
                    <Textarea
                      rows={6}
                      value={moduleContent}
                      onChange={(e) => setModuleContent(e.target.value)}
                      placeholder="Tuliskan materi pembelajaran modul ini..."
                      required
                      className="bg-white font-sans text-xs leading-relaxed"
                    />
                  </div>

                  {/* Dokumen PDF & Video URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-red-500" />
                        Dokumen Materi / Slide PDF (Opsional)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={moduleFileUrl}
                          onChange={(e) => setModuleFileUrl(e.target.value)}
                          placeholder="https://... atau upload file"
                          className="bg-white text-xs"
                        />
                        <label className="cursor-pointer shrink-0">
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleUploadFile}
                            className="hidden"
                            disabled={isUploadingFile}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-9"
                            disabled={isUploadingFile}
                            onClick={(e) => {
                              (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                            }}
                          >
                            {isUploadingFile ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 mr-1" />
                            )}
                            Upload PDF
                          </Button>
                        </label>
                      </div>
                      {moduleFileUrl && (
                        <div className="mt-1 flex items-center gap-2">
                          <a
                            href={getSafeStorageUrl(moduleFileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" /> Preview Dokumen PDF
                          </a>
                        </div>
                      )}
                      <p className="text-[11px] text-gray-400">
                        Format PDF (maks. 25MB) akan otomatis ditampilkan di reader interaktif peserta.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-blue-500" />
                        Link Video Pembelajaran (Opsional)
                      </Label>
                      <Input
                        value={moduleVideoUrl}
                        onChange={(e) => setModuleVideoUrl(e.target.value)}
                        placeholder="Contoh: https://youtube.com/watch?v=..."
                        className="bg-white text-xs"
                      />
                      <p className="text-[11px] text-gray-400">
                        Sematkan video pembelajaran tambahan untuk diputar langsung di ruang belajar.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setModuleFormOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={createModuleMutation.isPending || updateModuleMutation.isPending || isUploadingFile}
                    >
                      {(createModuleMutation.isPending || updateModuleMutation.isPending) && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      )}
                      Simpan Modul
                    </Button>
                  </div>
                </form>
              ) : (
                /* List Modul */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Peserta akan membaca materi-materi ini di ruang belajar secara berurutan.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={handleOpenCreateModule}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah Modul
                    </Button>
                  </div>

                  {loadingModules ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    </div>
                  ) : modules.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                      <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Belum ada modul materi</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Klik tombol Tambah Modul untuk membuat materi pembelajaran pertama.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {modules.map((modul, idx) => (
                        <div
                          key={modul.id}
                          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-200 hover:shadow-xs transition-all flex items-start justify-between gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border-emerald-200">
                                Bab {idx + 1}
                              </Badge>
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {modul.title}
                              </h4>
                              {modul.duration && (
                                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {modul.duration} mnt
                                </span>
                              )}
                              {modul.fileUrl && (
                                <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                  <FileText className="w-3 h-3" /> Ada PDF
                                </span>
                              )}
                              {modul.videoUrl && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                  <Video className="w-3 h-3" /> Ada Video
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {modul.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModule(modul)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-emerald-600"
                              title="Edit Modul"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteModule(modul.id, modul.title)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                              title="Hapus Modul"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ════════ TAB 2: BANK SOAL KUIS ════════ */}
            <TabsContent value="quizzes" className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
              {quizFormOpen ? (
                /* Form Tambah/Edit Soal */
                <form onSubmit={handleSaveQuiz} className="bg-gray-50/80 border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      {editingQuiz ? 'Edit Soal Kuis' : 'Tambah Soal Kuis Baru'}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuizFormOpen(false)}
                      className="text-xs text-gray-500"
                    >
                      Batal
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Pertanyaan Ujian</Label>
                    <Textarea
                      rows={3}
                      value={quizQuestion}
                      onChange={(e) => setQuizQuestion(e.target.value)}
                      placeholder="Tuliskan teks pertanyaan kuis..."
                      required
                      className="bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-700">
                      Pilihan Jawaban (Pilih radio button di kiri untuk menandai kunci jawaban yang benar)
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map((optLabel, idx) => (
                        <div
                          key={optLabel}
                          className={`p-2.5 rounded-lg border transition-all flex items-center gap-2 ${
                            quizCorrectAnswer === idx
                              ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="correctAnswer"
                            id={`opt-${idx}`}
                            checked={quizCorrectAnswer === idx}
                            onChange={() => setQuizCorrectAnswer(idx)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-gray-700 w-4">{optLabel}.</span>
                          <Input
                            value={quizOptions[idx] || ''}
                            onChange={(e) => {
                              const updated = [...quizOptions];
                              updated[idx] = e.target.value;
                              setQuizOptions(updated);
                            }}
                            placeholder={`Teks pilihan ${optLabel}`}
                            required
                            className="h-8 text-xs bg-transparent border-0 focus-visible:ring-0 px-1 shadow-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Pembahasan / Penjelasan (Opsional)</Label>
                    <Input
                      value={quizExplanation}
                      onChange={(e) => setQuizExplanation(e.target.value)}
                      placeholder="Penjelasan mengapa jawaban tersebut benar..."
                      className="bg-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuizFormOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={createQuizMutation.isPending || updateQuizMutation.isPending}
                    >
                      {(createQuizMutation.isPending || updateQuizMutation.isPending) && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      )}
                      Simpan Soal Kuis
                    </Button>
                  </div>
                </form>
              ) : (
                /* List Soal */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Soal-soal ini akan muncul pada ujian kelulusan peserta. Nilai $\ge 70$ otomatis lulus.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={handleOpenCreateQuiz}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah Soal Kuis
                    </Button>
                  </div>

                  {loadingQuizzes ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  ) : quizzes.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                      <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Belum ada bank soal kuis</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Klik tombol Tambah Soal Kuis untuk membuat pertanyaan evaluasi.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizzes.map((quiz, idx) => (
                        <div
                          key={quiz.id}
                          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 hover:shadow-xs transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-2">
                              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs mt-0.5">
                                No. {idx + 1}
                              </Badge>
                              <h4 className="text-sm font-medium text-gray-900 leading-snug">
                                {quiz.question}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditQuiz(quiz)}
                                className="h-7 w-7 p-0 text-gray-500 hover:text-indigo-600"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteQuiz(quiz.id)}
                                className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Options */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                            {quiz.options.map((opt, oIdx) => {
                              const isCorrect = quiz.correctAnswer === oIdx;
                              const optLabel = ['A', 'B', 'C', 'D'][oIdx] || `${oIdx + 1}`;
                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-lg flex items-center justify-between border ${
                                    isCorrect
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                                      : 'bg-gray-50 border-gray-100 text-gray-600'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-gray-400'}`}>
                                      {optLabel}.
                                    </span>
                                    <span>{opt}</span>
                                  </div>
                                  {isCorrect && (
                                    <span className="text-[10px] bg-emerald-600 text-white font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" /> Kunci
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {quiz.explanation && (
                            <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-md flex items-start gap-1.5">
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 not-italic shrink-0">
                                <HelpCircle className="w-3.5 h-3.5" /> Pembahasan:
                              </span>
                              <span>{quiz.explanation}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
