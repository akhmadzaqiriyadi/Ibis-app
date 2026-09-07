"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { MobileSidebar } from "@/features/dashboard/components/mobile-sidebar";
import { Globe, ExternalLink, LogOut, Shield, Award, Briefcase, GraduationCap } from "lucide-react";

export function DashboardNavbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
            <Shield className="w-3 h-3" /> ADMIN
          </span>
        );
      case "STAFF":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            STAFF
          </span>
        );
      case "MENTOR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
            <Award className="w-3 h-3" /> MENTOR
          </span>
        );
      case "UMKM":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
            <Briefcase className="w-3 h-3" /> UMKM
          </span>
        );
      case "MAHASISWA":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <GraduationCap className="w-3 h-3" /> MAHASISWA
          </span>
        );
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Mobile Sidebar Trigger */}
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <span className="text-xs font-medium text-slate-400 hidden sm:inline-block">
          Portal Sistem IBISTEK UTY
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Public Website Quick Link */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
          title="Buka Website Utama IBISTEK"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden md:inline">Website Publik</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-primary/20">
            {getInitials(user?.name)}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight max-w-[140px] truncate">
              {user?.name || "Pengguna"}
            </span>
            <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {user?.email}
            </span>
          </div>
          {getRoleBadge(user?.role)}
        </div>

        {/* Quick Logout Button */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors border border-rose-200 dark:border-rose-900/50 ml-1"
          title="Keluar dari akun"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}

