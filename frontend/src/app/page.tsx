import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ProgramsSection } from "@/components/sections/programs-section";
import { UpdatesSection } from "@/components/sections/updates-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProgramsSection />
        <UpdatesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

