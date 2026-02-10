"use client";

import { useAuthStore } from "@/stores/auth-store";
import { MobileSidebar } from "@/features/dashboard/components/mobile-sidebar";

export function DashboardNavbar() {
  const { user } = useAuthStore();

  return (
    <div className="flex items-center p-4">
      {/* Mobile Trigger */}
      <MobileSidebar />

      <div className="flex w-full justify-end">
        {/* User Button (Logout/Profile) - Placeholder or actual */}
      </div>
    </div>
  );
}
