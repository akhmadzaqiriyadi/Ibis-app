import {
  LucideIcon,
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  Newspaper,
  GraduationCap
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  color?: string;
}

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-sky-500",
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: Calendar,
    color: "text-violet-500",
  },
  {
    title: "Programs",
    href: "/dashboard/programs",
    icon: GraduationCap,
    color: "text-pink-700",
  },
  {
    title: "Updates / News",
    href: "/dashboard/updates",
    icon: Newspaper,
    color: "text-orange-700",
  },
  {
    title: "Team Management",
    href: "/dashboard/team",
    icon: Users,
    color: "text-emerald-500",
  },
  {
    title: "CMS Content",
    href: "/dashboard/content",
    icon: FileText,
    color: "text-blue-500",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    color: "text-gray-500",
  },
];
