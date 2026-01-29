"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTENT } from "@/constants/content";
import { Mail, MapPin, Send } from "lucide-react";

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-slate-50">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Contact Info Side */}
          <div>
            <Badge className="mb-4">Contact Us</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
              Hubungi Kami
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Punya pertanyaan seputar inkubasi bisnis atau program kami? Jangan ragu untuk menghubungi kami.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Alamat</h4>
                  <p className="text-slate-600 mt-1">{CONTENT.contact.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Email</h4>
                  <a href={`mailto:${CONTENT.contact.email}`} className="text-slate-600 mt-1 hover:text-blue-600 transition-colors">
                    {CONTENT.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Side */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Kirim Pesan</h3>
            <form 
              action={`mailto:${CONTENT.contact.email}`} 
              method="post" 
              encType="text/plain"
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700">Nama</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    placeholder="Nama Anda"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    placeholder="email@anda.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-slate-700">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  required
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  placeholder="Subject pesan..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-slate-700">Pesan</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={4}
                  required
                  className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                  placeholder="Tulis pesan Anda disini..."
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <Send className="h-4 w-4" />
                Kirim Email
              </Button>
            </form>
          </div>
          
        </div>
      </Container>
    </section>
  );
};
