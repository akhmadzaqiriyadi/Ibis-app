"use client";

import { useAuthStore } from "@/stores/auth-store";
import { 
    Users, 
    Calendar, 
    GraduationCap, 
    TrendingUp, 
    MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
const { user } = useAuthStore();

const stats = [
    {
    label: "Total Tenants",
    value: "383",
    change: "+12% from last month",
    icon: Users,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    },
    {
    label: "Active Events",
    value: "1",
    change: "UTY Growpath Expo",
    icon: Calendar,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    },
    {
    label: "Programs",
    value: "3",
    change: "Incubation, Training...",
    icon: GraduationCap,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    },
    {
    label: "Engagement",
    value: "2,400+",
    change: "Monthly Visitors",
    icon: TrendingUp,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    },
];

return (
    <div className="space-y-8">
    {/* Page Header */}
    <div className="flex items-center justify-between">
        <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name || "Admin"}! Here is an overview of your platform.
        </p>
        </div>
        <div className="flex items-center space-x-2">
        {/* Placeholder for actions */}
        </div>
    </div>

    {/* Stats Grid */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
        <div 
            key={item.label} 
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-gray-500">
                {item.label}
            </p>
            <div className={cn("p-2 rounded-lg", item.bgColor)}>
                <item.icon className={cn("w-4 h-4", item.color)} />
            </div>
            </div>
            <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            <p className="text-xs text-green-600 mt-1 font-medium">
                {item.change}
            </p>
            </div>
        </div>
        ))}
    </div>

    {/* Recent Activity / Content Sections */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart/Table Area */}
        <div className="col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-gray-900">Recent Programs</h3>
                <Link href="/dashboard/programs" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                IN
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Incubation Batch {2025 + i}</p>
                                <p className="text-xs text-gray-500">Starts Dec 12, 2025</p>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Side Panel / Updates */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-gray-900">Latest Updates</h3>
                <Link href="/dashboard/updates" className="text-sm text-blue-600 hover:underline">Manage</Link>
            </div>
             <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex gap-4">
                         <div className="relative w-24 h-16 bg-gray-200 rounded-md overflow-hidden shrink-0">
                            {/* Placeholder image */}
                         </div>
                         <div>
                             <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                 UTY Growpath Season 3 Successfully Held with Great Enthusiasm
                             </p>
                             <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
    </div>
);
}
