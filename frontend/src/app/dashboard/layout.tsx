import { DashboardNavbar } from "@/features/dashboard/components/navbar";
import { DashboardSidebar } from "@/features/dashboard/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900 border-r border-[#2D2E35]">
        <DashboardSidebar />
      </div>
      <main className="md:pl-72 h-full bg-[#f8f9fc]">
        <DashboardNavbar />
        <div className="p-8 h-full">
            {children}
        </div>
      </main>
    </div>
  );
}
