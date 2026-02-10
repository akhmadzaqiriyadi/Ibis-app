"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { adminNavItems } from "@/config/dashboard-nav";
import { useAuthStore } from "@/stores/auth-store";
import { LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    Cookies.remove("token");
    router.push("/login");
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border-r border-white/10 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <Image
              fill
              alt="Logo"
              src="/images/logos/brand-raw.webp"
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
            IBISTEK CMS
          </h1>
        </Link>
        <div className="space-y-1">
          {adminNavItems.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.title}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* User & Logout Section */}
      <div className="px-3 pb-4">
          <div className="bg-white/5 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-zinc-400 truncate">{user?.email || 'admin@ibistek.com'}</p>
                  </div>
              </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-red-400 hover:bg-red-500/10 rounded-lg transition text-zinc-400"
          >
             <div className="flex items-center flex-1">
                <LogOut className="h-5 w-5 mr-3 text-red-500" />
                Logout
              </div>
          </button>
      </div>
    </div>
  );
}
