"use client";

import { CONTENT } from "@/constants/content";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ProgramCard } from "@/components/molecules/program-card";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export const ProgramsSection = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Simple, robust animation that guarantees visibility eventually
    gsap.from(".program-card", {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 90%", // Trigger as soon as section enters view
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
      clearProps: "all" // Wipes inline styles after animation to prevents stuck states
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="programs" className="py-24 bg-slate-50">
      <Container>
        <div className="text-center mb-16">
           <Badge className="mb-4">Services</Badge>
           <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Program Inkubasi & Layanan
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Bergabunglah dengan ekosistem kami untuk mengembangkan potensi bisnis Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CONTENT.programs.map((program) => (
            <ProgramCard
              key={program.id}
              title={program.title}
              description={program.description}
              cta={program.cta}
              href={program.href}
              requiresAuth={program.requiresAuth}
              className="program-card"
            />
          ))}
        </div>
      </Container>
    </section>
  );
};
