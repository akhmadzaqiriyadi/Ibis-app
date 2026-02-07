"use client";

import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/layout/navbar";
import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";
import { CONTENT } from "@/constants/content";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { useState } from "react";

export default function OurTeamPage() {
  // Get unique batches from members
  const batches = Array.from(
    new Set(CONTENT.team.allMembers.map((member) => member.batch))
  ).sort((a, b) => a - b);

  // Set default to first batch
  const [selectedBatch, setSelectedBatch] = useState<number>(batches[2] || 3);

  // Filter members based on selected batch
  const filteredMembers = CONTENT.team.allMembers.filter(
    (member) => member.batch === selectedBatch
  );

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Background Image - Full Height */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/assets/our-team-bg.webp"
            alt="Our Team Hero"
            fill
            className="object-cover object-right md:object-center"
            priority
          />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center px-4">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
                <span className="text-secondary">Mulailah</span> rintis startup kamu{" "}
                <br className="hidden sm:block" />
                bersama <span className="text-secondary">mentor expert</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-light/90 mb-2">
                Inkubasi Bisnis & Teknologi
              </p>
              <p className="text-sm sm:text-base text-light/80 mb-6 md:mb-8">
                Universitas Teknologi Yogyakarta
              </p>
              <Link
                href="/#programs"
                className="inline-block px-6 py-2.5 sm:px-8 sm:py-3 rounded-md bg-linear-1 text-dark text-sm sm:text-base font-semibold hover:scale-105 transition-all shadow-lg"
              >
                Gabung Sekarang →
              </Link>
            </div>
          </Container>
        </div>
      </section>

      {/* Main Content - bg-light */}
      <main className="bg-light">
        {/* Mentor Kami Section */}
        <section className="py-24 relative overflow-hidden">
          {/* Yellow Blur Background */}
          <div className="absolute -left-[98%] -top-[35%] lg:-right-[10%] lg:-top-[45%] w-[600px] h-[600px]">
            <Image
              src="/images/assets/yellow-blur.webp"
              alt="Yellow Blur"
              fill
              className="object-contain"
            />
          </div>

          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
                Mentor Kami
              </h2>
            </div>

            {/* Mentors Grid - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto relative z-10">
              {CONTENT.team.mentors.map((mentor, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  {/* Photo with Yellow Accent */}
                  <div className="relative mb-6">
                    <div className="relative w-56 h-56 rounded-full overflow-hidden bg-linear-2 shadow-2xl hover:scale-105 transition-all">
                      <Image
                        src={mentor.image}
                        alt={mentor.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <p className="text-lg font-semibold text-secondary mb-1 text-center">
                    {mentor.title}
                  </p>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-dark mb-2">
                    {mentor.name}
                  </h3>

                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Anggota Tim Kami Section */}
        <section className="py-24 relative overflow-x-clip">
          {/* Blue Blur Background */}
          <div className="hidden md:absolute -left-[30%] -top-[16%] w-[600px] h-[600px]">
            <Image
              src="/images/assets/blue-blur.webp"
              alt="Blue Blur"
              fill
              className="object-contain"
            />
          </div>

          <Container>
            {/* Section Header */}
            <div className="text-center mb-12 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
                Anggota Tim Kami
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto mb-8">
                {CONTENT.team.description}
              </p>

              {/* Batch Filter Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Batch Buttons */}
                {batches.map((batch) => (
                  <button
                    key={batch}
                    onClick={() => setSelectedBatch(batch)}
                    className={`px-6 py-2 rounded-md cursor-pointer font-medium transition-all ${
                      selectedBatch === batch
                        ? "bg-linear-3 text-white shadow-lg scale-105"
                        : "bg-white text-dark border-2 border-slate-200 hover:border-primary hover:text-primary"
                    }`}
                  >
                    Batch {batch}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="relative z-10">
              <div className="flex flex-wrap justify-center gap-8">
                {filteredMembers.map((member, index) => (
                  <div
                    key={index}
                    className="group bg-light rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-slate-100 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
                  >
                  {/* Photo with Yellow Accent */}
                  <div className="relative mb-6">
                    <div className="relative w-full aspect-square rounded-full overflow-hidden bg-linear-2">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                   {/* Division */}
                  <p className="text-sm font-semibold text-secondary mb-1 text-center">
                    {member.division}
                  </p>

                  {/* Name */}
                  <h3 className="text-base font-bold text-dark mb-1 text-center">
                    {member.name}
                  </h3>

                 

                  {/* Prodi */}
                  <p className="text-sm text-slate-600 mb-4 text-center">
                    {member.prodi}
                  </p>

                  {/* Social Media Icons */}
                  <div className="flex gap-2 justify-center">
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-light hover:scale-110 transition-all"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-light hover:scale-110 transition-all"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}
