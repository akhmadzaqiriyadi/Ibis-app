'use client';

import { useState } from 'react';
import { useGetMyCertificates } from '@/features/mikro-kredensial/hooks';
import { Certificate } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Printer,
  Download,
  Loader2,
  FileCheck,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

export default function MyCertificatesPage() {
  const { user } = useAuthStore();
  const { data: certsResponse, isLoading } = useGetMyCertificates();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const certificates: Certificate[] = (certsResponse as any)?.data || certsResponse || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 text-white rounded-2xl p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            Portofolio Kompetensi
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Sertifikat Digital Saya
          </h1>
          <p className="text-amber-50 text-base leading-relaxed">
            Daftar sertifikat kompetensi resmi yang berhasil Anda peroleh melalui program Mikro Kredensial IBISTEK UTY. Seluruh sertifikat memiliki nomor unik dan dapat diverifikasi keasliannya secara publik.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">Belum Ada Sertifikat</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
            Selesaikan kelas mikro kredensial dan dapatkan skor minimal 70 untuk memperoleh sertifikat digital resmi.
          </p>
          <Link href="/dashboard/mikro-kredensial">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white text-sm">
              Mulai Belajar di Mikro Kredensial
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const courseTitle =
              cert.enrollment?.kursus?.title || 'Program Mikro Kredensial IBISTEK';
            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center opacity-60 pointer-events-none">
                  <Award className="w-12 h-12 text-amber-500" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-100 text-amber-900 border-0 font-mono text-xs">
                      {cert.certificateNumber}
                    </Badge>
                    <span className="flex items-center text-xs text-emerald-600 font-semibold gap-1">
                      <ShieldCheck className="w-4 h-4" /> Terverifikasi
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 leading-snug">
                    {courseTitle}
                  </h3>

                  <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Diterbitkan: {new Date(cert.issuedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                  <Button
                    onClick={() => setSelectedCert(cert)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                  >
                    Lihat Sertifikat
                  </Button>
                  <Link
                    href={`/verify-certificate?number=${encodeURIComponent(cert.certificateNumber)}`}
                    target="_blank"
                  >
                    <Button variant="outline" size="icon" className="h-9 w-9 text-gray-500" title="Link Verifikasi Publik">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DIALOG PREVIEW SERTIFIKAT DIGITAL */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:hidden">
            <DialogTitle className="text-sm font-semibold text-gray-800">
              Pratinjau Sertifikat Digital
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Cetak / Simpan PDF
              </Button>
            </div>
          </div>

          {selectedCert && (
            <div className="p-8 sm:p-12 text-center bg-white border-8 border-amber-600/20 m-4 rounded-xl relative">
              {/* Watermark Ornamen */}
              <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Header Institusi */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest">
                    <Building2 className="w-4 h-4" />
                    Universitas Teknologi Yogyakarta
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-wide">
                    SERTIFIKAT KOMPETENSI
                  </h2>
                  <p className="text-xs text-gray-500 font-mono">
                    No: {selectedCert.certificateNumber}
                  </p>
                </div>

                <div className="text-xs text-gray-500 italic uppercase tracking-wider">
                  Diberikan dengan bangga kepada:
                </div>

                {/* Nama Penerima */}
                <div className="border-b-2 border-amber-600/40 pb-2 max-w-md mx-auto">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                    {user?.name || selectedCert.user?.name || 'Peserta Mikro Kredensial'}
                  </h3>
                </div>

                {/* Keterangan Kelulusan */}
                <div className="max-w-xl mx-auto text-sm text-gray-600 leading-relaxed">
                  Telah dinyatakan <strong className="text-emerald-700 font-bold">LULUS</strong> dan menyelesaikan seluruh modul pelatihan program Mikro Kredensial:
                  <div className="text-lg font-bold text-gray-900 mt-2 font-serif">
                    &ldquo;{selectedCert.enrollment?.kursus?.title || 'Program Mikro Kredensial'}&rdquo;
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    yang diselenggarakan oleh Inkubator Bisnis dan Teknologi (IBISTEK) UTY.
                  </div>
                </div>

                {/* Footer Sertifikat */}
                <div className="pt-8 grid grid-cols-2 gap-8 max-w-md mx-auto text-xs text-gray-600 border-t border-gray-100">
                  <div>
                    <div className="text-gray-400">Tanggal Terbit:</div>
                    <div className="font-semibold text-gray-800 mt-1">
                      {new Date(selectedCert.issuedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Status Validasi:</div>
                    <div className="font-semibold text-emerald-600 mt-1 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Sah & Terdaftar
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
