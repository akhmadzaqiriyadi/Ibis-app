"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { CONTENT } from "@/constants/content";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export const UpdatesSection = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(".update-card", {
      scrollTrigger: {
        trigger: ".updates-grid",
        start: "top bottom-=100",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out"
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="updates" className="py-24 bg-white">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Badge variant="secondary" className="mb-4">Live Updates</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Kegiatan & Informasi Terbaru
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="#">
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Updates Grid */}
        <div className="updates-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {CONTENT.updates.map((update, index) => (
             <div key={index} className="update-card group flex flex-col rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
               <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-300">
                  <Newspaper className="h-12 w-12" />
               </div>
               <div className="p-5 flex-1 flex flex-col">
                 <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                   <Calendar className="h-3 w-3" />
                   {update.date}
                 </div>
                 <h4 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                   {update.title}
                 </h4>
                 <p className="text-sm text-slate-600 line-clamp-3">
                    {update.summary}
                 </p>
               </div>
             </div>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center pt-12 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-8">
            Didukung Oleh Ekosistem Kami
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Just text placeholders for now as per brief */}
             {CONTENT.partners.internal.map((partner) => (
                <span key={partner} className="text-xl font-bold text-slate-400 hover:text-blue-600 cursor-default">
                  {partner}
                </span>
             ))}
             {CONTENT.partners.startups.map((startup) => (
                <span key={startup} className="text-xl font-bold text-slate-400 hover:text-green-600 cursor-default">
                  {startup}
                </span>
             ))}
          </div>
        </div>

      </Container>
    </section>
  );
};
