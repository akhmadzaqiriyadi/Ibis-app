"use client";

import { useAuthStore } from "@/stores/auth-store";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MentorDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
          <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Selamat datang, Mentor {user?.name}! 🎓</h2>
          <p className="text-muted-foreground mt-2">
              Cek penugasan inkubasi dan jadwal mentoring terbaru Anda.
          </p>
          </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
          <Link href="/dashboard/konsultasi/mentor">
            <div className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all h-full flex flex-col cursor-pointer">
              <div className={cn("inline-flex p-3 rounded-lg mb-4 w-fit", "bg-amber-500/10")}>
                <MessageCircle className={cn("w-6 h-6", "text-amber-500")} />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">Tugas Konsultasi</h3>
              <p className="text-sm text-gray-500 mt-2 flex-grow">Lihat dan konfirmasi permintaan konsultasi yang ditugaskan kepada Anda oleh Admin.</p>
            </div>
          </Link>
      </div>
    </div>
  );
}
