"use client";

import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/layout/navbar";
import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";
import { CONTENT } from "@/constants/content";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { getSafeImageUrl, getAvatarFallback } from "@/lib/image-utils";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface TeamMember {
  id: string;
  name: string;
  title?: string;
  type: string;
  division?: string;
  image?: string;
  bio?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  batch?: number;
  prodi?: string;
  order: number;
  isActive: boolean;
}

export default function OurTeamPage() {
  const [mentors, setMentors] = useState<TeamMember[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [batches, setBatches] = useState<number[]>([1, 2, 3]);
  const [selectedBatch, setSelectedBatch] = useState<number>(3);

  // Fetch mentors (type = MENTOR or division = Pembina)
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch(`${API_URL}/team?active=true`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const mentorData = data.data.filter(
            (m: TeamMember) => m.type === 'MENTOR' || m.division === 'Pembina'
          );
          if (mentorData.length > 0) {
            const sortedMentors = mentorData.sort(
              (a: TeamMember, b: TeamMember) => (a.order || 0) - (b.order || 0)
            );
            setMentors(sortedMentors);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch mentors from API:", error);
      }

      // Fallback to CONTENT mentors
      if (CONTENT.team.mentors && CONTENT.team.mentors.length > 0) {
        setMentors(
          CONTENT.team.mentors.map((m, idx) => ({
            id: `static-mentor-${idx}`,
            name: m.name,
            title: m.title,
            type: 'MENTOR',
            division: 'Pembina',
            image: m.image,
            instagram: m.instagram,
            linkedin: m.linkedin,
            order: idx + 1,
            isActive: true,
          }))
        );
      }
    };
    fetchMentors();
  }, []);

  // Fetch all members to get batches
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${API_URL}/team?active=true`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Filter out Pembina/MENTOR division for member list
          const memberData = data.data.filter(
            (m: TeamMember) => m.division !== 'Pembina' && m.type !== 'MENTOR' && m.type !== 'LEADER'
          );
          
          // Get unique batches if available in DB
          const uniqueBatches = Array.from(
            new Set(memberData.map((m: TeamMember) => m.batch).filter(Boolean))
          ) as number[];

          if (memberData.length > 0 && uniqueBatches.length > 0) {
            uniqueBatches.sort((a, b) => a - b);
            setMembers(memberData);
            setBatches(uniqueBatches);
            setSelectedBatch(uniqueBatches[uniqueBatches.length - 1]);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch members from API:", error);
      }

      // Fallback to static allMembers from CONTENT
      if (CONTENT.team.allMembers && CONTENT.team.allMembers.length > 0) {
        const staticMembers: TeamMember[] = CONTENT.team.allMembers.map((m, idx) => ({
          id: `static-member-${idx}`,
          name: m.name,
          title: m.division,
          type: 'MEMBER',
          division: m.division,
          image: m.image,
          prodi: m.prodi,
          batch: m.batch,
          instagram: m.instagram,
          linkedin: m.linkedin,
          order: idx + 1,
          isActive: true,
        }));
        setMembers(staticMembers);
        const uniqueBatches = Array.from(
          new Set(staticMembers.map((m) => m.batch).filter(Boolean))
        ) as number[];
        uniqueBatches.sort((a, b) => a - b);
        setBatches(uniqueBatches.length > 0 ? uniqueBatches : [1, 2, 3]);
        if (uniqueBatches.length > 0) {
          setSelectedBatch(uniqueBatches[uniqueBatches.length - 1]);
        }
      }
    };
    fetchMembers();
  }, []);

  // Filter members based on selected batch
  const filteredMembers = members.filter((member) => member.batch === selectedBatch);

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
          <div className="absolute -right-[50%] -top-[12%] md:-right-[40%] md:-top-[40%] lg:-right-[20%] w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
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
              {mentors.length > 0 ? mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex flex-col items-center text-center"
                >
                  {/* Photo with Yellow Accent */}
                  <div className="relative mb-6">
                    <div className="relative w-56 h-56 rounded-full overflow-hidden bg-linear-2 shadow-2xl hover:scale-105 transition-all">
                      <Image
                        src={getSafeImageUrl(mentor.image, mentor.name)}
                        alt={mentor.name}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.src = getAvatarFallback(mentor.name);
                        }}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <p className="text-lg font-semibold text-secondary mb-1 text-center">
                    {mentor.title || '-'}
                  </p>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-dark mb-2">
                    {mentor.name}
                  </h3>

                </div>
              )) : (
                <div className="col-span-2 text-center text-slate-500 py-8">Loading mentors...</div>
              )}
            </div>
          </Container>
        </section>

        {/* Anggota Tim Kami Section */}
        <section className="py-24 relative overflow-x-clip">
          {/* Blue Blur Background */}
          <div className="absolute -left-[45%] -top-[5%] md:-left-[50%] md:-top-[8%] lg:-left-[25%] lg:-top-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
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
                {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="group bg-light rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-slate-100 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
                  >
                  {/* Photo with Yellow Accent */}
                  <div className="relative mb-6">
                    <div className="relative w-full aspect-square rounded-full overflow-hidden bg-linear-2">
                      <Image
                        src={getSafeImageUrl(member.image, member.name)}
                        alt={member.name}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.src = getAvatarFallback(member.name);
                        }}
                      />
                    </div>
                  </div>

                   {/* Division */}
                  <p className="text-sm font-semibold text-secondary mb-1 text-center">
                    {member.division || '-'}
                  </p>

                  {/* Name */}
                  <h3 className="text-base font-bold text-dark mb-1 text-center">
                    {member.name}
                  </h3>

                 

                  {/* Prodi */}
                  <p className="text-sm text-slate-600 mb-4 text-center">
                    {member.prodi || '-'}
                  </p>

                  {/* Social Media Icons */}
                  <div className="flex gap-2 justify-center">
                    {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-light hover:scale-110 transition-all"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                    )}
                    {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-light hover:scale-110 transition-all"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center text-slate-500 py-8 w-full">
                  {members.length === 0 ? 'Loading members...' : 'Tidak ada member untuk batch ini.'}
                </div>
              )}
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}
