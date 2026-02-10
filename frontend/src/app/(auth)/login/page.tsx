"use client";

import Image from "next/image";
import LoginForm from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden bg-gray-50">
      {/* Left: Login Form */}
      <div className="relative z-10 flex flex-col justify-center items-center p-8 lg:p-12">
        <LoginForm />
      </div>

      {/* Right: Visual (Hidden on Mobile) */}
      <div className="hidden md:block relative bg-gradient-to-br from-blue-900 to-indigo-900 overflow-hidden">
        {/* Abstract Background with Noise/Grain */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        
        {/* Shapes/Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[80px]"></div>

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-center px-16 text-white z-10">
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Manage Innovation,<br />
            Create Impact.
          </h2>
          <p className="text-lg text-blue-100 max-w-md leading-relaxed">
            Welcome to the centralized management system for IBISTEK UTY. Monitor programs, manage tenants, and update content seamlessly.
          </p>

          {/* Stats or decoration */}
          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-bold">15+</div>
              <div className="text-sm text-blue-200">Startups Incubated</div>
            </div>
            <div>
              <div className="text-3xl font-bold">383+</div>
              <div className="text-sm text-blue-200">Tenants Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
