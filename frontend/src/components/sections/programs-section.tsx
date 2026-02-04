"use client";

import { Container } from "@/components/ui/container";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export const ProgramsSection = () => {
  const containerRef = useRef(null);

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
  }, { scope: containerRef });

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
                src="/images/assets/about-us-left2.webp"
                alt="Tim IBIS UTY"
                width={800}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Right Column - Programs List */}
          <div className="space-y-12 order-1 lg:order-2">
            {/* Inkubasi Bisnis */}
            <div className="flex gap-4 items-start program-item">
              <div className="shrink-0">
                <Image
                  src="/svgs/incube.svg"
                  alt="Inkubasi Bisnis"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-dark mb-3">
                  Inkubasi bisnis
                </h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Inkubasi bisnis adalah program pembinaan, pendampingan, dan pengembangan terstruktur bagi usaha rintisan. Program inkubasi bisnis di IBISTEK UTY diselenggarakan secara periodik bagi sejumlah unit bisnis yang terpilih untuk diinkubasi.
                </p>
                <a
                  href="/auth/register?program=inkubasi"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  Daftar Sekarang
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

            {/* Konsultasi Bisnis */}
            <div className="flex gap-4 items-start program-item">
              <div className="shrink-0">
                <Image
                  src="/svgs/like-dislike.svg"
                  alt="Konsultasi Bisnis"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-dark mb-3">
                  Konsultasi bisnis
                </h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Konsultasi bisnis adalah layanan konsultasi dengan mentor atau praktisi untuk menyelesaikan problem-problem yang dihadapi pelaku bisnis secara gratis. Pendaftar dapat mengajukan layanan konsultasi bisnis ke IBISTEK UTY. Selanjutnya akan dijadwalkan waktu untuk berkonsultasi langsung dengan mentor atau praktisi yang sesuai. Ayo konsultasikan problem bisnismu.
                </p>
                <a
                  href="/auth/register?program=konsultasi"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  Daftar Sekarang
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

            {/* Kredensial Mikro */}
            <div className="flex gap-4 items-start program-item">
              <div className="shrink-0">
                <Image
                  src="/svgs/vuesax.svg"
                  alt="Kredensial Mikro"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-dark mb-3">
                  Kredensial Mikro
                </h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Kredensial Mikro adalah program pelatihan dan sertifikasi jangka pendek yang dirancang untuk meningkatkan pengetahuan dan keterampilan berwirausaha secara cepat, relevan dengan kebutuhan dunia usaha, dan diakui secara formal.
                </p>
                <a
                  href="/auth/register?program=kredensial"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  Daftar Sekarang
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
          </div>
        </div>
      </Container>
    </section>
  );
};
