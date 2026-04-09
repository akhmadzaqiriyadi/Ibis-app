"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Loader2, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useGetActivePeriod, useGetMyApplications, useSubmitApplication } from "@/features/inkubasi/hooks";
import { useKategoriUsahaList } from "@/features/master-data/hooks";
import { InkubasiApplication, InkubasiPeriod, PlatformPenjualan } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ApplicationFormState = {
  periodId: string;
  namaPemilik: string;
  tahunBerdiri: string;
  kategoriUsahaId: string;
  rataOmsetPerBulan: string;
  platformPenjualan: PlatformPenjualan | "";
  uraianProduk: string;
  kendala: string;
  harapan: string;
};

type SubmitApplicationPayload = {
  periodId: string;
  namaPemilik: string;
  tahunBerdiri: number;
  kategoriUsahaId: string;
  rataOmsetPerBulan: string;
  platformPenjualan: PlatformPenjualan;
  uraianProduk: string;
  kendala: string;
  harapan: string;
};

const OMSET_OPTIONS = [
  "< 1 juta",
  "1-5 juta",
  "5-10 juta",
  "10-25 juta",
  "25-50 juta",
  "> 50 juta",
  "Lainnya",
];

const statusMeta: Record<InkubasiApplication["status"], { label: string; className: string }> = {
  PENDING: { label: "Menunggu Review", className: "bg-amber-100 text-amber-700 border-amber-200" },
  APPROVED: { label: "Disetujui", className: "bg-green-100 text-green-700 border-green-200" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700 border-red-200" },
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getTimelineStep = (status: InkubasiApplication["status"]) => {
  if (status === "PENDING") return 2;
  if (status === "APPROVED") return 3;
  return 3;
};

const timelineSteps = [
  { label: "Dikirim", desc: "Pengajuan sudah diterima sistem" },
  { label: "Review Admin", desc: "Admin mengecek kelengkapan dan isi form" },
  { label: "Hasil", desc: "Diterima atau ditolak setelah review manual" },
];

export default function InkubasiMahasiswaView() {
  const { data: activePeriod, isLoading: loadingPeriod, isError: periodError } = useGetActivePeriod();
  const { data: applicationsData, isLoading: loadingApps, isError: appsError } = useGetMyApplications();
  const { data: kategoriData, isLoading: loadingKategori, isError: kategoriError } = useKategoriUsahaList();
  const submitMutation = useSubmitApplication();

  const kategoriUsaha = useMemo(() => {
    const raw = Array.isArray(kategoriData) ? kategoriData : (kategoriData as any)?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [kategoriData]);

  const myApplications = useMemo(() => {
    const raw = Array.isArray(applicationsData) ? applicationsData : (applicationsData as any)?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [applicationsData]);

  const latestApplication = useMemo(() => {
    if (myApplications.length === 0) return null;
    return [...myApplications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [myApplications]);

  const [form, setForm] = useState<ApplicationFormState>({
    periodId: "",
    namaPemilik: "",
    tahunBerdiri: "",
    kategoriUsahaId: "",
    rataOmsetPerBulan: "",
    platformPenjualan: "",
    uraianProduk: "",
    kendala: "",
    harapan: "",
  });
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [pendingSubmitPayload, setPendingSubmitPayload] = useState<SubmitApplicationPayload | null>(null);

  useEffect(() => {
    if (activePeriod?.id) {
      setForm((current) => ({ ...current, periodId: activePeriod.id }));
    } else {
      setForm((current) => ({ ...current, periodId: "" }));
    }
  }, [activePeriod?.id]);

  const isSubmitting = submitMutation.isPending;
  const hasActivePeriod = !!activePeriod && !loadingPeriod && !periodError;
  const formDisabled = !hasActivePeriod || isSubmitting;

  const fieldHintClass = "text-xs leading-5";
  const fieldHintSlotClass = "min-h-10";

  const buildSubmitPayload = (): SubmitApplicationPayload | null => {
    if (!activePeriod?.id) {
      toast.error("Belum ada periode inkubasi yang aktif saat ini");
      return null;
    }

    if (!form.namaPemilik.trim()) {
      toast.error("Nama pemilik usaha wajib diisi");
      return null;
    }
    if (!form.tahunBerdiri.trim()) {
      toast.error("Tahun berdiri wajib diisi");
      return null;
    }
    if (!form.kategoriUsahaId) {
      toast.error("Kategori usaha wajib dipilih");
      return null;
    }
    if (!form.rataOmsetPerBulan.trim()) {
      toast.error("Omset per bulan wajib diisi");
      return null;
    }
    if (!form.platformPenjualan) {
      toast.error("Platform penjualan wajib dipilih");
      return null;
    }
    if (form.uraianProduk.trim().length < 20) {
      toast.error("Uraian produk minimal 20 karakter");
      return null;
    }
    if (form.kendala.trim().length < 20) {
      toast.error("Kendala minimal 20 karakter");
      return null;
    }
    if (form.harapan.trim().length < 20) {
      toast.error("Harapan minimal 20 karakter");
      return null;
    }

    return {
      periodId: activePeriod.id,
      namaPemilik: form.namaPemilik.trim(),
      tahunBerdiri: Number(form.tahunBerdiri),
      kategoriUsahaId: form.kategoriUsahaId,
      rataOmsetPerBulan: form.rataOmsetPerBulan.trim(),
      platformPenjualan: form.platformPenjualan,
      uraianProduk: form.uraianProduk.trim(),
      kendala: form.kendala.trim(),
      harapan: form.harapan.trim(),
    };
  };

  const handleSubmit = () => {
    const payload = buildSubmitPayload();
    if (!payload) return;

    setPendingSubmitPayload(payload);
    setSubmitConfirmOpen(true);
  };

  const confirmSubmitApplication = () => {
    if (!pendingSubmitPayload) return;

    submitMutation.mutate(
      pendingSubmitPayload,
      {
        onSuccess: () => {
          setSubmitConfirmOpen(false);
          setPendingSubmitPayload(null);
          toast.success("Pengajuan inkubasi berhasil dikirim");
          setForm((current) => ({
            ...current,
            namaPemilik: "",
            tahunBerdiri: "",
            kategoriUsahaId: "",
            rataOmsetPerBulan: "",
            platformPenjualan: "",
            uraianProduk: "",
            kendala: "",
            harapan: "",
          }));
        },
        onError: (err: any) => {
          setSubmitConfirmOpen(false);
          toast.error(err?.response?.data?.error || err?.message || "Gagal mengirim pengajuan");
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-orange-200 bg-linear-to-br from-white via-orange-50 to-amber-100 p-6 md:p-8 shadow-sm">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Inkubasi Bisnis Mahasiswa
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Ajukan bisnis kamu ke program inkubasi.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Isi form pengajuan, tunggu review admin, lalu pantau status pengajuanmu langsung dari dashboard.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-white/90 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CalendarDays className="h-4 w-4 text-orange-600" />
              Periode aktif
            </div>
            {loadingPeriod ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat periode...
              </div>
            ) : periodError ? (
              <div className="mt-3 text-sm text-red-600">Gagal memuat periode aktif.</div>
            ) : activePeriod ? (
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <div className="font-semibold text-slate-900">{activePeriod.name}</div>
                <div>{formatDate(activePeriod.startDate)} - {formatDate(activePeriod.endDate)}</div>
                <div className="pt-2 text-xs text-slate-500">
                  {activePeriod.description || "Pendaftaran sedang dibuka untuk mahasiswa yang memenuhi syarat."}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-600">Belum ada periode inkubasi yang sedang dibuka.</div>
            )}
          </div>
        </div>
      </section>

      {latestApplication && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <Clock3 className="h-3.5 w-3.5" />
                Notifikasi Status Terbaru
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{latestApplication.period?.name || "Pengajuan terbaru kamu"}</h3>
              <p className="text-sm text-slate-500">
                {latestApplication.status === "PENDING"
                  ? "Pengajuan kamu sedang menunggu review admin."
                  : latestApplication.status === "APPROVED"
                    ? "Pengajuan kamu disetujui. Cek catatan dan info lanjutan di bawah ini."
                    : "Pengajuan kamu belum disetujui pada periode ini."}
              </p>
              <p className="text-sm font-medium text-slate-700">
                Hasil keputusan: {latestApplication.status === "PENDING" ? "Belum ada hasil" : latestApplication.status === "APPROVED" ? "DITERIMA" : "DITOLAK"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="font-medium text-slate-900">Dikirim {formatDate(latestApplication.createdAt)}</div>
              <div className="mt-1">Update terakhir {formatDate(latestApplication.updatedAt)}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {timelineSteps.map((step, index) => {
              const currentStep = getTimelineStep(latestApplication.status);
              const isActive = index + 1 <= currentStep;
              const isCurrent = index + 1 === currentStep;
              return (
                <div
                  key={step.label}
                  className={`rounded-xl border p-4 transition ${isActive ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isActive ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-500"}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${isActive ? "text-slate-900" : "text-slate-500"}`}>{step.label}</div>
                      <div className="text-xs text-slate-500">{step.desc}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    {isCurrent
                      ? latestApplication.status === "PENDING"
                        ? "Sedang direview admin"
                        : latestApplication.status === "APPROVED"
                          ? "Hasil: diterima"
                          : "Hasil: ditolak"
                      : isActive
                        ? "Sudah dilewati"
                        : "Menunggu tahap berikutnya"}
                  </div>
                </div>
              );
            })}
          </div>

          {latestApplication.reviewNote && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Catatan review terbaru</div>
              {latestApplication.reviewNote}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <div className="font-semibold">Finalisasi Admin</div>
            <div className="mt-1">
              {latestApplication.status === "PENDING"
                ? "Belum ada finalisasi. Pengajuan masih dalam proses review admin."
                : latestApplication.status === "APPROVED"
                  ? "Pengajuan sudah difinalisasi admin dengan hasil DITERIMA."
                  : "Pengajuan sudah difinalisasi admin dengan hasil DITOLAK."}
            </div>
            {latestApplication.reviewedAt && (
              <div className="mt-1 text-xs text-blue-700">Waktu finalisasi: {formatDate(latestApplication.reviewedAt)}</div>
            )}
          </div>

          {latestApplication.reviewedBy && (
            <div className="mt-3 text-xs text-slate-500">
              Direview oleh {latestApplication.reviewedBy.name || "Admin"}
              {latestApplication.reviewedAt ? ` pada ${formatDate(latestApplication.reviewedAt)}` : ""}
            </div>
          )}
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Form Pengajuan</h3>
              <p className="text-sm text-slate-500">Lengkapi semua data usaha sebelum mengirim pengajuan.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {periodError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Tidak dapat memuat periode aktif.
              </div>
            )}

            <div className="grid gap-2">
              <Label>Periode Pendaftaran</Label>
              <Input value={activePeriod?.name || "Belum ada periode aktif"} disabled className="h-12 bg-slate-50" />
              <p className={`${fieldHintClass} ${fieldHintSlotClass} text-slate-500`}>Periode ini otomatis diisi dari pengumuman admin. Kamu tidak perlu memilih manual.</p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <div className="font-semibold">Aturan Submit Pengajuan</div>
              <ul className="mt-1 list-disc pl-5 space-y-1">
                <li>Mahasiswa hanya bisa submit 1 kali untuk 1 periode inkubasi.</li>
                <li>Jika pengajuan ditolak, tidak bisa submit ulang di periode yang sama.</li>
                <li>Submit ulang hanya bisa dilakukan pada periode berikutnya.</li>
              </ul>
            </div>

            <div className="grid gap-2">
              <Label>Nama Pemilik Usaha</Label>
              <Input
                value={form.namaPemilik}
                onChange={(e) => setForm((current) => ({ ...current, namaPemilik: e.target.value }))}
                placeholder="Contoh: Ahmad Fauzi"
                className="h-12"
                disabled={formDisabled}
              />
              <p className={`${fieldHintClass} ${fieldHintSlotClass} text-slate-500`}>Gunakan nama sesuai pemilik yang benar-benar menjalankan bisnis.</p>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Tahun Berdiri</Label>
                <Input
                  type="number"
                  value={form.tahunBerdiri}
                  onChange={(e) => setForm((current) => ({ ...current, tahunBerdiri: e.target.value }))}
                  placeholder="Contoh: 2023"
                  className="h-12"
                  disabled={formDisabled}
                />
                <p className={`${fieldHintClass} ${fieldHintSlotClass} text-slate-500`}>Tulis tahun bisnis mulai berjalan, bukan tahun ide pertama muncul.</p>
              </div>
              <div className="grid gap-2">
                <Label>Kategori Usaha</Label>
                <Select
                  value={form.kategoriUsahaId}
                  onValueChange={(value) => setForm((current) => ({ ...current, kategoriUsahaId: value }))}
                  disabled={formDisabled || loadingKategori}
                >
                  <SelectTrigger className="h-12 bg-white">
                    <SelectValue placeholder={loadingKategori ? "Memuat kategori..." : "Pilih kategori usaha"} />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriUsaha.map((kategori) => (
                      <SelectItem key={kategori.id} value={kategori.id}>
                        {kategori.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className={`${fieldHintClass} ${fieldHintSlotClass} ${kategoriError ? "text-red-600" : "text-slate-500"}`}>
                  {kategoriError ? "Gagal memuat kategori usaha." : "Pilih kategori yang paling dekat dengan jenis usaha kamu."}
                </p>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Rata-rata Omset Per Bulan</Label>
                <Select
                  value={form.rataOmsetPerBulan}
                  onValueChange={(value) => setForm((current) => ({ ...current, rataOmsetPerBulan: value }))}
                  disabled={formDisabled}
                >
                  <SelectTrigger className="h-12 bg-white">
                    <SelectValue placeholder="Pilih kisaran omset" />
                  </SelectTrigger>
                  <SelectContent>
                    {OMSET_OPTIONS.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className={`${fieldHintClass} ${fieldHintSlotClass} text-slate-500`}>Isi dengan kisaran omset rata-rata bulanan, cukup pakai range yang paling sesuai.</p>
              </div>
              <div className="grid gap-2">
                <Label>Platform Penjualan</Label>
                <Select
                  value={form.platformPenjualan}
                  onValueChange={(value) => setForm((current) => ({ ...current, platformPenjualan: value as PlatformPenjualan }))}
                  disabled={formDisabled}
                >
                  <SelectTrigger className="h-12 bg-white">
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                    <SelectItem value="KEDUANYA">Keduanya</SelectItem>
                  </SelectContent>
                </Select>
                <p className={`${fieldHintClass} ${fieldHintSlotClass} text-slate-500`}>Pilih channel utama bisnis kamu, misalnya marketplace, toko fisik, atau keduanya.</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Uraian Produk / Layanan</Label>
              <Textarea
                rows={4}
                value={form.uraianProduk}
                onChange={(e) => setForm((current) => ({ ...current, uraianProduk: e.target.value }))}
                placeholder="Contoh: kami menjual minuman sehat berbasis buah lokal..."
                disabled={formDisabled}
              />
              <p className={`${fieldHintClass} ${fieldHintSlotClass} text-slate-500`}>Minimal 20 karakter. Jelaskan apa yang dijual, siapa targetnya, dan apa pembeda utamanya.</p>
            </div>

            <div className="grid gap-2">
              <Label>Kendala Utama</Label>
              <Textarea
                rows={4}
                value={form.kendala}
                onChange={(e) => setForm((current) => ({ ...current, kendala: e.target.value }))}
                placeholder="Contoh: kami kesulitan menjaga konsistensi penjualan dan branding..."
                disabled={formDisabled}
              />
              <p className={`${fieldHintClass} ${fieldHintSlotClass} text-slate-500`}>Minimal 20 karakter. Tulis masalah paling penting yang ingin diselesaikan lewat inkubasi.</p>
            </div>

            <div className="grid gap-2">
              <Label>Harapan dari Program Inkubasi</Label>
              <Textarea
                rows={4}
                value={form.harapan}
                onChange={(e) => setForm((current) => ({ ...current, harapan: e.target.value }))}
                placeholder="Contoh: ingin memperbaiki SOP, branding, dan strategi pemasaran..."
                disabled={formDisabled}
              />
              <p className={`${fieldHintClass} ${fieldHintSlotClass} text-slate-500`}>Minimal 20 karakter. Jelaskan hasil yang kamu harapkan setelah ikut program.</p>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Pastikan proposal kamu jelas dan singkat. Admin akan melakukan review manual setelah pengajuan dikirim.
              </p>
              <button
                onClick={handleSubmit}
                disabled={formDisabled}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Kirim Pengajuan
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Status Pengajuan Saya</h3>
              <p className="text-sm text-slate-500">Lihat histori dan hasil review pengajuanmu.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loadingApps ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : appsError ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Gagal memuat pengajuan kamu.
              </div>
            ) : myApplications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Belum ada pengajuan yang dibuat.
              </div>
            ) : (
              myApplications.map((app) => {
                const meta = statusMeta[app.status as keyof typeof statusMeta];
                return (
                  <div key={app.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{app.period?.name || "Periode tidak diketahui"}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Dikirim: {formatDate(app.createdAt)}
                        </div>
                      </div>
                      <Badge variant="outline" className={meta.className}>
                        {meta.label}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-700">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        Update terakhir: {formatDate(app.updatedAt)}
                      </div>
                      <div><span className="font-medium text-slate-900">Pemilik:</span> {app.namaPemilik}</div>
                      <div><span className="font-medium text-slate-900">Kategori:</span> {app.kategoriUsaha?.name || "-"}</div>
                      <div><span className="font-medium text-slate-900">Platform:</span> {app.platformPenjualan}</div>
                      <div><span className="font-medium text-slate-900">Omset:</span> {app.rataOmsetPerBulan}</div>
                      <div><span className="font-medium text-slate-900">Uraian Produk:</span> {app.uraianProduk}</div>
                      <div><span className="font-medium text-slate-900">Kendala:</span> {app.kendala}</div>
                      <div><span className="font-medium text-slate-900">Harapan:</span> {app.harapan}</div>
                      <div>
                        <span className="font-medium text-slate-900">Hasil Keputusan:</span>{" "}
                        {app.status === "PENDING" ? "Belum ada hasil" : app.status === "APPROVED" ? "DITERIMA" : "DITOLAK"}
                      </div>
                      {app.reviewNote && (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 text-slate-600">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Catatan Review</div>
                          {app.reviewNote}
                        </div>
                      )}
                      {app.reviewedBy && (
                        <div className="text-xs text-slate-500">
                          Direview oleh {app.reviewedBy.name || "Admin"}
                          {app.reviewedAt ? ` pada ${formatDate(app.reviewedAt)}` : ""}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {periodError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <ShieldCheck className="h-4 w-4" />
          Data periode sedang bermasalah. Kamu tetap bisa cek status pengajuan sebelumnya.
        </div>
      )}

      <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Kirim Pengajuan</DialogTitle>
            <DialogDescription>
              Pastikan seluruh data sudah benar. Setelah dikirim, data pengajuan tidak dapat diedit oleh mahasiswa.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-700">
            <div><strong>Nama Pemilik:</strong> {pendingSubmitPayload?.namaPemilik || "-"}</div>
            <div><strong>Tahun Berdiri:</strong> {pendingSubmitPayload?.tahunBerdiri || "-"}</div>
            <div><strong>Platform:</strong> {pendingSubmitPayload?.platformPenjualan || "-"}</div>
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setSubmitConfirmOpen(false);
                setPendingSubmitPayload(null);
              }}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cek Lagi
            </button>
            <button
              onClick={confirmSubmitApplication}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Ya, Kirim Pengajuan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
