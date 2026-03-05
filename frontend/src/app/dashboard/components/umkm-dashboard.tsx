"use client";

import { useAuthStore } from "@/stores/auth-store";
import { BookOpen, Award } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function UmkmDashboard() {
  const { user } = useAuthStore();

  const services = [
    {
      title: "Mikro Kredensial",
      desc: "Sertifikasi digital untuk scale-up operasional bisnis kamu.",
      href: "/dashboard/mikro-kredensial",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
    {
      title: "Sertifikat",
      desc: "Lihat sertifikat yang pernah UMKM Anda raih di sini.",
      href: "/dashboard/certificates/my",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-600/10",
    },
  ];

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
          <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Halo, {user?.name || "Mitra UMKM"}! 👋</h2>
          <p className="text-muted-foreground mt-2">
              Jemput dan raih sukses usahamu melalui program sertifikasi dan kolaborasi IBISTEK.
          </p>
          </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
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
