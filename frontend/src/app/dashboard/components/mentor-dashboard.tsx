"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useMentorKonsultasiApplications } from "@/hooks/useKonsultasi";
import { getStatusBadgeClass, getStatusLabel } from "@/app/dashboard/konsultasi/components/status-utils";
import {
  MessageCircle,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  User,
  Building2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MentorDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useMentorKonsultasiApplications({ limit: 50 });

  const applications = useMemo(() => data?.items ?? [], [data]);

  // Statistik Metrik Konsultasi
  const stats = useMemo(() => {
    const total = applications.length;
    const pendingResponse = applications.filter((a) => a.status === "ASSIGNED").length;
    const confirmed = applications.filter((a) =>
      ["MENTOR_CONFIRMED", "CONFIRMED"].includes(a.status)
    ).length;
    const completed = applications.filter((a) => a.status === "COMPLETED").length;

    return { total, pendingResponse, confirmed, completed };
  }, [applications]);

  // 5 Tugas terbaru yang perlu perhatian
  const recentTasks = useMemo(() => {
    return [...applications].slice(0, 5);
  }, [applications]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
            <span>Portal Pembimbing & Konsultan Bisnis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Selamat datang, Mentor {user?.name || "Budi Santoso"}!
          </h1>
          <p className="mt-2 max-w-2xl text-amber-100 text-sm leading-relaxed">
            Pantau permohonan konsultasi kewirausahaan dari mahasiswa dan pelaku UMKM binaan IBISTEK UTY. Berikan arahan strategis untuk akselerasi pertumbuhan bisnis mereka.
          </p>
        </div>
      </div>

      {/* Alert jika ada tugas ASSIGNED yang belum direspon */}
      {stats.pendingResponse > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Ada {stats.pendingResponse} Permintaan Konsultasi Baru Membutuhkan Respon Anda!
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Admin telah menugaskan Anda sebagai pembimbing. Silakan konfirmasi ketersediaan jadwal mentoring.
              </p>
            </div>
          </div>
          <Link href="/dashboard/konsultasi/mentor">
            <Button
              size="sm"
              variant="primary"
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0"
            >
              Tinjau Sekarang
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Grid Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tugas */}
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Total Penugasan</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : stats.total}
          </div>
          <p className="text-[11px] text-gray-400">Total sesi yang pernah ditugaskan</p>
        </div>

        {/* Perlu Respon */}
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Menunggu Respon</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : stats.pendingResponse}
          </div>
          <p className="text-[11px] text-gray-400">Perlu konfirmasi jadwal terima / tolak</p>
        </div>

        {/* Terjadwal / Aktif */}
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Jadwal Aktif</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : stats.confirmed}
          </div>
          <p className="text-[11px] text-gray-400">Telah dikonfirmasi & dijadwalkan</p>
        </div>

        {/* Selesai */}
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Bimbingan Selesai</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : stats.completed}
          </div>
          <p className="text-[11px] text-gray-400">Sesi konsultasi yang tuntas</p>
        </div>
      </div>

      {/* Tabel Tugas Konsultasi Terbaru */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Tugas Konsultasi & Mentoring Terbaru</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar sesi pendampingan bisnis yang memerlukan perhatian atau sedang berjalan.
            </p>
          </div>
          <Link href="/dashboard/konsultasi/mentor">
            <Button variant="outline" size="sm" className="text-xs">
              Lihat Semua Tugas
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium text-gray-600">Belum ada tugas konsultasi yang ditugaskan</p>
            <p className="text-xs mt-1">Admin akan mendelegasikan permohonan konsultasi peserta ke akun Anda.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 p-3 rounded-xl transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900 truncate">
                      {task.namaPemilik}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-gray-500 font-normal">
                      <Building2 className="w-3 h-3 mr-1 inline" />
                      {task.kategoriUsaha?.name || "Usaha"}
                    </Badge>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeClass(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    <strong>Topik:</strong> {task.topikKonsultasi}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.preferredDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-gray-600">
                      Metode: {task.metode}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link href={`/dashboard/konsultasi/${task.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 text-amber-700 border-amber-200 hover:bg-amber-50 font-medium"
                    >
                      Buka Detail
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
