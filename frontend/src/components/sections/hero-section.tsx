"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CONTENT } from "@/constants/content";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const HeroSection = () => {
  const containerRef = useRef(null);
  
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.from(".hero-blob", {
      opacity: 0,
      scale: 0.5,
      duration: 1.5,
      stagger: 0.2,
      delay: 0.2
    })
    .from("h1", {
      y: 50,
      opacity: 0,
      duration: 1,
    }, "-=1")
    .from("p", {
      y: 30,
      opacity: 0,
      duration: 0.8,
    }, "-=0.6")
    .from(".hero-cta", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1
    }, "-=0.4");
    
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="home" className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
        {/* Background blobs or patterns could go here */}
        <div className="absolute inset-0 z-0 opacity-30">
             <div className="hero-blob absolute -top-24 -left-20 h-96 w-96 rounded-full bg-blue-200 blur-3xl" />
             <div className="hero-blob absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-purple-200 blur-3xl" />
        </div>

      <Container className="relative z-10 text-center">
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          {CONTENT.hero.headline}
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          {CONTENT.hero.subheadline}
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" className="hero-cta rounded-full">
            <Link href="#programs">
              {CONTENT.hero.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="hero-cta rounded-full">
             <Link href="#about">Learn More</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
};
