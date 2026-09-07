'use client';

import { useParams } from 'next/navigation';
import { useEventBySlug } from '@/hooks/useEvents';
import { Container } from '@/components/ui/container';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ArrowLeft, Loader2, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';

export default function DynamicEventDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const { data: eventResponse, isLoading, isError } = useEventBySlug(slug);
  const event = (eventResponse as any)?.data || eventResponse;

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[35vh] md:h-[40vh] w-full overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <Container>
          <div className="text-center max-w-3xl mx-auto relative z-10 space-y-2">
            <Badge className="bg-white/20 text-white backdrop-blur-md border-0 text-xs uppercase tracking-wider">
              Agenda &amp; Event
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Detail Event
            </h1>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <main className="bg-slate-50 py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <div className="mb-6">
              <Link href="/event">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Daftar Event
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-2xl border border-gray-200">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-500">Memuat detail event...</p>
              </div>
            ) : isError || !event ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-800">Event Tidak Ditemukan</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Event dengan tautan &quot;{slug}&quot; mungkin sudah berakhir atau belum dipublikasikan.
                </p>
                <Link href="/event">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    Lihat Event Lainnya
                  </Button>
                </Link>
              </div>
            ) : (
              <article className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-10 space-y-8">
                {/* Event Title & Meta */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800 border-0 text-xs font-semibold">
                      {event.category || 'General'}
                    </Badge>
                    <Badge
                      className={
                        event.status === 'UPCOMING'
                          ? 'bg-emerald-100 text-emerald-800 border-0 text-xs'
                          : 'bg-gray-100 text-gray-700 border-0 text-xs'
                      }
                    >
                      {event.status}
                    </Badge>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                    {event.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        {new Date(event.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{event.location || 'Online'}</span>
                    </div>

                    {event.maxParticipants && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Kuota: {event.maxParticipants} Orang</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Featured Image */}
                {event.image && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Event Description */}
                <div className="space-y-4 pt-2">
                  <h2 className="text-lg font-bold text-gray-900">Tentang Event Ini</h2>
                  <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                    {event.description}
                  </div>
                </div>

                {/* Registration CTA */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50/50 p-6 rounded-xl border">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Tertarik Mengikuti Event Ini?</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Daftarkan diri Anda sekarang sebelum batas kuota peserta terpenuhi.
                    </p>
                  </div>

                  {event.registrationUrl ? (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                        Daftar Sekarang
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  ) : (
                    <Button disabled className="w-full sm:w-auto text-xs bg-gray-200 text-gray-500">
                      Pendaftaran Ditutup
                    </Button>
                  )}
                </div>
              </article>
            )}
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}
