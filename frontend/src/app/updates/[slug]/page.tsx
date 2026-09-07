'use client';

import { useParams } from 'next/navigation';
import { useUpdateBySlug } from '@/hooks/useUpdates';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, Loader2, Newspaper, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function UpdateDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const { data: updateResponse, isLoading, isError } = useUpdateBySlug(slug);
  const article = (updateResponse as any)?.data || updateResponse;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-12 sm:py-20">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Back button */}
            <Link href="/#updates">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                <p className="text-sm text-gray-500">Memuat artikel...</p>
              </div>
            ) : isError || !article ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200 p-8 space-y-3">
                <Newspaper className="w-12 h-12 text-gray-400 mx-auto" />
                <h2 className="text-xl font-bold text-gray-800">Artikel Tidak Ditemukan</h2>
                <p className="text-sm text-gray-500">
                  Artikel dengan tautan &quot;{slug}&quot; mungkin telah dihapus atau belum dipublikasikan.
                </p>
                <Link href="/">
                  <Button className="mt-2 bg-amber-600 hover:bg-amber-700 text-white text-xs">
                    Ke Halaman Utama
                  </Button>
                </Link>
              </div>
            ) : (
              <article className="space-y-6">
                {/* Header Meta */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-amber-100 text-amber-800 border-0 text-xs font-semibold">
                      {article.category || 'Berita'}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(article.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    {article.title}
                  </h1>

                  <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                {/* Cover Image */}
                {article.image && (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Article Content */}
                <div className="pt-4 border-t border-gray-100 text-gray-800 text-base leading-relaxed space-y-4 whitespace-pre-line">
                  {article.content || article.summary}
                </div>

                {/* Article Footer */}
                <div className="pt-8 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>Inkubator Bisnis dan Teknologi (IBISTEK) UTY</span>
                  </div>
                  <Link href="/#updates" className="text-amber-600 hover:underline font-medium">
                    Lihat Berita Lainnya &rarr;
                  </Link>
                </div>
              </article>
            )}
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
