"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarCheck,
  CalendarClock,
  Check,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Send,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth-store";
import { useUsers } from "@/features/auth/hooks";
import {
  useAssignMentor,
  useCancelKonsultasi,
  useCompleteKonsultasi,
  useConfirmKonsultasi,
  useGenerateWaLink,
  useKonsultasiApplicationById,
  useMentorRespond,
  useSubmitLaporan,
} from "@/hooks/useKonsultasi";
import { KonsultasiStatus } from "@/types/konsultasi";
import { getStatusBadgeClass, getStatusLabel } from "@/app/dashboard/konsultasi/components/status-utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const toDateTimeLocal = (isoDate?: string | null) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const toIsoOrNull = (value: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

export default function KonsultasiDetailClient({ id }: { id: string }) {
  const { user } = useAuthStore();

  const { data: application, isLoading, isError } = useKonsultasiApplicationById(id);

  const isAdminOrStaff = user?.role === "ADMIN" || user?.role === "STAFF";
  const isMentor = user?.role === "MENTOR";
  const isMahasiswa = user?.role === "MAHASISWA" || user?.role === "UMKM";

  const { data: mentorsData } = useUsers({ page: 1, limit: 100, roleFilter: "MENTOR", statusFilter: "active" }, {
    enabled: isAdminOrStaff,
  });
  const mentors = useMemo(() => {
    const raw = (mentorsData as any)?.data;
    return Array.isArray(raw) ? raw : [];
  }, [mentorsData]);

  const assignMentorMut = useAssignMentor();
  const confirmMut = useConfirmKonsultasi();
  const cancelMut = useCancelKonsultasi();
  const completeMut = useCompleteKonsultasi();
  const respondMut = useMentorRespond();
  const submitLaporanMut = useSubmitLaporan();

  const waQuery = useGenerateWaLink(id);

  const [assignMentorId, setAssignMentorId] = useState<string>("");
  const [mentorDeadline, setMentorDeadline] = useState<string>("");

  const [confirmedDate, setConfirmedDate] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [meetingLocation, setMeetingLocation] = useState<string>("");

  const [cancelReason, setCancelReason] = useState<string>("");
  const [declineReason, setDeclineReason] = useState<string>("");

  // State laporan mahasiswa
  const [laporanText, setLaporanText] = useState<string>("");

  useEffect(() => {
    if (!application) return;

    setAssignMentorId(application.assignedMentorId || "");
    setMentorDeadline(toDateTimeLocal(application.mentorResponseDeadline));

    setConfirmedDate(toDateTimeLocal(application.confirmedDate));
    setMeetingLink(application.meetingLink || "");
    setMeetingLocation(application.meetingLocation || "");

    setCancelReason(application.cancelReason || "");
    setDeclineReason(application.mentorDeclineReason || "");
  }, [application]);

  const handleAssignMentor = () => {
    if (!application) return;
    const deadlineIso = toIsoOrNull(mentorDeadline);

    if (!assignMentorId) {
      toast.error("Pilih mentor terlebih dahulu");
      return;
    }
    if (!deadlineIso) {
      toast.error("Deadline respon mentor wajib valid");
      return;
    }

    assignMentorMut.mutate(
      { id: application.id, assignedMentorId: assignMentorId, mentorResponseDeadline: deadlineIso },
      {
        onSuccess: () => toast.success("Mentor berhasil di-assign"),
        onError: (err: any) => toast.error(err?.response?.data?.error || err?.message || "Gagal assign mentor"),
      }
    );
  };

  const handleConfirm = () => {
    if (!application) return;
    const confirmedIso = toIsoOrNull(confirmedDate);
    if (!confirmedIso) {
      toast.error("Tanggal konfirmasi wajib valid");
      return;
    }

    confirmMut.mutate(
      {
        id: application.id,
        confirmedDate: confirmedIso,
        meetingLink: meetingLink.trim() || undefined,
        meetingLocation: meetingLocation.trim() || undefined,
      },
      {
        onSuccess: () => toast.success("Jadwal konsultasi berhasil dikonfirmasi"),
        onError: (err: any) => toast.error(err?.response?.data?.error || err?.message || "Gagal konfirmasi"),
      }
    );
  };

  const handleCancel = () => {
    if (!application) return;
    cancelMut.mutate(
      { id: application.id, reason: cancelReason.trim() || undefined },
      {
        onSuccess: () => toast.success("Pengajuan konsultasi dibatalkan"),
        onError: (err: any) => toast.error(err?.response?.data?.error || err?.message || "Gagal cancel"),
      }
    );
  };

  const handleComplete = () => {
    if (!application) return;
    completeMut.mutate(application.id, {
      onSuccess: () => toast.success("Konsultasi ditandai selesai"),
      onError: (err: any) => toast.error(err?.response?.data?.error || err?.message || "Gagal complete"),
    });
  };

  const handleOpenWaLink = async () => {
    try {
      const res = await waQuery.refetch();
      const link = res.data?.waLink;
      if (!link) {
        toast.error("WA link tidak tersedia");
        return;
      }
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e?.message || "Gagal mengambil WA link");
    }
  };

  const handleAccept = () => {
    if (!application) return;
    respondMut.mutate(
      { id: application.id, bersedia: true },
      {
        onSuccess: () => toast.success("Respon terkirim: bersedia"),
        onError: (err: any) => toast.error(err?.response?.data?.error || err?.message || "Gagal mengirim respon"),
      }
    );
  };

  const handleDecline = () => {
    if (!application) return;
    if (!declineReason.trim()) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    respondMut.mutate(
      { id: application.id, bersedia: false, declineReason: declineReason.trim() },
      {
        onSuccess: () => toast.success("Respon terkirim: menolak"),
        onError: (err: any) => toast.error(err?.response?.data?.error || err?.message || "Gagal mengirim respon"),
      }
    );
  };

  const handleSubmitLaporan = () => {
    if (!application) return;
    if (laporanText.trim().length < 20) {
      toast.error("Laporan minimal 20 karakter");
      return;
    }
    submitLaporanMut.mutate(
      { id: application.id, laporanMahasiswa: laporanText.trim() },
      {
        onSuccess: () => {
          toast.success("Laporan berhasil dikirim! Terima kasih 🎉");
          setLaporanText("");
        },
        onError: (err: any) => toast.error(err?.response?.data?.error || err?.message || "Gagal mengirim laporan"),
      }
    );
  };

  if (!user) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isLoading && !application) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/konsultasi">
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-2">Kembali</span>
          </Link>
        </Button>
        <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-red-500">
          <AlertTriangle className="h-10 w-10" />
          <p>Gagal memuat detail konsultasi.</p>
        </div>
      </div>
    );
  }

  const status = application.status as KonsultasiStatus;

  // Kondisi tampilkan form laporan: mahasiswa, status COMPLETED, belum ada laporan
  const isOwner = user.id === application.userId;
  const canSubmitLaporan =
    isMahasiswa &&
    isOwner &&
    status === "COMPLETED" &&
    !application.laporanMahasiswa;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/konsultasi">
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-2">Kembali</span>
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-4">Detail Konsultasi</h2>
        <p className="text-muted-foreground mt-2">ID: {application.id}</p>
      </div>

      {/* Info Utama — hanya untuk admin/staff, mahasiswa & mentor punya section sendiri */}
      {isAdminOrStaff && (
        <div className="rounded-md border bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Pemilik</div>
              <div className="text-lg font-semibold text-gray-900">{application.namaPemilik}</div>
              <div className="text-sm text-muted-foreground">{application.user?.email || application.user?.name || application.userId}</div>
            </div>
            <div>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(status)}`}>
                {getStatusLabel(status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">Metode</div>
              <div className="font-medium">{application.metode}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Preferred Date</div>
              <div className="font-medium">{application.preferredDate ? new Date(application.preferredDate).toLocaleString("id-ID") : "-"}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Topik</div>
            <div className="rounded-md border bg-slate-50 p-3 text-sm">{application.topikKonsultasi}</div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Uraian Produk</div>
            <div className="rounded-md border bg-slate-50 p-3 text-sm whitespace-pre-wrap">{application.uraianProduk}</div>
          </div>
        </div>
      )}

      {/* Info Jadwal Final — hanya untuk admin/staff, mahasiswa & mentor punya section sendiri */}
      {isAdminOrStaff && (status === "CONFIRMED" || status === "COMPLETED") && application.confirmedDate && (
        <div className="rounded-md border border-green-200 bg-green-50 p-6 shadow-sm space-y-3">
          <div className="font-semibold text-sm text-green-800 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Jadwal Konsultasi Dikonfirmasi
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">Tanggal & Waktu</div>
              <div className="font-medium text-green-900">{new Date(application.confirmedDate).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Mentor</div>
              <div className="font-medium text-green-900">{application.assignedMentor?.name ?? "-"}</div>
            </div>
            {application.meetingLink && (
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground">Link Meeting</div>
                <a href={application.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {application.meetingLink}
                </a>
              </div>
            )}
            {application.meetingLocation && (
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground">Lokasi</div>
                <div className="font-medium text-green-900">{application.meetingLocation}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION KHUSUS MAHASISWA: Laporan Pasca Konsultasi
          ═══════════════════════════════════════════════════════ */}

      {/* Laporan sudah dikirim — tampilkan read-only */}
      {isMahasiswa && isOwner && application.laporanMahasiswa && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-6 shadow-sm space-y-3">
          <div className="font-semibold text-sm text-amber-800 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Laporan Konsultasi Anda
          </div>
          <p className="text-xs text-muted-foreground">
            Dikirim pada: {application.laporanSubmittedAt ? new Date(application.laporanSubmittedAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }) : "-"}
          </p>
          <div className="rounded-md border bg-white p-4 text-sm whitespace-pre-wrap text-gray-700">
            {application.laporanMahasiswa}
          </div>
        </div>
      )}

      {/* Form submit laporan — hanya muncul jika COMPLETED & belum ada laporan */}
      {canSubmitLaporan && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-6 shadow-sm space-y-4">
          <div className="font-semibold text-sm text-blue-800 flex items-center gap-2">
            <Send className="h-4 w-4" />
            Kirim Laporan Hasil Konsultasi
          </div>
          <p className="text-xs text-blue-700">
            Sesi konsultasi Anda sudah selesai! Silakan tuliskan hasil, catatan, dan manfaat yang Anda dapatkan dari sesi ini.
          </p>
          <div className="space-y-2">
            <Label htmlFor="laporan-input" className="text-sm font-medium text-blue-900">
              Isi Laporan / Catatan Konsultasi <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="laporan-input"
              value={laporanText}
              onChange={(e) => setLaporanText(e.target.value)}
              placeholder="Tuliskan hasil konsultasi, poin-poin penting yang didiskusikan, saran mentor, dan rencana tindak lanjut Anda..."
              rows={6}
              className="bg-white resize-none"
            />
            <p className="text-xs text-muted-foreground">{laporanText.length} karakter (minimal 20)</p>
          </div>
          <div>
            <Button
              onClick={handleSubmitLaporan}
              disabled={submitLaporanMut.isPending || laporanText.trim().length < 20}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitLaporanMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="ml-2">Kirim Laporan</span>
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION MAHASISWA — Info Lengkap & Timeline Status
          ═══════════════════════════════════════════════════════ */}
      {isMahasiswa && isOwner && (
        <div className="space-y-4">

          {/* Info Usaha Lengkap */}
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 border-b pb-3">
              <Building2 className="h-4 w-4 text-amber-500" />
              Info Usaha
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Nama Pemilik</div>
                <div className="font-medium text-gray-900">{application.namaPemilik}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Tahun Berdiri</div>
                <div className="font-medium text-gray-900">{application.tahunBerdiri}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Kategori Usaha</div>
                <div className="font-medium text-gray-900">{application.kategoriUsaha?.name ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Rata-rata Omset/Bulan</div>
                <div className="font-medium text-gray-900">{application.rataOmsetPerBulan}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Platform Penjualan</div>
                <div className="font-medium text-gray-900">{application.platformPenjualan}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Metode Konsultasi</div>
                <div className="font-medium text-gray-900">{application.metode}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Uraian Produk/Jasa</div>
                <div className="rounded-md border bg-slate-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">{application.uraianProduk}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Topik Konsultasi</div>
                <div className="rounded-md border bg-slate-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">{application.topikKonsultasi}</div>
              </div>
            </div>
          </div>

          {/* Timeline Status */}
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 border-b pb-3">
              <CalendarClock className="h-4 w-4 text-blue-500" />
              Status Pengajuan
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              {[
                {
                  key: "PENDING",
                  label: "Pengajuan Diterima",
                  desc: "Admin sedang meninjau pengajuan Anda.",
                  date: application.createdAt,
                },
                {
                  key: "ASSIGNED",
                  label: "Mentor Ditugaskan",
                  desc: application.assignedMentor
                    ? `${application.assignedMentor.name} telah ditugaskan. Menunggu konfirmasi kesediaan mentor.`
                    : "Admin sedang menugaskan mentor.",
                  date: application.assignedAt,
                },
                {
                  key: "MENTOR_CONFIRMED",
                  label: "Mentor Bersedia",
                  desc: "Mentor menyatakan bersedia. Admin akan segera mengkonfirmasi jadwal.",
                  date: application.mentorConfirmedAt,
                },
                {
                  key: "CONFIRMED",
                  label: "Jadwal Dikonfirmasi",
                  desc: "Jadwal konsultasi sudah ditetapkan!",
                  date: application.confirmedAt,
                },
                {
                  key: "COMPLETED",
                  label: "Konsultasi Selesai",
                  desc: "Sesi konsultasi telah selesai.",
                  date: application.completedAt,
                },
              ].map((step, idx) => {
                const ORDER = ["PENDING", "ASSIGNED", "MENTOR_CONFIRMED", "CONFIRMED", "COMPLETED"];
                const currentIdx = ORDER.indexOf(status);
                const stepIdx = ORDER.indexOf(step.key);
                const isDone = stepIdx < currentIdx || (stepIdx === currentIdx && status !== "CANCELLED" && status !== "MENTOR_DECLINED" && status !== "MENTOR_TIMEOUT");
                const isActive = step.key === status;
                const isFailed = ["CANCELLED", "MENTOR_DECLINED", "MENTOR_TIMEOUT"].includes(status) && stepIdx === currentIdx;

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      isActive && !isFailed
                        ? "border-blue-500 bg-blue-500 text-white"
                        : isDone
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}>
                      {isDone && !isActive ? <Check className="h-3 w-3" /> : idx + 1}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className={`text-sm font-medium ${
                        isActive && !isFailed ? "text-blue-700" : isDone ? "text-green-700" : "text-slate-400"
                      }`}>{step.label}</div>
                      {(isActive || isDone) && !isFailed && (
                        <div className="text-xs text-muted-foreground mt-0.5">{step.desc}</div>
                      )}
                      {step.date && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(step.date).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Status khusus: gagal/batal */}
              {["CANCELLED", "MENTOR_DECLINED", "MENTOR_TIMEOUT"].includes(status) && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-red-400 bg-red-400 text-white">
                    <X className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-red-600">{getStatusLabel(status)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {status === "CANCELLED" && (application.cancelReason ? `Alasan: ${application.cancelReason}` : "Pengajuan dibatalkan.")}
                      {status === "MENTOR_DECLINED" && (application.mentorDeclineReason ? `Alasan mentor: ${application.mentorDeclineReason}` : "Mentor tidak dapat memenuhi tugas ini.")}
                      {status === "MENTOR_TIMEOUT" && "Mentor tidak merespon dalam batas waktu. Admin akan mencari pengganti."}
                    </div>
                    {status === "CANCELLED" && application.cancelledAt && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(application.cancelledAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Mentor (jika sudah assigned) */}
          {application.assignedMentor && (
            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 border-b pb-3">
                <User className="h-4 w-4 text-purple-500" />
                Mentor Anda
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Nama Mentor</div>
                    <div className="font-semibold text-gray-900">{application.assignedMentor.name}</div>
                    <div className="text-sm text-muted-foreground">{application.assignedMentor.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Ditugaskan Oleh</div>
                    <div className="font-medium text-gray-900">{application.assignedBy?.name ?? "-"}</div>
                    {application.assignedAt && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(application.assignedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    )}
                  </div>
                  {application.mentorResponseDeadline && status === "ASSIGNED" && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">Deadline Respon Mentor</div>
                      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(application.mentorResponseDeadline).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                      </div>
                    </div>
                  )}
                  {status === "MENTOR_CONFIRMED" && application.mentorConfirmedAt && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">Mentor Konfirmasi Pada</div>
                      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-1">
                        <Check className="h-3.5 w-3.5" />
                        {new Date(application.mentorConfirmedAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Jadwal Konsultasi Final (jika CONFIRMED/COMPLETED) */}
          {(status === "CONFIRMED" || status === "COMPLETED") && application.confirmedDate && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-800 border-b border-green-200 pb-3">
                <CalendarCheck className="h-4 w-4" />
                Jadwal Konsultasi Anda
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tanggal & Waktu</div>
                  <div className="font-semibold text-green-900 text-lg">
                    {new Date(application.confirmedDate).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Metode</div>
                  <div className="font-medium text-green-900">{application.metode}</div>
                </div>
                {application.meetingLink && (
                  <div className="sm:col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Link Meeting</div>
                    <a href={application.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm font-medium">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {application.meetingLink}
                    </a>
                  </div>
                )}
                {application.meetingLocation && (
                  <div className="sm:col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Lokasi</div>
                    <div className="font-medium text-green-900">{application.meetingLocation}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferred Date (sebelum dikonfirmasi) */}
          {!["CONFIRMED", "COMPLETED"].includes(status) && application.preferredDate && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Preferred Date Anda</div>
              <div className="font-medium text-gray-800">
                {new Date(application.preferredDate).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Jadwal final akan dikonfirmasi oleh admin.</div>
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          PANEL ADMIN/STAFF
          ═══════════════════════════════════════════════════════ */}
      {isAdminOrStaff && (
        <>
          <div className="rounded-md border bg-white p-6 shadow-sm space-y-4">
            <div className="font-semibold text-sm">Assign Mentor</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Mentor</Label>
                <Select value={assignMentorId || ""} onValueChange={setAssignMentorId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Pilih mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name || m.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Deadline Respon Mentor</Label>
                <Input type="datetime-local" value={mentorDeadline} onChange={(e) => setMentorDeadline(e.target.value)} />
              </div>
            </div>
            <div>
              <Button onClick={handleAssignMentor} disabled={assignMentorMut.isPending}>
                {assignMentorMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
              </Button>
            </div>
          </div>

          <div className="rounded-md border bg-white p-6 shadow-sm space-y-4">
            <div className="font-semibold text-sm">Konfirmasi Jadwal</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Tanggal Konfirmasi</Label>
                <Input type="datetime-local" value={confirmedDate} onChange={(e) => setConfirmedDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{application.metode === "ONLINE" ? "Meeting Link" : "Lokasi Meeting"}</Label>
                {application.metode === "ONLINE" ? (
                  <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://..." />
                ) : (
                  <Input value={meetingLocation} onChange={(e) => setMeetingLocation(e.target.value)} placeholder="Alamat / lokasi" />
                )}
              </div>
            </div>
            <div>
              <Button onClick={handleConfirm} disabled={confirmMut.isPending}>
                {confirmMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Konfirmasi"}
              </Button>
            </div>
          </div>

          {/* Laporan mahasiswa — visible untuk admin */}
          {application.laporanMahasiswa && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-6 shadow-sm space-y-3">
              <div className="font-semibold text-sm text-amber-800 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Laporan dari Mahasiswa
              </div>
              <p className="text-xs text-muted-foreground">
                Dikirim pada: {application.laporanSubmittedAt ? new Date(application.laporanSubmittedAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }) : "-"}
              </p>
              <div className="rounded-md border bg-white p-4 text-sm whitespace-pre-wrap text-gray-700">
                {application.laporanMahasiswa}
              </div>
            </div>
          )}

          <div className="rounded-md border bg-white p-6 shadow-sm space-y-4">
            <div className="font-semibold text-sm">Tindakan</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleOpenWaLink} disabled={waQuery.isFetching}>
                {waQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                <span className="ml-2">Buka WA Link</span>
              </Button>
              <Button variant="outline" onClick={handleComplete} disabled={completeMut.isPending}>
                {completeMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span className="ml-2">Complete</span>
              </Button>
            </div>

            <div className="space-y-1">
              <Label>Alasan Cancel (opsional)</Label>
              <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Masukkan alasan..." />
            </div>
            <div>
              <Button variant="outline" onClick={handleCancel} disabled={cancelMut.isPending}>
                {cancelMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                <span className="ml-2">Cancel</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          PANEL MENTOR
          ═══════════════════════════════════════════════════════ */}
      {isMentor && (
        <div className="space-y-4">

          {/* Header status penugasan */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Penugasan Konsultasi</div>
                <div className="text-xl font-bold text-gray-900">{application.namaPemilik}</div>
                <div className="text-sm text-muted-foreground">{application.user?.email || application.user?.name}</div>
              </div>
              <span className={`self-start sm:self-auto inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(status)}`}>
                {getStatusLabel(status)}
              </span>
            </div>

            {/* Deadline respon */}
            {application.mentorResponseDeadline && status === "ASSIGNED" && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Anda diminta merespon sebelum <strong>{new Date(application.mentorResponseDeadline).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</strong></span>
              </div>
            )}

            {/* Mentor sudah konfirmasi */}
            {status === "MENTOR_CONFIRMED" && application.mentorConfirmedAt && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">
                <Check className="h-4 w-4 shrink-0" />
                <span>Anda menyatakan bersedia pada <strong>{new Date(application.mentorConfirmedAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</strong>. Menunggu konfirmasi jadwal dari admin.</span>
              </div>
            )}

            {/* Ditugaskan oleh */}
            {application.assignedBy && (
              <div className="mt-3 text-xs text-muted-foreground">
                Ditugaskan oleh <span className="font-medium text-gray-700">{application.assignedBy.name}</span>
                {application.assignedAt && (
                  <span> · {new Date(application.assignedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
                )}
              </div>
            )}
          </div>

          {/* Info Usaha Pemohon */}
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 border-b pb-3">
              <Building2 className="h-4 w-4 text-amber-500" />
              Info Usaha Pemohon
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Kategori Usaha</div>
                <div className="font-medium text-gray-900">{application.kategoriUsaha?.name ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Tahun Berdiri</div>
                <div className="font-medium text-gray-900">{application.tahunBerdiri}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Rata-rata Omset/Bulan</div>
                <div className="font-medium text-gray-900">{application.rataOmsetPerBulan}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Platform Penjualan</div>
                <div className="font-medium text-gray-900">{application.platformPenjualan}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Metode Konsultasi</div>
                <div className="font-medium text-gray-900">{application.metode}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Preferred Date</div>
                <div className="font-medium text-gray-900">
                  {application.preferredDate ? new Date(application.preferredDate).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" }) : "-"}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Uraian Produk/Jasa</div>
                <div className="rounded-md border bg-slate-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">{application.uraianProduk}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Topik yang Ingin Dikonsultasikan</div>
                <div className="rounded-md border bg-amber-50 border-amber-200 p-3 text-sm text-gray-800 whitespace-pre-wrap font-medium">{application.topikKonsultasi}</div>
              </div>
            </div>
          </div>

          {/* Jadwal Final (jika sudah dikonfirmasi admin) */}
          {(status === "CONFIRMED" || status === "COMPLETED") && application.confirmedDate && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-800 border-b border-green-200 pb-3">
                <CalendarCheck className="h-4 w-4" />
                Jadwal Final Konsultasi
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tanggal & Waktu</div>
                  <div className="font-semibold text-green-900 text-lg">
                    {new Date(application.confirmedDate).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Metode</div>
                  <div className="font-medium text-green-900">{application.metode}</div>
                </div>
                {application.meetingLink && (
                  <div className="sm:col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Link Meeting</div>
                    <a href={application.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm font-medium">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {application.meetingLink}
                    </a>
                  </div>
                )}
                {application.meetingLocation && (
                  <div className="sm:col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Lokasi</div>
                    <div className="font-medium text-green-900">{application.meetingLocation}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel Aksi Respon — hanya tampil saat status ASSIGNED */}
          {status === "ASSIGNED" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 border-b border-blue-200 pb-3">
                <Send className="h-4 w-4" />
                Berikan Respon Anda
              </div>
              <p className="text-sm text-blue-700">
                Apakah Anda bersedia untuk menjadi mentor dalam sesi konsultasi ini? Respon sebelum deadline di atas.
              </p>
              <div className="space-y-1">
                <Label className="text-blue-900">Alasan penolakan <span className="text-muted-foreground font-normal">(wajib diisi jika menolak)</span></Label>
                <Input
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Masukkan alasan tidak bisa..."
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleAccept} disabled={respondMut.isPending} className="bg-green-600 hover:bg-green-700">
                  {respondMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span className="ml-2">Bersedia</span>
                </Button>
                <Button variant="outline" onClick={handleDecline} disabled={respondMut.isPending} className="border-red-300 text-red-600 hover:bg-red-50">
                  {respondMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  <span className="ml-2">Tidak Bisa</span>
                </Button>
              </div>
            </div>
          )}

          {/* Laporan mahasiswa (jika sudah ada) */}
          {application.laporanMahasiswa && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm space-y-3">
              <div className="font-semibold text-sm text-amber-800 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Laporan dari Pemohon
              </div>
              <p className="text-xs text-muted-foreground">
                Dikirim pada: {application.laporanSubmittedAt ? new Date(application.laporanSubmittedAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }) : "-"}
              </p>
              <div className="rounded-md border bg-white p-4 text-sm whitespace-pre-wrap text-gray-700">
                {application.laporanMahasiswa}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
