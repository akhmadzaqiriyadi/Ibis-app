import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-linear-3 py-6">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-white text-sm md:text-base flex items-center justify-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 fill-light/70 text-light/90 inline-block" /> by IBISTEK
            </span>
            <span className="hidden md:inline">|</span>
            <span>Universitas Teknologi Yogyakarta © {new Date().getFullYear()}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
