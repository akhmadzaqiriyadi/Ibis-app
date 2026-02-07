"use client";

import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import { Calendar, MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CONTENT } from "@/constants/content";

export default function EventDetailPage() {
  const event = CONTENT.eventDetails;

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Gradient Background */}
      <section className="relative h-[35vh] md:h-[40vh] lg:h-[60vh] w-full overflow-hidden bg-linear-3">
        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center px-4">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Detail Event
              </h1>
            </div>
          </Container>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-light py-16">
        <Container>
          {/* Article Container */}
          <article className="max-w-4xl mx-auto">
            {/* Event Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-6 leading-tight">
              {event.title}
            </h1>

            {/* Event Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 mb-8 pb-8 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium">{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{event.location}</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative w-full aspect-video mb-12 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {event.content.map((block, index) => {
                if (block.type === "paragraph") {
                  return (
                    <p
                      key={index}
                      className="text-base md:text-lg text-slate-700 leading-relaxed mb-6 text-justify"
                    >
                      {block.text}
                    </p>
                  );
                }
                return null;
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between gap-4">
                {/* Previous Event Button */}
                <Link
                  href="/event"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-slate-100 text-dark font-semibold hover:bg-slate-200 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Event Sebelumnya</span>
                  <span className="sm:hidden">Sebelumnya</span>
                </Link>

                {/* Next Event Button */}
                <Link
                  href="/event"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-linear-3 text-white font-semibold hover:scale-105 transition-all shadow-lg"
                >
                  <span className="hidden sm:inline">Event Selanjutnya</span>
                  <span className="sm:hidden">Selanjutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </article>
        </Container>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
