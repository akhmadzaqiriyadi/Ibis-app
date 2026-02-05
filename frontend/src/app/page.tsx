import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ProgramsSection } from "@/components/sections/programs-section";
import { TeamSection } from "@/components/sections/team-section";
import { UpdatesSection } from "@/components/sections/updates-section";
import { ContactSection } from "@/components/sections/contact-section";
import FAQSection from "@/components/sections/faq-section";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        {/* About & Programs Wrapper with Blue Blur */}
        <div className="relative bg-light overflow-hidden">
          {/* Blue Blur Effect - positioned between About and Programs */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-70 lg:-right-50 w-96 h-96 pointer-events-none z-0">
            <Image
              src="/images/assets/blue-blur.webp"
              alt="Blue Blur Effect"
              width={384}
              height={384}
              className="w-full h-full object-contain opacity-60"
            />
          </div>
          
          <AboutSection />
          <ProgramsSection />
        </div>
        <div className="relative bg-light overflow-hidden">
          {/* Yellow Blur Effect - positioned between Team and Partner*/}
          <div className="absolute top-1/2 -translate-y-1/2 -right-70 lg:-right-50 w-96 h-96 pointer-events-none z-10">
            <Image
              src="/images/assets/yellow-blur.webp"
              alt="Blue Blur Effect"
              width={384}
              height={384}
              className="w-full h-full object-contain opacity-60"
            />
          </div>
          <TeamSection />
        </div>
        <div className="relative bg-light overflow-hidden">
          {/* Yellow Blur Effect - positioned between Team and Partner*/}
          <div className="absolute top-[48%] -translate-y-1/2 -left-60 lg:-right-50 w-96 h-96 pointer-events-none z-10">
            <Image
              src="/images/assets/yellow-blur.webp"
              alt="Yellow Blur Effect"
              width={384}
              height={384}
              className="w-full h-full object-contain opacity-60"
            />
          </div>
          <UpdatesSection />
          <FAQSection />
          <div className="absolute bottom-[8%] -translate-y-1/2 -right-70 lg:-right-50 w-96 h-96 pointer-events-none z-10">
            <Image
              src="/images/assets/blue-blur.webp"
              alt="Yellow Blur Effect"
              width={384}
              height={384}
              className="w-full h-full object-contain opacity-60"
            />
          </div>
          <ContactSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}

