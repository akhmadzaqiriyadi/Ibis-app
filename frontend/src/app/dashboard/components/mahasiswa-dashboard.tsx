"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Briefcase, MessageCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useGetMyApplications } from "@/features/inkubasi/hooks";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";

export default function MahasiswaDashboard() {
  const { user } = useAuthStore();
  const { data: applicationsData, isLoading, isError } = useGetMyApplications();

  const myApplications = useMemo(() => {
    const raw = Array.isArray(applicationsData) ? applicationsData : (applicationsData as any)?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [applicationsData]);

  const latestApplication = useMemo(() => {
    if (myApplications.length === 0) return null;
    return [...myApplications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [myApplications]);

  const services = [
    {
      title: "Inkubasi Bisnis",
      desc: "Daftarkan startup kamu untuk dibina langsung oleh IBISTEK.",
      href: "/dashboard/inkubasi",
      icon: Briefcase,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Konsultasi",
      desc: "Diskusi dan mentoring bersama ahli terkait bisnismu.",
      href: "/dashboard/konsultasi",
      icon: MessageCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Mikro Kredensial",
      desc: "Sertifikasi digital untuk menambah kompetensi Anda.",
      href: "/dashboard/mikro-kredensial",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
          <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Halo, {user?.name || "Mahasiswa"}! 👋</h2>
          <p className="text-muted-foreground mt-2">
              Kembangkan potensimu melalui program-program inkubator kami.
          </p>
          </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-orange-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              <Clock3 className="h-3.5 w-3.5" />
              Notifikasi Inkubasi
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Status pengajuan inkubasi kamu</h3>
            <p className="text-sm text-slate-600">
              Pantau hasil review terbaru tanpa harus buka halaman inkubasi setiap saat.
            </p>
          </div>

          <Link href="/dashboard/inkubasi" className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50">
            Buka Inkubasi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock3 className="h-4 w-4 animate-pulse" />
              Memuat status pengajuan...
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Gagal memuat status inkubasi.
            </div>
          ) : latestApplication ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">{latestApplication.period?.name || "Periode tidak diketahui"}</div>
                <div className="text-sm text-slate-600">Pemilik: {latestApplication.namaPemilik}</div>
                <div className="text-xs text-slate-500">Dikirim {new Date(latestApplication.createdAt).toLocaleString("id-ID")}</div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className={
                  latestApplication.status === "APPROVED"
                    ? "border-green-200 bg-green-100 text-green-700"
                    : latestApplication.status === "REJECTED"
                      ? "border-red-200 bg-red-100 text-red-700"
                      : "border-amber-200 bg-amber-100 text-amber-700"
                }>
                  {latestApplication.status === "APPROVED" ? "Disetujui" : latestApplication.status === "REJECTED" ? "Ditolak" : "Menunggu Review"}
                </Badge>
                {latestApplication.status === "APPROVED" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock3 className="h-5 w-5 text-orange-500" />
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              Belum ada pengajuan inkubasi. Kalau ingin ikut program, buka menu Inkubasi dan isi form pengajuan.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3 mt-8">
        {services.map((item) => (
          <Link key={item.title} href={item.href}>
            <div className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all h-full flex flex-col cursor-pointer">
              <div className={cn("inline-flex p-3 rounded-lg mb-4 w-fit", item.bgColor)}>
                <item.icon className={cn("w-6 h-6", item.color)} />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-2 grow">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
