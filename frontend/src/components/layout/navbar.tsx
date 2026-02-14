"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
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
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={CONTENT.nav.image}
              alt="IBISTEK Logo"
              width={205}
              height={114}
              className="w-32 h-18 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {CONTENT.nav.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith("#")) {
                    e.preventDefault();
                    const target = document.querySelector(link.href);
                    if (target) {
                      // Special offset for programs section to show headline
                      if (link.href === "#programs") {
                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                        const offset = 120; // Offset to account for fixed navbar
                        window.scrollTo({
                          top: targetPosition - offset,
                          behavior: "smooth"
                        });
                      } else {
                        target.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  }
                }}
                className="text-lg font-medium text-light/90 transition-colors hover:text-secondary"
              >
                {link.label}
              </Link>
            ))}
            {/* Sign In - sebagai bagian dari nav links */}
            <Link
              href="/login"
              className="text-lg font-medium text-light/90 transition-colors hover:text-secondary"
            >
              {CONTENT.nav.cta}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-light"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile Menu - Floating Style */}
      {isOpen && (
        <div className="lg:hidden px-4 py-3">
          <div className="bg-primary/20 backdrop-blur-md rounded-lg shadow-lg border border-white/10">
            <div className="py-4 px-6 flex flex-col gap-2">
              {CONTENT.nav.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-base font-medium text-secondary/90 hover:text-secondary hover:bg-white/10 py-3 px-4 rounded-md transition-all"
                  onClick={(e) => {
                    setIsOpen(false);
                    if (link.href.startsWith("#")) {
                      e.preventDefault();
                      const target = document.querySelector(link.href);
                      if (target) {
                        // Special offset for programs section to show headline
                        if (link.href === "#programs") {
                          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                          const offset = 120; // Offset to account for fixed navbar
                          window.scrollTo({
                            top: targetPosition - offset,
                            behavior: "smooth"
                          });
                        } else {
                          target.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-light/20 mt-2 pt-2">
                <Link
                  href="/auth/login"
                  className="block text-base font-medium text-light hover:bg-white/10 py-3 px-4 rounded-md transition-all"
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
