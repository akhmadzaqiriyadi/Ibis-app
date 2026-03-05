import {
  LucideIcon,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  GraduationCap,
  FileQuestionMark,
  BookOpen,      // Mikro Kredensial
  Briefcase,     // Inkubasi
  MessageCircle, // Konsultasi
  Database,      // Master Data
  ShieldAlert,   // Verifikasi User
  Award          // Sertifikat
} from "lucide-react";
import { Role } from "@/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  color?: string;
  isExternal?: boolean;
}

export const getNavItems = (role?: Role): NavItem[] => {
  const adminStaffItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-sky-500" },
    { title: "Manajemen User", href: "/dashboard/users", icon: Users, color: "text-blue-600" },
    { title: "Verifikasi User", href: "/dashboard/verify-users", icon: ShieldAlert, color: "text-red-500" },
    { title: "Inkubasi Bisnis", href: "/dashboard/inkubasi", icon: Briefcase, color: "text-orange-500" },
    { title: "Konsultasi", href: "/dashboard/konsultasi", icon: MessageCircle, color: "text-amber-500" },
    { title: "Mikro Kredensial", href: "/dashboard/mikro-kredensial", icon: BookOpen, color: "text-green-600" },
    { title: "Sertifikat", href: "/dashboard/certificates", icon: Award, color: "text-yellow-600" },
    { title: "Events (CMS)", href: "/dashboard/events", icon: Calendar, color: "text-violet-500" },
    { title: "Programs (CMS)", href: "/dashboard/programs", icon: GraduationCap, color: "text-pink-700" },
    { title: "Team (CMS)", href: "/dashboard/team", icon: Users, color: "text-emerald-500" },
    { title: "FAQ (CMS)", href: "/dashboard/faq", icon: FileQuestionMark, color: "text-blue-500" },
    { title: "Master Data", href: "/dashboard/master-data", icon: Database, color: "text-slate-500" },
    // { title: "Settings", href: "/dashboard/settings", icon: Settings, color: "text-gray-500" },
  ];

  const mahasiswaItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-sky-500" },
    { title: "Inkubasi Bisnis", href: "/dashboard/inkubasi", icon: Briefcase, color: "text-orange-500" },
    { title: "Konsultasi", href: "/dashboard/konsultasi", icon: MessageCircle, color: "text-amber-500" },
    { title: "Mikro Kredensial", href: "/dashboard/mikro-kredensial", icon: BookOpen, color: "text-green-600" },
    { title: "Sertifikat Saya", href: "/dashboard/certificates/my", icon: Award, color: "text-yellow-600" },
  ];

  const umkmItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-sky-500" },
    { title: "Mikro Kredensial", href: "/dashboard/mikro-kredensial", icon: BookOpen, color: "text-green-600" },
    { title: "Sertifikat Saya", href: "/dashboard/certificates/my", icon: Award, color: "text-yellow-600" },
  ];

  const mentorItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-sky-500" },
    { title: "Tugas Konsultasi", href: "/dashboard/konsultasi/mentor", icon: MessageCircle, color: "text-amber-500" },
  ];

  // Default to Admin/Staff for previous unsupported legacy roles like MEMBER/USER 
  // until fully migrated, but restrict logically on pages
  if (role === 'MAHASISWA') return mahasiswaItems;
  if (role === 'UMKM') return umkmItems;
  if (role === 'MENTOR') return mentorItems;

  return adminStaffItems;
};
