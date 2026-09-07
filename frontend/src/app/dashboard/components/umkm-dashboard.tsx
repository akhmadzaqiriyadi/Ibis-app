"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  BookOpen,
  Award,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useGetMyEnrollments, useGetMyCertificates } from "@/features/mikro-kredensial/hooks";
import { Button } from "@/components/ui/button";

export default function UmkmDashboard() {
  const { user } = useAuthStore();
  const { data: enrollments = [] } = useGetMyEnrollments();
  const { data: certificates = [] } = useGetMyCertificates();

  const completedCount = useMemo(() => {
    return enrollments.filter((e) => e.status === "COMPLETED").length;
  }, [enrollments]);

  const ongoingCount = useMemo(() => {
    return enrollments.filter((e) => e.status === "IN_PROGRESS").length;
  }, [enrollments]);

  const services = [
    {
      title: "Mikro Kredensial",
      desc: "Ikuti pelatihan bisnis digital, pelajari modul materi terstruktur, dan ikuti kuis evaluasi.",
      href: "/dashboard/mikro-kredensial",
      icon: BookOpen,
      color: "text-emerald-600",
      bgColor: "bg-emerald-600/10",
      actionText: "Buka Katalog & Kelas Saya",
    },
    {
      title: "Sertifikat Digital Saya",
      desc: "Lihat portofolio sertifikat resmi kelulusan berlisensi IBISTEK UTY dan cetak PDF kapan saja.",
      href: "/dashboard/certificates/my",
      icon: Award,
      color: "text-amber-600",
      bgColor: "bg-amber-600/10",
      actionText: "Lihat Portofolio Sertifikat",
    },
    {
      title: "Verifikasi Keaslian Sertifikat",
      desc: "Uji dan periksa keaslian nomor sertifikat digital secara transparan melalui portal publik.",
      href: "/verify-certificate",
      icon: ShieldCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-600/10",
      actionText: "Buka Validator Sertifikat",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Portal Mitra UMKM IBISTEK UTY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Selamat datang, {user?.name || "Mitra UMKM"}!
          </h1>
          <p className="mt-2 max-w-2xl text-teal-100 text-sm leading-relaxed">
            Tingkatkan keunggulan kompetitif dan kredibilitas bisnis Anda melalui kursus bersertifikat resmi, modul pembelajaran digital, dan evaluasi mandiri bersama IBISTEK UTY.
          </p>
        </div>
      </div>

      {/* Overview Metrik UMKM */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Kelas Diikuti</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">{enrollments.length}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Total kursus yang Anda daftari</p>
        </div>
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Sedang Berjalan</span>
          <div className="text-2xl font-bold text-teal-600 mt-1">{ongoingCount}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Modul yang sedang dipelajari</p>
        </div>
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Sertifikat Diraih</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{certificates.length || completedCount}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Sertifikat digital terverifikasi</p>
        </div>
      </div>

      {/* KARTU LAYANAN UTAMA */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Layanan Utama Pelaku UMKM</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((item) => (
            <Link key={item.title} href={item.href} className="group">
              <div className="p-6 bg-white rounded-2xl shadow-xs border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all h-full flex flex-col justify-between">
                <div>
                  <div className={cn("inline-flex p-3 rounded-xl mb-4", item.bgColor)}>
                    <item.icon className={cn("w-6 h-6", item.color)} />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
