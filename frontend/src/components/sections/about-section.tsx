import { CONTENT } from "@/constants/content";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { User, Check } from "lucide-react";
import Image from "next/image";

export const AboutSection = () => {
  return (
    <section id="about" className="pt-24 pb-0 relative">{/* removed: overflow-hidden bg-light */}
      {/* Decorative Blur Elements */}
      <div className="absolute -top-50 -left-50 w-96 h-96 pointer-events-none">
        <Image
          src="/images/assets/yellow-blur.png"
          alt=""
          width={384}
          height={384}
          className="w-full h-full object-contain opacity-60"
        />
      </div>

      <Container className="relative z-10">
        {/* Main Content Section */}
        <div className="mb-32">
          {/* Header with Icon */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              {/* <div className="flex gap-1">
                <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
              </div> */}
              <h2 className="text-3xl md:text-4xl font-semibold text-dark">
                Tentang Kami
              </h2>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-10">
              {/* Vision */}
              <div>
                <h3 className="text-2xl font-semibold text-dark mb-4">
                  Visi Kami
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {CONTENT.about.vision}
                </p>
              </div>

              {/* Mission */}
              <div>
                <h3 className="text-2xl font-semibold text-dark mb-6">
                  Misi Kami
                </h3>
                <div className="space-y-4">
                  {CONTENT.about.mission.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="shrink-0 mt-1">
                        <div className="flex h-8 w-8 items-center justify-center text-primary">
                          <Check className="h-6 w-6" strokeWidth={3} />
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative">
              <div className="relative w-full rounded-2xl overflow-hidden">
                <Image
                  src="/images/assets/about-us-right2.webp"
                  alt="Tim IBIS UTY"
                  width={800}
                  height={600}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
      </Container>
    </section>
  );
};
