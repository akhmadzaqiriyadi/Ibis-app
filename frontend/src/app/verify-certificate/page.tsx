'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Award,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useVerifyCertificate } from '@/features/mikro-kredensial/hooks';

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const paramNumber = searchParams.get('number') || '';
  const [certInput, setCertInput] = useState(paramNumber);
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  const activeSearchNumber = submittedQuery ?? paramNumber;

  const { data: certResponse, isLoading, isError } = useVerifyCertificate(activeSearchNumber);
  const cert = (certResponse as any)?.data || certResponse;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (certInput.trim()) {
      setSubmittedQuery(certInput.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <Container>
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verifikasi Dokumen Resmi
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Verifikasi Sertifikat Digital
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
                Cek keabsahan dan keaslian sertifikat kompetensi yang diterbitkan oleh Inkubator Bisnis dan Teknologi (IBISTEK) UTY.
              </p>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
              <div className="relative flex-1 flex items-center pl-3">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <Input
                  type="text"
                  placeholder="Masukkan nomor sertifikat (e.g. IBIS/KRED/2026/A1B2)"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  className="border-0 focus-visible:ring-0 text-sm shadow-none p-0"
                />
              </div>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 rounded-xl"
              >
                Cek Validitas
              </Button>
            </form>

            {/* Results Section */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white rounded-2xl border border-gray-200">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-sm text-gray-500">Memverifikasi keaslian dokumen...</p>
              </div>
            ) : isError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-red-900">Sertifikat Tidak Ditemukan</h3>
                <p className="text-sm text-red-700 max-w-md mx-auto">
                  Nomor sertifikat <strong className="font-mono">{activeSearchNumber}</strong> tidak terdaftar dalam database resmi IBISTEK UTY. Pastikan nomor yang dimasukkan sudah sesuai.
                </p>
              </div>
            ) : cert && cert.certificateNumber ? (
              <div className="bg-white rounded-2xl border border-emerald-200 shadow-md overflow-hidden animate-in fade-in duration-300">
                <div className="bg-emerald-600 text-white p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Sertifikat Resmi &amp; Terverifikasi</h2>
                      <p className="text-xs text-emerald-100">Database Inkubator Bisnis dan Teknologi UTY</p>
                    </div>
                  </div>
                  <Badge className="bg-white text-emerald-800 font-bold border-0 text-xs">
                    VALID
                  </Badge>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider block">Nomor Sertifikat</span>
                      <span className="text-sm font-bold font-mono text-gray-900 mt-1 block">
                        {cert.certificateNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider block">Tanggal Terbit</span>
                      <span className="text-sm font-semibold text-gray-900 mt-1 block flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        {new Date(cert.issuedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400 uppercase tracking-wider block">Nama Penerima</span>
                      <span className="text-xl font-bold text-gray-900 mt-1 block flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-600" />
                        {cert.user?.name || 'Peserta Terdaftar'}
                      </span>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wider block">Program Pelatihan</span>
                      <span className="text-base font-semibold text-emerald-950 mt-1 block flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                        {cert.enrollment?.kursus?.title || 'Program Mikro Kredensial'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <Building2 className="w-4 h-4" /> UTY Creative Hub, D.I. Yogyakarta
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Terdaftar di Sistem
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>}>
      <VerifyCertificateContent />
    </Suspense>
  );
}
