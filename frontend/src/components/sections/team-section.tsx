"use client";

import { Container } from "@/components/ui/container";
import Image from "next/image";
import { Instagram, Linkedin, ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useRef, useState, useEffect } from "react";
import type { Swiper as SwiperType } from "swiper";
import { CONTENT } from "@/constants/content";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const TeamSection = () => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
        const response = await fetch(`${API_URL}/team?active=true`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Sort by order if available, or just take them
          const sortedMembers = data.data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setMembers(sortedMembers);
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };

    fetchMembers();
  }, []);

  // Use static content as fallback or skeleton if needed, but for now just use fetched data
  // If no data yet, maybe show nothing or keep loading state. 
  // For better UX, let's just render the swiper if we have members, otherwise maybe empty.
  // Actually, if fetching, we might want to wait? or Swiper handles empty?
  
  const displayMembers = members.length > 0 ? members : []; 

  return (
    <section id="team" className="relative">
      
      {/* Team Section with Blue Gradient */}
      <div className="py-24 bg-linear-4 relative overflow-hidden">
        <Container>
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                {CONTENT.team.title}
              </h2>
            </div>
          </div>

          {/* Team Members Slider */}
          <div className="mb-12">
            {displayMembers.length > 0 ? (
              <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                modules={[Navigation, Pagination]}
                spaceBetween={32}
                slidesPerView={1}
                loop={true}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  1024: {
                    slidesPerView: 4,
                  },
                }}
                className="team-swiper"
              >
                {displayMembers.map((member, index) => (
                  <SwiperSlide key={member.id || index}>
                    <div className="flex flex-col items-center text-center">
                      {/* Photo with Yellow Accent */}
                      <div className="relative mb-6">
                        <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-xl bg-linear-2">
                          <Image
                            src={member.image || "https://placehold.co/400?text=No+Image"}
                            alt={member.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>

                      {/* Division (in secondary color) */}
                      <p className="text-sm font-semibold text-[#ffd600] mb-2">
                        {member.division}
                      </p>

                      {/* Name */}
                      <h3 className="text-lg font-semibold text-light mb-1">
                        {member.name}
                      </h3>

                      {/* Prodi */}
                      <p className="text-sm text-light mb-4">{member.prodi}</p>

                      {/* Social Media Icons */}
                      <div className="flex gap-3 pb-4">
                        <a
                          href={member.instagram || "#"}
                          className="w-8 h-8 rounded-full bg-linear-2 flex items-center justify-center text-light hover:scale-110 transition-all"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                        <a
                          href={member.linkedin || "#"}
                          className="w-8 h-8 rounded-full bg-linear-2 flex items-center justify-center text-light hover:scale-110 transition-all"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
                <div className="text-center text-white/60 py-10">
                   {/* Minimal placeholder to avoid layout shift or just empty */}
                   Loading...
                </div>
            )}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-4 mb-8">
            {/* Left Arrow with Pulse */}
            <div className="relative">
              {/* Pulse Animation */}
              <div className="absolute inset-0 rounded-full bg-primary/60 animate-pulse-nav"></div>
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all z-10 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Right Arrow with Pulse */}
            <div className="relative">
              {/* Pulse Animation */}
              <div className="absolute inset-0 rounded-full bg-primary/60 animate-pulse-nav"></div>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all z-10 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selengkapnya Button */}
          <div className="text-center">
            <Link 
              href="/our-team"
              className="inline-block px-8 py-3 rounded-md bg-linear-3 text-light font-medium hover:scale-105 cursor-pointer transition-all"
            >
              {CONTENT.team.cta}
            </Link>
          </div>
        </Container>
      </div>

      {/* Partners Section with Yellow Gradient */}
      <div id="partners" className="py-24 bg-light relative overflow-hidden">
        <Container>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <h2 className="text-3xl md:text-4xl font-semibold text-dark">
                {CONTENT.partners.title}
              </h2>
            </div>
            <p className="text-slate-700 max-w-2xl mx-auto">
              {CONTENT.partners.description}
            </p>
          </div>

          {/* Partners Grid */}
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: CONTENT.partners.count }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-slate-100 w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-[calc(25%-1.125rem)] lg:w-[calc(20%-1.2rem)] max-w-[200px]"
              >
                <Image
                  src={CONTENT.partners.logo}
                  alt="UTY Software House"
                  width={120}
                  height={60}
                  className="w-full h-auto object-contain"
                />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
};
