"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CONTENT } from "@/constants/content";

export const ContactSection = () => {
  return (
    <section id="contact" className="relative py-24 bg-light overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4">
        {/* Title with decorative element */}
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl font-semibold text-dark inline-block relative">
            Hubungi Kami
            {/* Decorative yellow accent */}
            {/* <div className="absolute -top-6 -right-8 w-12 h-12">
              <div className="absolute top-0 right-0 w-8 h-1 bg-secondary rotate-45"></div>
              <div className="absolute top-2 right-2 w-6 h-1 bg-secondary rotate-45"></div>
            </div> */}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
          {/* Left Side - Contact Form */}
          <div className="order-2 lg:order-1">
            <form 
              action={`mailto:${CONTENT.contact.email}`} 
              method="post" 
              encType="text/plain"
              className="space-y-6"
            >
              {/* Name and Email Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required
                    className="w-full px-0 py-3 text-base text-dark bg-transparent border-0 border-b-2 border-dark/20 focus:border-primary focus:outline-none transition-colors placeholder:text-dark/40"
                    placeholder="Nama Lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required
                    className="w-full px-0 py-3 text-base text-dark bg-transparent border-0 border-b-2 border-dark/20 focus:border-primary focus:outline-none transition-colors placeholder:text-dark/40"
                    placeholder="Alamat Email"
                  />
                </div>
              </div>
              
              {/* Subject */}
              <div className="space-y-2">
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  required
                  className="w-full px-0 py-3 text-base text-dark bg-transparent border-0 border-b-2 border-dark/20 focus:border-primary focus:outline-none transition-colors placeholder:text-dark/40"
                  placeholder="Subjek"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <textarea 
                  id="message" 
                  name="message" 
                  rows={6}
                  required
                  className="w-full px-0 py-3 text-base text-dark bg-transparent border-0 border-b-2 border-dark/20 focus:border-primary focus:outline-none transition-colors placeholder:text-dark/40 resize-none"
                  placeholder="Pesan"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="px-8 py-6 text-base font-semibold bg-linear-3 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Kirim Pesan
                </Button>
              </div>
            </form>
          </div>

          {/* Right Side - Contact Info */}
          <div className="order-1 lg:order-2">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-dark mb-4">
                  Hubungi Lebih Lanjut
                </h3>
                <p className="text-dark/70 leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, distinctio ad. Laudantium veniam esse dicta animi obcaecati deserunt debitis.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
                    <Image 
                      src="/svgs/mail.svg" 
                      alt="Email Icon" 
                      width={32} 
                      height={32}
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-dark mb-1">Email</h4>
                    <a 
                      href={`mailto:${CONTENT.contact.email}`}
                      className="text-dark/70 hover:text-primary transition-colors"
                    >
                      {CONTENT.contact.email}
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
                    <Image 
                      src="/svgs/map.svg" 
                      alt="Map Icon" 
                      width={32} 
                      height={32}
                      className="w-7 h-7"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-dark mb-1">Basecamp IBISTEK UTY</h4>
                    <p className="text-dark/70 leading-relaxed">
                      {CONTENT.contact.address}
                    </p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
                    <Image 
                      src="/svgs/whatsapp.svg" 
                      alt="WhatsApp Icon" 
                      width={32} 
                      height={32}
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-dark mb-1">Whatsapp</h4>
                    <a 
                      href={`https://wa.me/${CONTENT.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark/70 hover:text-primary transition-colors"
                    >
                      {CONTENT.contact.whatsapp}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
