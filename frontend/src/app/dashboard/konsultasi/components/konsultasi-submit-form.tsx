"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { useSubmitKonsultasi } from "@/hooks/useKonsultasi";
import { useKategoriUsahaList } from "@/features/master-data/hooks";
import { MetodeKonsultasi, PlatformPenjualan } from "@/types";

type FormState = {
  namaPemilik: string;
  tahunBerdiri: string;
  kategoriUsahaId: string;
  rataOmsetPerBulan: string;
  platformPenjualan: PlatformPenjualan | "";
  uraianProduk: string;
  topikKonsultasi: string;
  preferredDateLocal: string; // input datetime-local
  metode: MetodeKonsultasi | "";
};

type SubmitPayload = {
  namaPemilik: string;
  tahunBerdiri: number;
  kategoriUsahaId: string;
  rataOmsetPerBulan: string;
  platformPenjualan: PlatformPenjualan;
  uraianProduk: string;
  topikKonsultasi: string;
  preferredDate: string; // ISO string
  metode: MetodeKonsultasi;
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

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function KonsultasiSubmitForm({ onSuccess, onCancel }: Props) {
  const submitMutation = useSubmitKonsultasi();
  const { data: kategoriData, isLoading: loadingKategori, isError: kategoriError } = useKategoriUsahaList();

  const kategoriUsaha = useMemo(() => {
    const raw = Array.isArray(kategoriData) ? kategoriData : (kategoriData as any)?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [kategoriData]);

  const [form, setForm] = useState<FormState>({
    namaPemilik: "",
    tahunBerdiri: "",
    kategoriUsahaId: "",
    rataOmsetPerBulan: "",
    platformPenjualan: "",
    uraianProduk: "",
    topikKonsultasi: "",
    preferredDateLocal: "",
    metode: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<SubmitPayload | null>(null);

  const isSubmitting = submitMutation.isPending;

  const buildPayload = (): SubmitPayload | null => {
    if (!form.namaPemilik.trim()) {
      toast.error("Nama pemilik wajib diisi");
      return null;
    }
    if (!form.tahunBerdiri.trim()) {
      toast.error("Tahun berdiri wajib diisi");
      return null;
    }

    const tahun = Number(form.tahunBerdiri);
    if (!Number.isFinite(tahun) || tahun < 1900 || tahun > new Date().getFullYear()) {
      toast.error("Tahun berdiri tidak valid");
      return null;
    }

    if (!form.kategoriUsahaId) {
      toast.error("Kategori usaha wajib dipilih");
      return null;
    }
    if (!form.rataOmsetPerBulan.trim()) {
      toast.error("Rata-rata omset per bulan wajib diisi");
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
    if (form.topikKonsultasi.trim().length < 20) {
      toast.error("Topik konsultasi minimal 20 karakter");
      return null;
    }
    if (!form.preferredDateLocal) {
      toast.error("Tanggal preferensi wajib dipilih");
      return null;
    }
    if (!form.metode) {
      toast.error("Metode konsultasi wajib dipilih");
      return null;
    }

    const preferred = new Date(form.preferredDateLocal);
    if (Number.isNaN(preferred.getTime())) {
      toast.error("Tanggal preferensi tidak valid");
      return null;
    }

    return {
      namaPemilik: form.namaPemilik.trim(),
      tahunBerdiri: tahun,
      kategoriUsahaId: form.kategoriUsahaId,
      rataOmsetPerBulan: form.rataOmsetPerBulan.trim(),
      platformPenjualan: form.platformPenjualan,
      uraianProduk: form.uraianProduk.trim(),
      topikKonsultasi: form.topikKonsultasi.trim(),
      preferredDate: preferred.toISOString(),
      metode: form.metode,
    };
  };

  const handleSubmit = () => {
    const payload = buildPayload();
    if (!payload) return;

    setPendingPayload(payload);
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    if (!pendingPayload) return;

    submitMutation.mutate(pendingPayload, {
      onSuccess: () => {
        toast.success("Pengajuan konsultasi berhasil dikirim");
        setConfirmOpen(false);
        setPendingPayload(null);
        onSuccess();
      },
      onError: (err: any) => {
        setConfirmOpen(false);
        setPendingPayload(null);
        toast.error(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Gagal mengirim pengajuan");
      },
    });
  };

  if (kategoriError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Gagal memuat kategori usaha.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-linear-to-br from-white via-amber-50 to-orange-100 p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Ajukan Konsultasi Bisnis</h2>
          <p className="text-sm text-slate-600">
            Isi detail usaha kamu, pilih tanggal preferensi, dan metode konsultasi. Admin akan meng-assign mentor dan mengkonfirmasi jadwal final.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Nama Pemilik</Label>
            <Input
              value={form.namaPemilik}
              onChange={(e) => setForm((c) => ({ ...c, namaPemilik: e.target.value }))}
              placeholder="Nama pemilik usaha"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label>Tahun Berdiri</Label>
            <Input
              type="number"
              value={form.tahunBerdiri}
              onChange={(e) => setForm((c) => ({ ...c, tahunBerdiri: e.target.value }))}
              placeholder="2022"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label>Kategori Usaha</Label>
            <Select
              value={form.kategoriUsahaId}
              onValueChange={(value) => setForm((c) => ({ ...c, kategoriUsahaId: value }))}
              disabled={isSubmitting || loadingKategori}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingKategori ? "Memuat..." : "Pilih kategori"} />
              </SelectTrigger>
              <SelectContent>
                {kategoriUsaha.map((k: any) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Rata-rata Omset/Bulan</Label>
            <Select
              value={form.rataOmsetPerBulan}
              onValueChange={(value) => setForm((c) => ({ ...c, rataOmsetPerBulan: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih omset" />
              </SelectTrigger>
              <SelectContent>
                {OMSET_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Platform Penjualan</Label>
            <Select
              value={form.platformPenjualan}
              onValueChange={(value) => setForm((c) => ({ ...c, platformPenjualan: value as PlatformPenjualan }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
                <SelectItem value="KEDUANYA">Keduanya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Metode Konsultasi</Label>
            <Select
              value={form.metode}
              onValueChange={(value) => setForm((c) => ({ ...c, metode: value as MetodeKonsultasi }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Uraian Produk/Jasa</Label>
            <Textarea
              value={form.uraianProduk}
              onChange={(e) => setForm((c) => ({ ...c, uraianProduk: e.target.value }))}
              placeholder="Ceritakan produk/jasa yang kamu tawarkan (min 20 karakter)"
              disabled={isSubmitting}
              className="min-h-28"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Topik Konsultasi</Label>
            <Textarea
              value={form.topikKonsultasi}
              onChange={(e) => setForm((c) => ({ ...c, topikKonsultasi: e.target.value }))}
              placeholder="Topik/masalah yang ingin dikonsultasikan (min 20 karakter)"
              disabled={isSubmitting}
              className="min-h-28"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Tanggal Preferensi</Label>
            <Input
              type="datetime-local"
              value={form.preferredDateLocal}
              onChange={(e) => setForm((c) => ({ ...c, preferredDateLocal: e.target.value }))}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-slate-500">Waktu mengikuti zona waktu perangkat kamu.</p>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Kirim Pengajuan
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pengajuan</DialogTitle>
            <DialogDescription>
              Pastikan data yang kamu isi sudah benar. Setelah dikirim, admin akan menugaskan mentor dan mengkonfirmasi jadwal final.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
              Kembali
            </Button>
            <Button type="button" onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Kirim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
