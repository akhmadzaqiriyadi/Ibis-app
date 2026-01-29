"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { CONTENT } from "@/constants/content";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-slate-900">
              {CONTENT.nav.logo}
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              {CONTENT.nav.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href.startsWith("#")) {
                      e.preventDefault();
                      const target = document.querySelector(link.href);
                      if (target) {
                        target.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  }}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Button asChild size="sm">
                <Link href="/auth/login">{CONTENT.nav.cta}</Link>
              </Button>
            </div>

            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <Container className="py-4 flex flex-col gap-4">
            {CONTENT.nav.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-base font-medium text-slate-600 hover:text-blue-600"
                onClick={(e) => {
                  setIsOpen(false);
                  if (link.href.startsWith("#")) {
                    e.preventDefault();
                    const target = document.querySelector(link.href);
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <Button asChild className="w-full">
                <Link href="/auth/login">{CONTENT.nav.cta}</Link>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
};
