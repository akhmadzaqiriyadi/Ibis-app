"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Briefcase, MessageCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MahasiswaDashboard() {
  const { user } = useAuthStore();

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

      <div className="grid gap-4 md:grid-cols-3 mt-8">
        {services.map((item) => (
          <Link key={item.title} href={item.href}>
            <div className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all h-full flex flex-col cursor-pointer">
              <div className={cn("inline-flex p-3 rounded-lg mb-4 w-fit", item.bgColor)}>
                <item.icon className={cn("w-6 h-6", item.color)} />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-2 flex-grow">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
