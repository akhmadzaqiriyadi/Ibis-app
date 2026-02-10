import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
// Import UI components (assuming you have them or I will create simplified versions inline)
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";

// Login Schema
const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Passowrd minimal 6 karakter" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const formRef = useRef(null);
  const { login } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  useGSAP(() => {
    gsap.from(".login-form-content", {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.1
    });
  }, { scope: formRef });

  const onSubmit = async (data: LoginValues) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

        const { token, user } = response.data.data;
        
        // Integration: Update store and set Cookie for middleware
        login(token, user);
        Cookies.set("token", token, { expires: 7, sameSite: 'Strict' }); // 7 days expiration
        
        router.push("/dashboard"); // Redirect to dashboard
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("root", { message: "Email atau password salah" });
      } else {
        setError("root", { message: "Terjadi kesalahan. Silakan coba lagi." });
      }
    }
  };

  return (
    <div ref={formRef} className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white/80 backdrop-blur-md shadow-2xl border border-white/20">
      <div className="text-center mb-8 login-form-content">
        <Image 
            src="/images/logos/brand-raw.webp" 
            alt="Logo" 
            width={64} 
            height={64} 
            className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h1>
        <p className="text-sm text-gray-500 mt-2">Masuk ke dashboard admin IBISTEK</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 login-form-content">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="admin@ibistek.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
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
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-linear-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Masuk</span>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center text-xs text-gray-400 login-form-content">
        &copy; {new Date().getFullYear()} IBISTEK UTY. All rights reserved.
      </div>
    </div>
  );
}
