import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-linear-3 py-6 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-white text-xs md:text-sm flex items-center justify-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 fill-light/70 text-light/90 inline-block" /> by IBISTEK
            </span>
            <span className="hidden sm:inline">|</span>
            <span>Universitas Teknologi Yogyakarta © {new Date().getFullYear()}</span>
          </p>

          <div className="flex items-center gap-4 text-xs text-white/80">
            <Link
              href="/verify-certificate"
              className="inline-flex items-center gap-1 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verifikasi Keaslian Sertifikat</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
