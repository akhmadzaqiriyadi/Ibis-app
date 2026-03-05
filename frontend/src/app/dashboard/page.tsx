

"use client";

import { useAuthStore } from "@/stores/auth-store";
import AdminDashboard from "./components/admin-dashboard";
import MahasiswaDashboard from "./components/mahasiswa-dashboard";
import UmkmDashboard from "./components/umkm-dashboard";
import MentorDashboard from "./components/mentor-dashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Handle loading state until persist hydration is complete if needed
  if (!user) return (
    <div className="flex h-full w-full items-center justify-center p-20">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  );

  switch (user.role) {
    case 'MAHASISWA':
      return <MahasiswaDashboard />;
    case 'UMKM':
      return <UmkmDashboard />;
    case 'MENTOR':
      return <MentorDashboard />;
    default:
      // Handle ADMIN, STAFF, fallback
      return <AdminDashboard />;
  }
}
