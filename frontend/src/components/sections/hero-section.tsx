"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronsDown } from "lucide-react";
import { CONTENT } from "@/constants/content";
import { Container } from "@/components/ui/container";
import { useRef, Suspense, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { LogoModel } from "@/components/3d/logo-model";
import Marquee from "react-fast-marquee";

export const HeroSection = () => {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", {
        y: -20,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
      })
        .from(
          ".hero-title-line",
          {
            y: 60,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
          },
          "-=0.4"
        )
        .from(
          ".hero-description",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.4"
        )
        .from(
          ".hero-cta",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            clearProps: "y,opacity"
          },
          "-=0.4"
        )
        .from(
          ".hero-scroll",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.2"
        )
        .from(
          ".hero-image",
          {
            x: 100,
            opacity: 0,
            duration: 1,
          },
          "-=1.5"
        );

      // Pulse ring animation - smooth and continuous
      gsap.to(".pulse-ring", {
        scale: 2,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 2,
        transformOrigin: "center center"
      });
    },
    { scope: containerRef }
  );

  const scrollToAbout = () => {
    const target = document.querySelector("#about");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative bg-linear-3 min-h-screen overflow-hidden"
    >

      <Container className="relative z-10 pt-32 pb-20 lg:pt-36 lg:pb-0">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-160px)]">
          {/* 3D Logo - Shown first on mobile, second on desktop */}
          <div className="hero-image flex items-center justify-center order-1 lg:order-2">
            {/* Animated Pulse Effect */}
            <div className="relative">
              {/* Single pulse ring - appears every 3 seconds */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="pulse-ring absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-blue-500/30" />
              </div>
              
              {/* Center content with 3D Logo */}
              <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center">
                <Canvas
                  camera={{ position: [0, 0, 5], fov: 50 }}
                  className="w-full h-full"
                >
                  {/* Enhanced lighting for bright gold appearance */}
                  <ambientLight intensity={1.5} />
                  <directionalLight position={[10, 10, 5]} intensity={2} />
                  <directionalLight position={[-10, -10, -5]} intensity={1} />
                  <pointLight position={[0, 5, 0]} intensity={1.5} color="#ffffff" />
                  <spotLight position={[5, 5, 5]} intensity={2} angle={0.3} penumbra={1} />
                  
                  {/* Environment for realistic reflections */}
                  <Environment preset="studio" />
                  
                  <Suspense fallback={null}>
                    <LogoModel />
                  </Suspense>
                </Canvas>
              </div>
            </div>
          </div>

          {/* Text Content - Centered on mobile, left-aligned on desktop */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
            {/* Badge with Marquee Effect */}
            <Link
              href="#programs"
              className="hero-badge group relative inline-flex items-center overflow-hidden px-5 py-2.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white text-sm font-medium w-fit max-w-xs mb-4 hover:bg-white/20 transition-colors"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Left Gradient Fade Overlay */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-light/40 via-primary/20 to-transparent z-10 pointer-events-none rounded-l-full" />
              
              {/* Right Gradient Fade Overlay */}
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-light/40 via-primary/20 to-transparent z-10 pointer-events-none rounded-r-full" />
              
              {/* Scrolling Text with react-fast-marquee */}
              <Marquee
                speed={30}
                gradient={false}
                play={!isPaused}
                className="flex items-center gap-2"
              >
                <span className="mx-2">KONSULTASIKAN BISNISMU</span>
                <span className="text-white/60 mx-2">•</span>
                <span className="mx-2">KONSULTASIKAN BISNISMU</span>
                <span className="text-white/60 mx-2">•</span>
                <span className="mx-2">KONSULTASIKAN BISNISMU</span>
                <span className="text-white/60 mx-2">•</span>
              </Marquee>
              
              {/* Arrow - Above gradient overlay */}
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute right-3 z-20" />
            </Link>

            {/* Headlines */}
            <h1 className="hero-title-line text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              <span className="text-yellow-400">Mewujudkan</span> Inovasi{" "}
              <span className="text-yellow-400">Mengakselerasi</span> Bisnis{" "}
              <span className="text-yellow-400">Menciptakan</span> Dampak
            </h1>

            {/* Description */}
            <p className="hero-description text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mb-6 px-4 lg:px-0">
              {CONTENT.hero.subheadline}
            </p>

            {/* CTA Button */}
            <Link
              href="#about"
              className="hero-cta inline-flex items-center justify-center px-8 py-3 bg-linear-1 text-light font-semibold rounded-md transition-all duration-300 w-fit hover:brightness-105 hover:shadow-lg"
            >
              Tak Kenal Maka Tak Sayang
            </Link>

            {/* Scroll Indicator */}
            <button
              onClick={scrollToAbout}
              className="hero-scroll mt-16 lg:mt-8 flex flex-col items-center text-white/60 hover:text-white transition-colors w-fit"
            >
              <ChevronsDown className="w-8 h-8 animate-bounce" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};
