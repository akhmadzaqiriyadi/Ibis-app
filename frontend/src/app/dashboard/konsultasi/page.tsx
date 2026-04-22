"use client";

import { useAuthStore } from "@/stores/auth-store";

import AdminStaffView from "./admin-staff-view";
import MentorView from "./mentor-view";
import StudentView from "./student-view";

export default function KonsultasiPage() {
  const { user } = useAuthStore();

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'ADMIN':
    case 'STAFF':
      return <AdminStaffView />;
    case 'MENTOR':
      return <MentorView />;
    case 'MAHASISWA':
      return <StudentView />;
    default:
      return <div>Anda tidak memiliki akses ke halaman ini.</div>;
  }
}
