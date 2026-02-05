"use client";

import { Container } from "@/components/ui/container";
import Image from "next/image";
import { Instagram, Linkedin, ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const TeamSection = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  // Team members data
  const members = [
    {
      division: "Public Relations",
      name: "Fransisca Laksmi",
      prodi: "Ilmu Komunikasi 2024",
      image: "/images/assets/member-2.webp",
      instagram: "#",
      linkedin: "#",
    },
    {
      division: "DVE",
      name: "Ayudya Priagus",
      prodi: "Perencanaan Wilayah dan Kota 2024",
      image: "/images/assets/member-1.webp",
      instagram: "#",
      linkedin: "#",
    },
    {
      division: "Social Media Management",
      name: "Adam Prasetya Deva",
      prodi: "Manajemen 2023",
      image: "/images/assets/member-3.webp",
      instagram: "#",
      linkedin: "#",
    },
    {
      division: "Web Developer",
      name: "Nehemia Hasbadhana",
      prodi: "Informatika 2023",
      image: "/images/assets/member-4.webp",
      instagram: "#",
      linkedin: "#",
    },
    {
      division: "Public Relations",
      name: "Fransisca Laksmi",
      prodi: "Ilmu Komunikasi 2024",
      image: "/images/assets/member-2.webp",
      instagram: "#",
      linkedin: "#",
    },
    {
      division: "DVE",
      name: "Ayudya Priagus",
      prodi: "Perencanaan Wilayah dan Kota 2024",
      image: "/images/assets/member-1.webp",
      instagram: "#",
      linkedin: "#",
    },
    {
      division: "Social Media Management",
      name: "Adam Prasetya Deva",
      prodi: "Manajemen 2023",
      image: "/images/assets/member-3.webp",
      instagram: "#",
      linkedin: "#",
    },
  ];

  return (
    <section id="team" className="relative">
      
      {/* Team Section with Blue Gradient */}
      <div className="py-24 bg-linear-4 relative overflow-hidden">
        <Container>
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                Team Kami
              </h2>
            </div>
          </div>

          {/* Team Members Slider */}
          <div className="mb-12">
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
              {members.map((member, index) => (
                <SwiperSlide key={index}>
                  <div className="flex flex-col items-center text-center">
                    {/* Photo with Yellow Accent */}
                    <div className="relative mb-6">
                      <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-xl bg-linear-2">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Division (in secondary color) */}
                    <p className="text-sm font-semibold text-secondary mb-2">
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
                        href={member.instagram}
                        className="w-8 h-8 rounded-full bg-linear-2 flex items-center justify-center text-light hover:scale-110 transition-all"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a
                        href={member.linkedin}
                        className="w-8 h-8 rounded-full bg-linear-2 flex items-center justify-center text-light hover:scale-110 transition-all"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
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
            <button className="px-8 py-3 rounded-md bg-linear-3 text-light font-medium hover:scale-105 cursor-pointer transition-all">
              Selengkapnya
            </button>
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
                Kerjasama IBISTEK
              </h2>
            </div>
            <p className="text-slate-700 max-w-2xl mx-auto">
              IBISTEK memiliki program kerjasama dengan beberapa komunitas dan startup
            </p>
          </div>

          {/* Partners Grid */}
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: 15 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-slate-100 w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-[calc(25%-1.125rem)] lg:w-[calc(20%-1.2rem)] max-w-[200px]"
              >
                <Image
                  src="/images/assets/partners-1.webp"
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
