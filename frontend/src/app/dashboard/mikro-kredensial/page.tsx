'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import {
  useGetKursusList,
  useCreateKursus,
  useUpdateKursus,
  useDeleteKursus,
  useGetMyEnrollments,
  useGetAllEnrollments,
  useEnrollKursus,
  useCompleteEnrollment,
} from '@/features/mikro-kredensial/hooks';
import { MikroKredensialKursus, MikroKredensialEnrollment } from '@/types';
import { toast } from 'sonner';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  GraduationCap,
  PlayCircle,
  AlertCircle,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import ManageCourseContentDialog from './components/manage-content-dialog';

export default function MikroKredensialPage() {
  const { user } = useAuthStore();
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  if (isAdminOrStaff) {
    return <AdminStaffView />;
  }

  return <StudentUmkmView />;
}

// ═════════════════════════════════════════════════════════════════════════════
// VIEW MAHASISWA & UMKM
// ═════════════════════════════════════════════════════════════════════════════
function StudentUmkmView() {
  const [activeTab, setActiveTab] = useState('katalog');
  const [selectedKursus, setSelectedKursus] = useState<MikroKredensialKursus | null>(null);
  const [studyModalEnrollment, setStudyModalEnrollment] = useState<MikroKredensialEnrollment | null>(null);
  const [quizScore, setQuizScore] = useState<number>(85);

  const { data: kursusResponse, isLoading: loadingKursus } = useGetKursusList(false);
  const { data: myEnrollmentsResponse, isLoading: loadingMyEnrollments } = useGetMyEnrollments();
  const enrollMutation = useEnrollKursus();
  const completeMutation = useCompleteEnrollment();

  const kursusList: MikroKredensialKursus[] = (kursusResponse as any)?.data || kursusResponse || [];
  const myEnrollments: MikroKredensialEnrollment[] = (myEnrollmentsResponse as any)?.data || myEnrollmentsResponse || [];

  const enrolledKursusIds = new Set(myEnrollments.map((e) => e.kursusId));

  const handleEnroll = async (kursus: MikroKredensialKursus) => {
    try {
      await enrollMutation.mutateAsync(kursus.id);
      toast.success(`Berhasil mendaftar kursus "${kursus.title}"!`);
      setActiveTab('kursus-saya');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mendaftar kursus');
    }
  };

  const handleCompleteQuiz = async () => {
    if (!studyModalEnrollment) return;
    try {
      await completeMutation.mutateAsync({
        id: studyModalEnrollment.id,
        score: quizScore,
      });
      toast.success('Selamat! Evaluasi kursus berhasil diselesaikan.');
      setStudyModalEnrollment(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan hasil evaluasi');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-2xl p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            Program Sertifikasi Digital
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Mikro Kredensial IBISTEK
          </h1>
          <p className="text-emerald-50 text-base leading-relaxed">
            Percepat peningkatan kompetensi kewirausahaan, teknologi, dan bisnis digital Anda. Dapatkan sertifikat kompetensi resmi setelah menyelesaikan kelas.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl shadow-xs">
          <TabsTrigger
            value="katalog"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg px-5 py-2.5 font-medium transition-all"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Katalog Kursus
          </TabsTrigger>
          <TabsTrigger
            value="kursus-saya"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg px-5 py-2.5 font-medium transition-all relative"
          >
            <Award className="w-4 h-4 mr-2" />
            Kursus Saya
            {myEnrollments.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full font-bold">
                {myEnrollments.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: KATALOG KURSUS ────────────────────────────────────────── */}
        <TabsContent value="katalog">
          {loadingKursus ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : kursusList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">Belum Ada Kursus Tersedia</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                Kursus mikro kredensial baru sedang disiapkan oleh tim mentor IBISTEK. Silakan cek berkala!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kursusList.map((kursus) => {
                const isEnrolled = enrolledKursusIds.has(kursus.id);
                return (
                  <div
                    key={kursus.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                  >
                    <div className="h-44 bg-gradient-to-br from-emerald-500 to-teal-700 relative p-6 flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-white/25 hover:bg-white/30 text-white backdrop-blur-md border-0 text-xs">
                          {kursus.duration ? `${kursus.duration} Menit` : 'Self-paced'}
                        </Badge>
                        {isEnrolled && (
                          <Badge className="bg-white text-emerald-700 font-semibold text-xs shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Terdaftar
                          </Badge>
                        )}
                      </div>
                      <BookOpen className="w-12 h-12 text-white/30 absolute right-4 bottom-4 pointer-events-none group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {kursus.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                          {kursus.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedKursus(kursus)}
                          className="text-xs"
                        >
                          Detail Silabus
                        </Button>
                        {isEnrolled ? (
                          <Button
                            size="sm"
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs border border-emerald-200"
                            onClick={() => setActiveTab('kursus-saya')}
                          >
                            Buka Kelas
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                            onClick={() => handleEnroll(kursus)}
                            disabled={enrollMutation.isPending}
                          >
                            {enrollMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : null}
                            Daftar Kelas
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 2: KURSUS SAYA ───────────────────────────────────────────── */}
        <TabsContent value="kursus-saya">
          {loadingMyEnrollments ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : myEnrollments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">Belum Ada Kursus yang Diikuti</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
                Pilih kursus yang menarik minat Anda dari katalog dan mulai belajar sekarang!
              </p>
              <Button
                onClick={() => setActiveTab('katalog')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
              >
                Jelajahi Katalog Kursus
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myEnrollments.map((item) => {
                const isCompleted = item.status === 'COMPLETED';
                const isFailed = item.status === 'FAILED';
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between space-y-5"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <Badge
                          className={
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border-0'
                              : isFailed
                              ? 'bg-red-100 text-red-800 border-0'
                              : 'bg-amber-100 text-amber-800 border-0'
                          }
                        >
                          {isCompleted
                            ? 'Lulus / Selesai'
                            : isFailed
                            ? 'Belum Lulus'
                            : 'Sedang Berjalan'}
                        </Badge>
                        {item.score !== null && item.score !== undefined && (
                          <div className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-md text-gray-700">
                            Skor: <span className="text-emerald-600 font-bold">{item.score}</span>/100
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900">
                        {item.kursus?.title || 'Kursus Mikro Kredensial'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {item.kursus?.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Terdaftar: {new Date(item.createdAt).toLocaleDateString('id-ID')}
                        </span>
                        {item.completedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Selesai: {new Date(item.completedAt).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      {isCompleted ? (
                        <div className="flex w-full gap-2">
                          <Link href={`/dashboard/mikro-kredensial/belajar/${item.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full text-xs"
                            >
                              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                              Baca Materi
                            </Button>
                          </Link>
                          <Link href="/dashboard/certificates/my" className="flex-1">
                            <Button
                              variant="primary"
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs"
                            >
                              <Award className="w-4 h-4 mr-1.5" />
                              Sertifikat
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Link href={`/dashboard/mikro-kredensial/belajar/${item.id}`} className="w-full">
                          <Button
                            variant="primary"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs flex items-center justify-center gap-2"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Buka Ruang Belajar & Ujian
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* MODAL DETAIL KURSUS */}
      <Dialog open={!!selectedKursus} onOpenChange={() => setSelectedKursus(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {selectedKursus?.title}
            </DialogTitle>
            <DialogDescription>
              Detail program pelatihan dan sertifikasi mikro kredensial IBISTEK.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Estimasi Durasi: <strong>{selectedKursus?.duration || 60} Menit</strong></span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Deskripsi Silabus:</h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {selectedKursus?.description}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-800 space-y-1">
              <p className="font-semibold">Syarat Kelulusan Sertifikasi:</p>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-700">
                <li>Menyelesaikan materi pembelajaran mandiri.</li>
                <li>Mencapai skor evaluasi akhir minimal <strong>70 dari 100</strong>.</li>
                <li>Sertifikat digital terverifikasi otomatis terbit setelah lulus.</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedKursus(null)}>
              Tutup
            </Button>
            {selectedKursus && !enrolledKursusIds.has(selectedKursus.id) && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  handleEnroll(selectedKursus);
                  setSelectedKursus(null);
                }}
              >
                Daftar Sekarang
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL BELAJAR & SUBMIT EVALUASI */}
      <Dialog open={!!studyModalEnrollment} onOpenChange={() => setStudyModalEnrollment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Evaluasi & Penyelesaian Kursus
            </DialogTitle>
            <DialogDescription>
              {studyModalEnrollment?.kursus?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 space-y-2 border border-gray-200">
              <p className="font-semibold text-gray-800">Petunjuk Penyelesaian:</p>
              <p>
                Silakan ikuti materi pelatihan mandiri yang telah disediakan. Setelah siap, masukkan skor hasil kuis/evaluasi untuk menyelesaikan kelas ini.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quizScore" className="text-xs font-semibold">
                Skor Evaluasi / Kuis (Skala 0 - 100):
              </Label>
              <Input
                id="quizScore"
                type="number"
                min="0"
                max="100"
                value={quizScore}
                onChange={(e) => setQuizScore(Number(e.target.value))}
                className="text-center font-bold text-lg"
              />
              <p className="text-xs text-muted-foreground">
                * Skor minimal 70 untuk mendapatkan sertifikat digital kelulusan.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStudyModalEnrollment(null)}>
              Batal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCompleteQuiz}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit Hasil & Selesaikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VIEW ADMIN & STAFF (CMS MANAGEMENT)
// ═════════════════════════════════════════════════════════════════════════════
function AdminStaffView() {
  const [activeTab, setActiveTab] = useState('kursus');
  const [searchKursus, setSearchKursus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKursus, setEditingKursus] = useState<MikroKredensialKursus | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDuration, setFormDuration] = useState<number>(60);
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Grade participant modal
  const [gradeModalEnrollment, setGradeModalEnrollment] = useState<any>(null);
  const [gradeScore, setGradeScore] = useState<number>(80);

  // Manage Content Modal
  const [manageContentKursus, setManageContentKursus] = useState<MikroKredensialKursus | null>(null);

  const { data: kursusResponse, isLoading: loadingKursus } = useGetKursusList(true);
  const { data: enrollmentsResponse, isLoading: loadingEnrollments } = useGetAllEnrollments();

  const createMutation = useCreateKursus();
  const updateMutation = useUpdateKursus();
  const deleteMutation = useDeleteKursus();
  const completeMutation = useCompleteEnrollment();

  const kursusList: MikroKredensialKursus[] = (kursusResponse as any)?.data || kursusResponse || [];
  const enrollmentsData = (enrollmentsResponse as any)?.data?.items || (enrollmentsResponse as any)?.items || [];

  const handleOpenCreate = () => {
    setEditingKursus(null);
    setFormTitle('');
    setFormSlug('');
    setFormDesc('');
    setFormDuration(60);
    setFormOrder(0);
    setFormIsActive(true);
    setDialogOpen(true);
  };

  const handleOpenEdit = (kursus: MikroKredensialKursus) => {
    setEditingKursus(kursus);
    setFormTitle(kursus.title);
    setFormSlug(kursus.slug);
    setFormDesc(kursus.description);
    setFormDuration(kursus.duration || 60);
    setFormOrder(kursus.order || 0);
    setFormIsActive(kursus.isActive);
    setDialogOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSlug || !formDesc) {
      toast.error('Mohon lengkapi judul, slug, dan deskripsi kursus');
      return;
    }

    try {
      if (editingKursus) {
        await updateMutation.mutateAsync({
          id: editingKursus.id,
          title: formTitle,
          slug: formSlug,
          description: formDesc,
          duration: formDuration,
          order: formOrder,
          isActive: formIsActive,
        });
        toast.success('Kursus berhasil diperbarui');
      } else {
        await createMutation.mutateAsync({
          title: formTitle,
          slug: formSlug,
          description: formDesc,
          duration: formDuration,
          order: formOrder,
        });
        toast.success('Kursus baru berhasil dibuat');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan kursus');
    }
  };

  const handleDeleteKursus = async (id: string, title: string) => {
    if (!confirm(`Hapus kursus "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Kursus berhasil dihapus');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus kursus');
    }
  };

  const handleGradeParticipant = async () => {
    if (!gradeModalEnrollment) return;
    try {
      await completeMutation.mutateAsync({
        id: gradeModalEnrollment.id,
        score: gradeScore,
      });
      toast.success('Nilai berhasil disimpan & status kelulusan diperbarui.');
      setGradeModalEnrollment(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan nilai peserta');
    }
  };

  const filteredKursus = kursusList.filter((k) =>
    k.title.toLowerCase().includes(searchKursus.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Manajemen Mikro Kredensial
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola kursus pelatihan, monitoring partisipasi mahasiswa & UMKM, dan terbitkan sertifikat digital.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kursus
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl shadow-xs">
          <TabsTrigger
            value="kursus"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg px-4 py-2 font-medium"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Daftar Kursus ({kursusList.length})
          </TabsTrigger>
          <TabsTrigger
            value="peserta"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg px-4 py-2 font-medium"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Peserta & Penilaian ({enrollmentsData.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: KURSUS TABLE */}
        <TabsContent value="kursus" className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari judul kursus..."
              value={searchKursus}
              onChange={(e) => setSearchKursus(e.target.value)}
              className="border-0 focus-visible:ring-0 text-sm p-0 shadow-none"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {loadingKursus ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : filteredKursus.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                Tidak ada kursus yang cocok.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Judul Kursus</TableHead>
                    <TableHead className="font-semibold text-gray-700">Slug</TableHead>
                    <TableHead className="font-semibold text-gray-700">Durasi</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKursus.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">
                        {item.title}
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 font-mono">{item.slug}</TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {item.duration ? `${item.duration} mnt` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.isActive
                              ? 'bg-emerald-100 text-emerald-800 border-0'
                              : 'bg-gray-100 text-gray-600 border-0'
                          }
                        >
                          {item.isActive ? 'Aktif' : 'Non-aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setManageContentKursus(item)}
                            className="text-xs h-8 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-medium"
                          >
                            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                            Materi & Kuis
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-emerald-600"
                            title="Edit Data Kursus"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteKursus(item.id, item.title)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                            title="Hapus Kursus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: PESERTA & PENILAIAN */}
        <TabsContent value="peserta" className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {loadingEnrollments ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : enrollmentsData.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                Belum ada data pendaftaran kursus dari peserta.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Nama Peserta</TableHead>
                    <TableHead className="font-semibold text-gray-700">Kursus</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Nilai</TableHead>
                    <TableHead className="font-semibold text-gray-700">Sertifikat</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollmentsData.map((enrollment: any) => {
                    const isCompleted = enrollment.status === 'COMPLETED';
                    const isFailed = enrollment.status === 'FAILED';
                    return (
                      <TableRow key={enrollment.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="font-medium text-gray-900">{enrollment.user?.name || '-'}</div>
                          <div className="text-xs text-gray-500">{enrollment.user?.email || '-'}</div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-800 font-medium">
                          {enrollment.kursus?.title || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border-0'
                                : isFailed
                                ? 'bg-red-100 text-red-800 border-0'
                                : 'bg-amber-100 text-amber-800 border-0'
                            }
                          >
                            {isCompleted
                              ? 'Lulus'
                              : isFailed
                              ? 'Tidak Lulus'
                              : 'Berjalan'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {enrollment.score !== null && enrollment.score !== undefined ? (
                            <span className={enrollment.score >= 70 ? 'text-emerald-600' : 'text-red-600'}>
                              {enrollment.score}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-normal">Belum dinilai</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {enrollment.certificate?.certificateNumber ? (
                            <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                              {enrollment.certificate.certificateNumber}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGradeModalEnrollment(enrollment);
                              setGradeScore(enrollment.score || 80);
                            }}
                            className="text-xs"
                          >
                            <FileCheck className="w-3.5 h-3.5 mr-1" />
                            Input Nilai
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL CREATE / EDIT KURSUS */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editingKursus ? 'Edit Kursus Mikro Kredensial' : 'Tambah Kursus Baru'}
              </DialogTitle>
              <DialogDescription>
                Silakan isi data kursus pelatihan mikro kredensial IBISTEK.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div>
                <Label htmlFor="title" className="text-xs font-semibold">Judul Kursus *</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (!editingKursus) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  placeholder="e.g. Validasi Ide Bisnis & Business Model Canvas"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug" className="text-xs font-semibold">Slug URL *</Label>
                <Input
                  id="slug"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. validasi-ide-bisnis"
                  required
                />
              </div>

              <div>
                <Label htmlFor="desc" className="text-xs font-semibold">Deskripsi / Silabus *</Label>
                <Textarea
                  id="desc"
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Tuliskan tujuan pelatihan dan pokok materi yang dipelajari..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="text-xs font-semibold">Durasi (Menit)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="order" className="text-xs font-semibold">Urutan Tampil (Order)</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                  />
                </div>
              </div>

              {editingKursus && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <Label htmlFor="isActive" className="text-xs font-semibold cursor-pointer">
                    Aktifkan kursus ini di katalog peserta
                  </Label>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Simpan Kursus
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL INPUT NILAI PESERTA */}
      <Dialog open={!!gradeModalEnrollment} onOpenChange={() => setGradeModalEnrollment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Input Nilai & Kelulusan</DialogTitle>
            <DialogDescription>
              Peserta: <strong>{gradeModalEnrollment?.user?.name}</strong> <br />
              Kursus: <strong>{gradeModalEnrollment?.kursus?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="gradeScore" className="text-xs font-semibold">
                Nilai Akhir (0 - 100):
              </Label>
              <Input
                id="gradeScore"
                type="number"
                min="0"
                max="100"
                value={gradeScore}
                onChange={(e) => setGradeScore(Number(e.target.value))}
                className="text-center font-bold text-xl"
              />
              <p className="text-xs text-muted-foreground">
                * Jika nilai &gt;= 70, status otomatis menjadi <strong>LULUS (COMPLETED)</strong> dan sertifikat digital bernomor unik akan otomatis diterbitkan.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeModalEnrollment(null)}>
              Batal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleGradeParticipant}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Simpan Nilai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL KELOLA MATERI MODUL & BANK SOAL KUIS */}
      <ManageCourseContentDialog
        kursus={manageContentKursus}
        open={!!manageContentKursus}
        onOpenChange={(open) => !open && setManageContentKursus(null)}
      />
    </div>
  );
}
