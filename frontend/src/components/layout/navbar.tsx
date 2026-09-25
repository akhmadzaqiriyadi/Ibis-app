"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { CONTENT } from "@/constants/content";
import { Container } from "@/components/ui/container";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (href: string, e: React.MouseEvent) => {
    if (href.startsWith("#")) {
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        return;
      }
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        if (href === "#programs") {
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
          const offset = 120; // Offset to account for fixed navbar
          window.scrollTo({
            top: targetPosition - offset,
            behavior: "smooth",
          });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <header 
      className={`top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'fixed py-4' 
          : 'absolute py-6'
      }`}
    >
      <Container>
        <div 
          className={`flex items-center justify-between transition-all duration-800 ease-in-out mx-auto ${
            isScrolled
              ? 'bg-primary/20 backdrop-blur-md rounded-full shadow-lg h-20 max-w-5xl px-6'
              : 'bg-transparent h-20 max-w-full'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src={CONTENT.nav.image}
              alt="IBISTEK Logo"
              width={205}
              height={114}
              className="w-32 h-18 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {/* Home */}
            <Link
              href="#home"
              onClick={(e) => handleSmoothScroll("#home", e)}
              className="text-base xl:text-lg font-medium text-light/90 transition-colors hover:text-secondary"
            >
              Home
            </Link>

            {/* Tentang Kami Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 text-base xl:text-lg font-medium text-light/90 hover:text-secondary py-2 transition-colors cursor-pointer focus:outline-none"
              >
                <span>Tentang Kami</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180 text-light/70 group-hover:text-secondary" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto focus-within:opacity-100 focus-within:visible focus-within:pointer-events-auto transition-all duration-200 z-50">
                <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 min-w-[200px] flex flex-col gap-1 ring-1 ring-black/20">
                  <Link
                    href="#about"
                    onClick={(e) => handleSmoothScroll("#about", e)}
                    className="text-sm font-medium text-light/80 hover:text-secondary hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all"
                  >
                    About Us
                  </Link>
                  <Link
                    href="#team"
                    onClick={(e) => handleSmoothScroll("#team", e)}
                    className="text-sm font-medium text-light/80 hover:text-secondary hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Our Team
                  </Link>
                  <Link
                    href="#partners"
                    onClick={(e) => handleSmoothScroll("#partners", e)}
                    className="text-sm font-medium text-light/80 hover:text-secondary hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Partners
                  </Link>
                </div>
              </div>
            </div>

            {/* Programs */}
            <Link
              href="#programs"
              onClick={(e) => handleSmoothScroll("#programs", e)}
              className="text-base xl:text-lg font-medium text-light/90 transition-colors hover:text-secondary"
            >
              Programs
            </Link>

            {/* Informasi Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 text-base xl:text-lg font-medium text-light/90 hover:text-secondary py-2 transition-colors cursor-pointer focus:outline-none"
              >
                <span>Informasi</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180 text-light/70 group-hover:text-secondary" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto focus-within:opacity-100 focus-within:visible focus-within:pointer-events-auto transition-all duration-200 z-50">
                <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 min-w-[190px] flex flex-col gap-1 ring-1 ring-black/20">
                  <Link
                    href="#updates"
                    onClick={(e) => handleSmoothScroll("#updates", e)}
                    className="text-sm font-medium text-light/80 hover:text-secondary hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Updates
                  </Link>
                  <Link
                    href="#contact"
                    onClick={(e) => handleSmoothScroll("#contact", e)}
                    className="text-sm font-medium text-light/80 hover:text-secondary hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>

            {/* Verifikasi Sertifikat */}
            <Link
              href="/verify-certificate"
              className="text-base xl:text-lg font-medium text-light/90 transition-colors hover:text-secondary"
            >
              Verifikasi Sertifikat
            </Link>

            {/* Sign In */}
            <Link
              href="/login"
              className="text-base xl:text-lg font-medium text-light/90 transition-colors hover:text-secondary"
            >
              {CONTENT.nav.cta}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-light"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile Menu - Floating Style */}
      {isOpen && (
        <div className="lg:hidden px-4 py-3">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10">
            <div className="py-4 px-6 flex flex-col gap-2">
              <Link
                href="#home"
                className="text-base font-medium text-light/90 hover:text-secondary hover:bg-white/10 py-2.5 px-4 rounded-xl transition-all"
                onClick={(e) => {
                  setIsOpen(false);
                  handleSmoothScroll("#home", e);
                }}
              >
                Home
              </Link>

              {/* Group: Tentang Kami */}
              <div className="py-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-light/50 px-4">Tentang Kami</span>
                <div className="flex flex-col gap-1 mt-1 pl-2">
                  <Link
                    href="#about"
                    className="text-base font-medium text-light/80 hover:text-secondary hover:bg-white/10 py-2 px-4 rounded-xl transition-all"
                    onClick={(e) => {
                      setIsOpen(false);
                      handleSmoothScroll("#about", e);
                    }}
                  >
                    About Us
                  </Link>
                  <Link
                    href="#team"
                    className="text-base font-medium text-light/80 hover:text-secondary hover:bg-white/10 py-2 px-4 rounded-xl transition-all"
                    onClick={(e) => {
                      setIsOpen(false);
                      handleSmoothScroll("#team", e);
                    }}
                  >
                    Our Team
                  </Link>
                  <Link
                    href="#partners"
                    className="text-base font-medium text-light/80 hover:text-secondary hover:bg-white/10 py-2 px-4 rounded-xl transition-all"
                    onClick={(e) => {
                      setIsOpen(false);
                      handleSmoothScroll("#partners", e);
                    }}
                  >
                    Partners
                  </Link>
                </div>
              </div>

              {/* Programs */}
              <Link
                href="#programs"
                className="text-base font-medium text-light/90 hover:text-secondary hover:bg-white/10 py-2.5 px-4 rounded-xl transition-all"
                onClick={(e) => {
                  setIsOpen(false);
                  handleSmoothScroll("#programs", e);
                }}
              >
                Programs
              </Link>

              {/* Group: Informasi */}
              <div className="py-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-light/50 px-4">Informasi</span>
                <div className="flex flex-col gap-1 mt-1 pl-2">
                  <Link
                    href="#updates"
                    className="text-base font-medium text-light/80 hover:text-secondary hover:bg-white/10 py-2 px-4 rounded-xl transition-all"
                    onClick={(e) => {
                      setIsOpen(false);
                      handleSmoothScroll("#updates", e);
                    }}
                  >
                    Updates
                  </Link>
                  <Link
                    href="#contact"
                    className="text-base font-medium text-light/80 hover:text-secondary hover:bg-white/10 py-2 px-4 rounded-xl transition-all"
                    onClick={(e) => {
                      setIsOpen(false);
                      handleSmoothScroll("#contact", e);
                    }}
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Verifikasi Sertifikat */}
              <Link
                href="/verify-certificate"
                className="text-base font-medium text-light/90 hover:text-secondary hover:bg-white/10 py-2.5 px-4 rounded-xl transition-all"
                onClick={() => setIsOpen(false)}
              >
                Verifikasi Sertifikat
              </Link>

              {/* Sign In */}
              <div className="border-t border-white/10 mt-2 pt-2">
                <Link
                  href="/login"
                  className="block text-base font-medium text-light hover:bg-white/10 py-3 px-4 rounded-xl transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {CONTENT.nav.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
