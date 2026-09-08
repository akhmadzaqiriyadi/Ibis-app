"use client";

import { Container } from "@/components/ui/container";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { CONTENT } from "@/constants/content";
import { usePrograms } from "@/hooks/usePrograms";

gsap.registerPlugin(ScrollTrigger);

const getProgramIcon = (type?: string, slug?: string) => {
  if (slug?.includes("inkubasi") || type === "INKUBASI" || type === "INCUBATION") return "/svgs/incube.svg";
  if (slug?.includes("konsultasi") || type === "KONSULTASI") return "/svgs/like-dislike.svg";
  if (slug?.includes("kredensial") || type === "KREDENSIAL") return "/svgs/vuesax.svg";
  return "/svgs/incube.svg";
};

export const ProgramsSection = () => {
  const containerRef = useRef(null);
  const { data: programsData } = usePrograms({ active: true });

  const displayPrograms =
    programsData && programsData.length > 0
      ? programsData.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          icon: getProgramIcon(p.type, p.slug),
          cta: p.ctaText || "Daftar Sekarang",
          href: p.ctaUrl || `/register?program=${p.slug}`,
        }))
      : CONTENT.programs;

  useGSAP(() => {
    // Simple, robust animation that guarantees visibility eventually
    gsap.from(".program-item", {
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
  }, { scope: containerRef, dependencies: [displayPrograms] });

  return (
    <section ref={containerRef} id="programs" className="pt-2 pb-24 relative">
      <Container className="relative z-10">
        {/* Header with Icon */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <h2 className="text-3xl md:text-4xl font-semibold text-dark">
              Program
            </h2>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Image */}
          <div className="relative align-center order-2 lg:order-1">
            <div className="relative w-full rounded-2xl overflow-hidden">
              <Image
                src="/images/assets/about-us-left.webp"
                alt="Tim IBIS UTY"
                width={800}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Right Column - Programs List */}
          <div className="space-y-12 order-1 lg:order-2">
            {displayPrograms.map((program) => (
              <div key={program.id} className="flex gap-4 items-start program-item">
                <div className="shrink-0">
                  <Image
                    src={program.icon}
                    alt={program.title}
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-dark mb-3">
                    {program.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    {program.description}
                  </p>
                  <a
                    href={program.href}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                  >
                    {program.cta}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-transform"
                    >
                      <path
                        d="M6 12L10 8L6 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
