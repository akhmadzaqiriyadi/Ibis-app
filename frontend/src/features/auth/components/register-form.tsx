"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User as UserIcon, Building2 } from "lucide-react";
import { useRegister } from "@/features/auth/hooks";
import { useProgramStudiList } from "@/features/master-data/hooks";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AxiosError } from "axios";
import { UserType } from "@/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const registerSchema = z.object({
  userType: z.enum(["MAHASISWA", "UMKM"]),
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  noWhatsApp: z.string().min(10, { message: "Nomor WhatsApp tidak valid" }),
  // Conditional fields will be refined later
  npm: z.string().optional(),
  programStudiId: z.string().optional(),
  alamatUsaha: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.userType === "MAHASISWA") {
    if (!data.npm || data.npm.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NPM wajib diisi", path: ["npm"] });
    }
    if (!data.programStudiId || data.programStudiId.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Program Studi wajib dipilih", path: ["programStudiId"] });
    }
  }
  if (data.userType === "UMKM") {
    if (!data.alamatUsaha || data.alamatUsaha.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Alamat Usaha wajib diisi", path: ["alamatUsaha"] });
    }
  }
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const formRef = useRef(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: stdRes, isLoading: isLoadingProdi } = useProgramStudiList();
  const programStudiList = stdRes || [];
  const registerMutation = useRegister();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "MAHASISWA",
    }
  });

  const currentUserType = watch("userType");

  useGSAP(() => {
    gsap.from(".register-form-content", {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.05
    });
  }, { scope: formRef });

  const onSubmit = (data: RegisterValues) => {
    setSuccessMsg(null);
    registerMutation.mutate(data, {
      onSuccess: () => {
        setSuccessMsg("Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi dari admin. Anda akan menerima notifikasi email setelah disetujui.");
        setTimeout(() => {
            router.push("/login"); // Redirect back to login eventually
        }, 5000)
      },
      onError: (err: unknown) => {
        const axErr = err as AxiosError<{ message?: string; error?: string }>;
        const errorMsg = axErr.response?.data?.message || axErr.response?.data?.error;
        setError("root", { message: errorMsg || "Terjadi kesalahan saat mendaftar. Silakan coba lagi." });
      }
    });
  };

  if (successMsg) {
      return (
          <div ref={formRef} className="w-full p-8 rounded-2xl bg-white shadow-xl text-center register-form-content">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sukses Mendaftar!</h2>
              <p className="text-gray-600 mb-6">{successMsg}</p>
              <Link href="/login" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Kembali ke Login
              </Link>
          </div>
      )
  }

  return (
    <div ref={formRef} className="w-full">
      <div className="text-center mb-8 register-form-content">
        <Image 
            src="/images/logos/brand-raw.webp" 
            alt="Logo" 
            width={64} 
            height={64} 
            className="mx-auto mb-4 md:hidden" // Only show on mobile
        />
        <h1 className="text-3xl font-bold text-gray-900">Buat Akun IBISTEK</h1>
        <p className="text-sm text-gray-500 mt-2">Pilih jenis akun Anda untuk mulai berinovasi</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 register-form-content">
        {/* User Type Selector */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <button
                type="button"
                onClick={() => setValue("userType", "MAHASISWA")}
                className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    currentUserType === "MAHASISWA" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-blue-200 text-gray-600"
                )}
            >
                <UserIcon className="w-6 h-6 mb-2" />
                <span className="font-semibold text-sm">Mahasiswa</span>
            </button>
            <button
                 type="button"
                 onClick={() => setValue("userType", "UMKM")}
                 className={cn(
                     "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                     currentUserType === "UMKM" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 hover:border-orange-200 text-gray-600"
                 )}
            >
                <Building2 className="w-6 h-6 mb-2" />
                <span className="font-semibold text-sm">UMKM / StartUp</span>
            </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
            {/* Nama */}
            <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap {currentUserType === "UMKM" && "Pemilik"}</label>
            <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* WhatsApp */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
            <input
                {...register("noWhatsApp")}
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="08123456789"
            />
            {errors.noWhatsApp && <p className="mt-1 text-xs text-red-500">{errors.noWhatsApp.message}</p>}
            </div>

            {/* Password */}
            <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimal 6 karakter"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Mahasiswa Exact Fields */}
            {currentUserType === "MAHASISWA" && (
                <>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NPM</label>
                    <input
                        {...register("npm")}
                        type="text"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="NPM Anda"
                    />
                    {errors.npm && <p className="mt-1 text-xs text-red-500">{errors.npm.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                    <Controller
                        name="programStudiId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                                disabled={isLoadingProdi}
                            >
                                <SelectTrigger className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <SelectValue placeholder="Pilih Program Studi" />
                                </SelectTrigger>
                                <SelectContent>
                                    {programStudiList.map((prodi: { id: string; name: string }) => (
                                        <SelectItem key={prodi.id} value={prodi.id}>
                                            {prodi.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.programStudiId && <p className="mt-1 text-xs text-red-500">{errors.programStudiId.message}</p>}
                </div>
                </>
            )}

            {/* UMKM Exact Fields */}
            {currentUserType === "UMKM" && (
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Usaha</label>
                    <textarea
                        {...register("alamatUsaha")}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Detail Alamat Usaha"
                        rows={3}
                    />
                    {errors.alamatUsaha && <p className="mt-1 text-xs text-red-500">{errors.alamatUsaha.message}</p>}
                </div>
            )}
        </div>

        {/* General Error */}
        {errors.root && (
          <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm text-center border border-red-100">
            {errors.root.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses Registrasi...</span>
            </>
          ) : (
            <span>Daftar Akun</span>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600 register-form-content pb-10 md:pb-0">
        Sudah memiliki akun?{" "}
        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Masuk di sini
        </Link>
      </div>
    </div>
  );
}
