"use client";

import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import { CONTENT } from "@/constants/content";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";

export default function EventPage() {
  // Integration: Fetch upcoming events (top section)
  const { data: upcomingResponse, isLoading: isLoadingUpcoming, error: errorUpcoming } = useEvents({ 
    limit: 2,
    published: true,
    status: 'UPCOMING'
  });
  
  // Integration: Fetch all published events for Recent Events section
  const { data: eventsResponse, isLoading, error } = useEvents({ 
    limit: 9,
    published: true,
  });

  const upcomingEvents = upcomingResponse?.data || [];
  const recentEvents = eventsResponse?.data || [];

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Background Image */}
      <section className="relative h-[100vh] w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/assets/event-hero.webp"
            alt="Event Hero"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/40 to-dark/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center px-4">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                Wujudkan ide brilian melalui{" "}
                <br className="hidden sm:block" />
                peluang kolaborasi yang nyata
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-light/90 mb-2">
                Inkubasi Bisnis & Teknologi
              </p>
              <p className="text-sm sm:text-base text-light/80 mb-6 md:mb-8">
                Universitas Teknologi Yogyakarta
              </p>
              <a
                href="#upcoming-events"
                className="inline-block px-6 py-2.5 sm:px-8 sm:py-3 rounded-md bg-linear-1 text-dark text-sm sm:text-base font-semibold hover:scale-105 transition-all shadow-lg"
              >
                Jelajahi Event Kami →
              </a>
            </div>
          </Container>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-light">
        {/* Upcoming Events Section */}
        <section id="upcoming-events" className="py-24 relative overflow-hidden">
          {/* Yellow Blur Background */}
          <div className="absolute -right-[50%] -top-[12%] md:-right-[45%] md:-top-[30%] lg:-right-[20%] lg:-top-[30%] w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
            <Image
              src="/images/assets/yellow-blur.webp"
              alt="Yellow Blur"
              fill
              className="object-contain"
            />
          </div>

          <Container>
            <div className="text-center mb-16 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
                Acara yang akan datang
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Temukan berbagai acara menarik yang akan segera diselenggarakan oleh IBISTEK UTY
              </p>
            </div>

            {/* Upcoming Events Grid */}
            {isLoadingUpcoming ? (
              <div className="flex justify-center items-center h-64 text-dark relative z-10">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Memuat event yang akan datang...</span>
              </div>
            ) : errorUpcoming ? (
              <div className="text-center text-dark relative z-10">
                Gagal memuat event. Silakan coba lagi nanti.
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center text-dark relative z-10">
                Belum ada event yang akan datang.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto relative z-10">
                {upcomingEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="group bg-linear-2 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="p-6">
                      {/* Date */}
                      <div className="text-xs font-semibold text-light/80 mb-3">
                        {formatDate(event.date)}
                      </div>
                      
                      {/* Event Image */}
                      <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                        {event.image && event.image.trim() !== '' ? (
                          <Image
                            src={event.image!}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <Image
                            src="/images/logos/brand-raw.webp"
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-light mb-3">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm font-light text-light/60 mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      {/* Date and Location */}
                      <div className="flex items-center gap-4 text-xs text-light/60 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Link */}
                      <Link
                        href={`/event/${event.slug}`}
                        className="group/link inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
                      >
                        <span>Lihat lebih lanjut</span>
                        <span className="inline-block transition-transform group-hover/link:translate-x-1">→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* Recent Events Section */}
        <section className="py-24 relative overflow-x-clip bg-gradient-to-b from-light to-slate-50">
          {/* Blue Blur Background */}
          <div className="absolute -left-[45%] -top-[2%] md:-left-[45%] md:-top-[8%] lg:-left-[25%] lg:-top-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
            <Image
              src="/images/assets/blue-blur.webp"
              alt="Blue Blur"
              fill
              className="object-contain"
            />
          </div>

          <Container>
            <div className="text-center mb-16 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
                Acara terbaru
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Temuan berbagai acara menarik yang pernah diselenggarakan oleh IBISTEK UTY dan jangan lupa ikuti acara kamu berikutnya ya!
              </p>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-dark relative z-10">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Memuat event terbaru...</span>
              </div>
            ) : error ? (
              <div className="text-center text-slate-600 relative z-10">
                Gagal memuat event. Silakan coba lagi nanti.
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="text-center text-slate-600 relative z-10">
                Belum ada event yang tersedia.
              </div>
            ) : (
              /* Recent Events Grid - 3 columns */
              <div className="flex flex-wrap justify-center gap-8 relative z-10">
                {recentEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="group bg-linear-2 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
                  >
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden">
                      {event.image && event.image.trim() !== '' ? (
                        <Image
                          src={event.image!}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <Image
                          src="/images/logos/brand-raw.webp"
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-5">
                      {/* Date */}
                      <p className="text-xs font-semibold text-secondary mb-2">
                        {formatDate(event.date)}
                      </p>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-light mb-2 line-clamp-2">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-light/60 mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Link */}
                      <Link
                        href={`/event/${event.slug}`}
                        className="group/link inline-flex items-center gap-2 text-secondary hover:text-secondary/80 font-semibold text-sm transition-colors"
                      >
                        <span>Selengkapnya</span>
                        <span className="inline-block transition-transform group-hover/link:translate-x-1">→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Container>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
