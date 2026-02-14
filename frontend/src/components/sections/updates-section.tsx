"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Instagram, Calendar, MapPin, Loader2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CONTENT } from "@/constants/content";
import { useEvents } from "@/hooks/useEvents";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

gsap.registerPlugin(ScrollTrigger);

export const UpdatesSection = () => {
  const containerRef = useRef(null);
  const swiperRef = useRef<SwiperType | null>(null);
  
  // Integration: Fetch real events
  const { data: eventsResponse, isLoading, error } = useEvents({ 
    limit: 6, 
    published: true,
    status: 'UPCOMING'
  });

  const events = eventsResponse?.data || [];

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
            {CONTENT.updates.title}
          </h2>

          {/* Event Cards Swiper */}
          <div className="mb-12 max-w-5xl lg:max-w-4xl mx-auto">
            {isLoading ? (
                <div className="flex justify-center items-center h-64 text-white">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" />
                    <span>Memuat event terbaru...</span>
                </div>
            ) : error ? (
                <div className="text-center text-white/60">
                    Gagal memuat event. Silakan coba lagi nanti.
                </div>
            ) : (
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
                {events.map((event, index) => {
                  // Helper function to truncate description to max 16 words
                  const truncateDescription = (text: string, maxWords: number = 16) => {
                    const words = text.split(' ');
                    if (words.length <= maxWords) return text;
                    return words.slice(0, maxWords).join(' ') + '...';
                  };

                  return (
                    <SwiperSlide key={event.id || index}>
                    <div className="event-card bg-linear-2 rounded-2xl overflow-hidden shadow-xl h-[520px] flex flex-col">
                        <div className="p-6 flex-1 flex flex-col">
                        <div className="text-xs font-semibold text-light/80 mb-3">
                            {new Date(event.date).toLocaleDateString('id-ID', { 
                                day: 'numeric', month: 'long', year: 'numeric' 
                            })}
                        </div>
                        <div className="relative h-48 mb-4 rounded-xl overflow-hidden group cursor-pointer shrink-0">
                            <Image
                                src={event.image || "/images/logos/brand-raw.webp"}
                                alt={event.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="text-xl font-semibold text-light mb-3 line-clamp-2">
                            {event.title}
                        </h3>
                        <p className="text-sm font-light text-light/60 mb-4 h-[60px] overflow-hidden">
                            {truncateDescription(event.description)}
                        </p>
                        {/* Date and Location */}
                        <div className="flex flex-col items-start gap-4 text-xs text-light/60 mb-4 mt-auto">
                            <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {new Date(event.date).toLocaleDateString('id-ID', { 
                                    day: 'numeric', month: 'short'
                                })}
                            </span>
                            </div>
                            <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location || 'Online'}</span>
                            </div>
                        </div>
                        <Link 
                            href={`/events/${event.slug}`} 
                            className="group inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors mt-auto"
                        >
                            <span>Lihat lebih lanjut</span>
                            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                        </Link>
                        </div>
                    </div>
                    </SwiperSlide>
                  );
                })}
                {!isLoading && events.length === 0 && (
                     <div className="text-center text-white/60 py-12">
                        Belum ada event terbaru saat ini.
                    </div>
                )}
                </Swiper>
            )}
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
            <Link href="/events" className="inline-block px-8 py-3 rounded-md bg-linear-3 text-light font-medium hover:scale-105 cursor-pointer transition-all">
              {CONTENT.updates.cta}
            </Link>
          </div>
        </div>

        {/* Instagram Section */}
        <div className="instagram-section">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-light mb-4">
              {CONTENT.updates.instagram.title}
            </h2>
            <p className="text-light/70 max-w-2xl mx-auto">
              {CONTENT.updates.instagram.description}
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
                    src={CONTENT.updates.instagram.logo}
                    alt="IBISTEK UTY Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Profile Info */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-dark mb-2">
                    {CONTENT.updates.instagram.handle}
                  </h3>
                  <div className="flex items-center gap-6 text-base text-dark/70">
                    <span>
                      <strong className="text-dark font-semibold">{CONTENT.updates.instagram.stats.posts}</strong> Posts
                    </span>
                    <span>
                      <strong className="text-dark font-semibold">{CONTENT.updates.instagram.stats.followers}</strong> Followers
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
              {CONTENT.updates.instagram.feedImages.map((image, index) => (
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
                {CONTENT.updates.instagram.socialLinks.map((social, index) => (
                  <Link 
                    key={index}
                    href={social.url} 
                    target="_blank"
                    className="group flex items-center gap-3 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-linear-2 shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:scale-110 transition-all">
                      {social.icon === 'instagram' && <Instagram className="w-5 h-5 text-light" />}
                      {social.icon === 'twitter' && (
                        <svg className="w-5 h-5 text-light" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      )}
                      {social.icon === 'youtube' && (
                        <svg className="w-5 h-5 text-light" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-dark">{social.handle}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
