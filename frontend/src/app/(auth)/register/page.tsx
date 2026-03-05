"use client";

import Image from "next/image";
import RegisterForm from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden bg-gray-50">
      {/* Left (Visual) - Hidden on Mobile */}
      <div className="hidden md:block relative bg-[url('/images/assets/event-hero.webp')] bg-cover bg-center overflow-hidden">
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-blue-900/80 mix-blend-multiply"></div>
        
        {/* Abstract Background with Noise/Grain */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        
        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-center px-16 text-white z-10">
          <Image 
            src="/images/logos/brand-light.webp" 
            alt="Logo" 
            width={120} 
            height={60} 
            className="mb-8"
          />
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Gabung bersama ekosistem <br />
            inovasi IBISTEK UTY.
          </h2>
          <p className="text-lg text-blue-100 max-w-md leading-relaxed">
            Mulailah perjalanan inkubasi bisnis, kembangkan usaha, dan dapatkan bimbingan langsung dari ahli.
          </p>
        </div>
      </div>

      {/* Right (Form Area) */}
      <div className="relative z-10 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 w-full max-h-screen overflow-y-auto w-[scrollbar-width:thin]">
         <div className="w-full max-w-lg mt-8 mb-8">
            <RegisterForm />
         </div>
      </div>
    </div>
  );
}
