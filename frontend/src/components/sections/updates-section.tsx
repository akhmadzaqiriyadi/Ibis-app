"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Instagram } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

gsap.registerPlugin(ScrollTrigger);

const events = [
  {
    date: "4-5 Desember 2025",
    title: "UTY Growpath Season 3",
    description: "GROWPATH EXPO SEASON 3 Siap memamerkan hasil akhir yuk datang ke Growpath Expo Season 3 yang akan di adakan di Kampus UTY 3 4-5 Desember 2025",
    image: "/images/assets/news-1.webp",
  },
  {
    date: "30 Januari 2026",
    title: "Sosialisasi P2MW 2026",
    description: (
      <>
        Halo Young Entrepreneur<br />
        Mau usahamu Tumbuh ya? Ingin tau? Ayo raih keinginan ingin dan mimpi! Temang, semua ada jalannya karena kesempatan itu harus di gapai dengan semangat!
      </>
    ),
    image: "/images/assets/news-2.png",
  },
  {
    date: "4-5 Desember 2025",
    title: "UTY Growpath Season 3",
    description: (
      <>
        GROWPATH EXPO SEASON 3<br />
        Siap memamerkan hasil akhir yuk?<br /> 
        Datang ke Growpath Expo Season 3 yang akan di adakan di Kampus UTY 3 4-5 Desember 2025
      </>
    ),
    image: "/images/assets/news-1.png",
  },
  {
    date: "30 Januari 2026",
    title: "Sosialisasi P2MW 2026",
    description: (
      <>
        Halo Young Entrepreneur<br />
        Mau usahamu Tumbuh ya? Ingin tau? Ayo raih keinginan ingin dan mimpi! Temang, semua ada jalannya karena kesempatan itu harus di gapai dengan semangat!
      </>
    ),
    image: "/images/assets/news-2.webp",
  },
];

const feedImages = [
  "/images/assets/feed-1.webp",
  "/images/assets/feed-2.webp",
  "/images/assets/feed-3.webp",
  "/images/assets/feed-4.webp",
];

export const UpdatesSection = () => {
  const containerRef = useRef(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useGSAP(() => {
    gsap.from(".event-card", {
      scrollTrigger: {
        trigger: ".events-section",
        start: "top bottom-=100",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });

    gsap.from(".instagram-section", {
      scrollTrigger: {
        trigger: ".instagram-section",
        start: "top bottom-=100",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="updates" className="py-24 px-12 bg-linear-4">
      <Container>
        {/* Event Terbaru Section */}
        <div className="events-section mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Event Terbaru
          </h2>

          {/* Event Cards Swiper */}
          <div className="mb-12 max-w-5xl lg:max-w-4xl mx-auto">
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              modules={[Navigation, Pagination]}
              spaceBetween={48}
              slidesPerView={1}
              loop={true}
              breakpoints={{
                768: {
                  slidesPerView: 2,
                },
              }}
              className="events-swiper"
            >
              {events.map((event, index) => (
                <SwiperSlide key={index}>
                  <div className="event-card bg-linear-2 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6">
                      <div className="text-xs font-semibold text-light/80 mb-3">{event.date}</div>
                      <div className="relative h-48 mb-4 rounded-xl overflow-hidden group cursor-pointer">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-light mb-3">
                        {event.title}
                      </h3>
                      <p className="text-sm font-light text-light/60 mb-4 line-clamp-3">
                        {event.description}
                      </p>
                      <a 
                        href={`/events/${index + 1}`}
                        className="group inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
                      >
                        <span>Lihat lebih lanjut</span>
                        <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                      </a>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-4 mb-16">
            {/* Left Arrow with Pulse */}
            <div className="relative">
              {/* Pulse Animation */}
              <div className="absolute inset-0 rounded-full bg-primary/60 animate-pulse-nav"></div>
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all z-10 cursor-pointer"
                aria-label="Previous event"
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
                aria-label="Next event"
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
        </div>

        {/* Instagram Section */}
        <div className="instagram-section">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-light mb-4">
              Kenal lebih dekat dengan IBISTEK
            </h2>
            <p className="text-light/70 max-w-2xl mx-auto">
              Kunjungi media sosial IBISTEK UTY untuk mendapatkan informasi terbaru
            </p>
          </div>

          {/* Instagram Profile Card */}
          <div className="w-full mx-auto bg-transparent overflow-hidden">
            {/* Profile Header */}
            <div className="p-8 md:p-4 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-4 ring-blue-100 shrink-0">
                  <Image
                    src="/images/logos/brand-raw.webp"
                    alt="IBISTEK UTY Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Profile Info */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-dark mb-2">
                    @ibistek.uty
                  </h3>
                  <div className="flex items-center gap-6 text-base text-dark/70">
                    <span>
                      <strong className="text-dark font-semibold">163</strong> Posts
                    </span>
                    <span>
                      <strong className="text-dark font-semibold">1.3k</strong> Followers
                    </span>
                  </div>
                </div>
              </div>
              
              {/* CTA Button */}
              <Link 
                href="https://instagram.com/ibistek.uty" 
                target="_blank"
                className="group inline-flex items-center gap-2 bg-linear-3 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>Ikuti di Instagram</span>
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Feed Grid */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-0">
              {feedImages.map((image, index) => (
                <Link
                  key={index}
                  href="https://instagram.com/ibistek.uty"
                  target="_blank"
                  className="relative aspect-square overflow-hidden group cursor-pointer"
                >
                  <Image
                    src={image}
                    alt={`Instagram feed ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </Link>
              ))}
            </div>

            {/* Social Links Footer */}
            <div className="p-8">
              <div className="flex flex-wrap items-center justify-center gap-8">
                <Link 
                  href="https://instagram.com/ibistek.uty" 
                  target="_blank"
                  className="group flex items-center gap-3 text-light transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-2 shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:scale-110 transition-all">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-dark">@ibistek.uty</span>
                </Link>
                
                <Link 
                  href="https://twitter.com/ibistek.uty" 
                  target="_blank"
                  className="group flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-2 shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:scale-110 transition-all">
                    <svg className="w-5 h-5 text-light" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-dark">@ibistek.uty</span>
                </Link>
                
                <Link 
                  href="https://youtube.com/@ibistekuty" 
                  target="_blank"
                  className="group flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-2 shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:scale-110 transition-all">
                    <svg className="w-5 h-5 text-light" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-dark">Ibistek UTY</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
