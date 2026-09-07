'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { usePrograms } from '@/hooks/usePrograms';
import { useUpdates } from '@/hooks/useUpdates';
import {
  Users,
  Calendar,
  GraduationCap,
  Award,
  Briefcase,
  MessageCircle,
  ShieldAlert,
  Loader2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const { data: statsResponse, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/stats');
      return res.data?.data || res.data;
    },
  });

  const { data: programsData } = usePrograms({});
  const { data: updatesData } = useUpdates({ limit: 3 });

  const statsData = statsResponse || {};
  const programs: any[] = (programsData as any)?.data || programsData || [];
  const updates: any[] = (updatesData as any)?.data || (updatesData as any)?.items || updatesData || [];

  const stats = [
    {
      label: 'Total Pengguna',
      value: loadingStats ? '-' : String(statsData.totalUsers ?? 0),
      desc: `${statsData.pendingVerifications ?? 0} menunggu verifikasi`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/dashboard/users',
    },
    {
      label: 'Pengajuan Inkubasi',
      value: loadingStats ? '-' : String(statsData.inkubasiPending ?? 0),
      desc: 'Pengajuan pending review',
      icon: Briefcase,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      href: '/dashboard/inkubasi',
    },
    {
      label: 'Sesi Konsultasi Aktif',
      value: loadingStats ? '-' : String(statsData.konsultasiActive ?? 0),
      desc: 'Terjadwal & berlangsung',
      icon: MessageCircle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      href: '/dashboard/konsultasi',
    },
    {
      label: 'Sertifikat Diterbitkan',
      value: loadingStats ? '-' : String(statsData.certificatesIssued ?? 0),
      desc: `Dari ${statsData.totalKursus ?? 0} kursus aktif`,
      icon: Award,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      href: '/dashboard/certificates',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Dashboard Admin &amp; Staff
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Selamat datang kembali, <strong>{user?.name || 'Admin'}</strong>! Berikut adalah ringkasan operasional platform IBISTEK.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="p-6 bg-white rounded-2xl shadow-xs border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all block group"
          >
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {item.label}
              </p>
              <div className={cn('p-2.5 rounded-xl', item.bgColor)}>
                <item.icon className={cn('w-5 h-5', item.color)} />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-extrabold text-gray-900 group-hover:text-primary transition-colors">
                {item.value}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Navigation / Content Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Programs */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900">Program Utama IBISTEK</h3>
                <p className="text-xs text-gray-400">Pilar program pembinaan dan pengembangan</p>
              </div>
              <Link href="/dashboard/programs" className="text-xs font-semibold text-blue-600 hover:underline">
                Kelola Semua &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {programs.slice(0, 4).map((prog: any) => (
                <div
                  key={prog.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">
                      {prog.type ? prog.type.substring(0, 2) : 'PG'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{prog.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{prog.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                    {prog.type}
                  </span>
                </div>
              ))}
              {programs.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">
                  Belum ada data program.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Total {programs.length} Program Terdaftar</span>
            <Link href="/dashboard/programs" className="text-pink-600 font-semibold hover:underline">
              Buka CMS Program
            </Link>
          </div>
        </div>

        {/* Latest Updates / Berita */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900">Berita &amp; Kegiatan Terbaru</h3>
                <p className="text-xs text-gray-400">Artikel yang tampil di landing page</p>
              </div>
              <Link href="/dashboard/updates" className="text-xs font-semibold text-amber-600 hover:underline">
                Kelola &rarr;
              </Link>
            </div>

            <div className="space-y-4">
              {updates.slice(0, 3).map((upd: any) => (
                <div key={upd.id} className="flex gap-3 items-start group">
                  <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/updates/${upd.slug}`}
                      target="_blank"
                      className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-amber-600 transition-colors"
                    >
                      {upd.title}
                    </Link>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(upd.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {updates.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">
                  Belum ada berita yang dipublikasikan.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>CMS Publikasi Berita</span>
            <Link href="/dashboard/updates" className="text-amber-600 font-semibold hover:underline">
              Tulis Berita Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
