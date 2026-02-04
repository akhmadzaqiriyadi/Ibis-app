"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Bagaimana cara menjadi anggota IBISTEK?",
    answer:
      "Mendaftar pada google-form melalui website ini ataupun link.tree pada bio instagram resmi kami @ibistek.uty, lalu memilih divisi yang diinginkan. Jangan lupa daftar karena kuota terbatas dan hanya oprec beberapa kali se tahun.",
  },
  {
    question: "Di mana lokasi basecamp IBISTEK?",
    answer:
      "Basecamp IBISTEK berlokasi di Gedung Fakultas Sains dan Teknologi, Universitas Teknologi Yogyakarta. Kami biasanya berkumpul di ruang laboratorium komputer atau ruang organisasi mahasiswa.",
  },
  {
    question: "Kapan basecamp buka dan tutup?",
    answer:
      "Basecamp IBISTEK buka setiap hari Senin hingga Jumat pukul 08.00 - 17.00 WIB. Untuk hari Sabtu dan Minggu, basecamp buka sesuai dengan jadwal kegiatan atau event yang sedang berlangsung.",
  },
  {
    question:
      "Bagaimana cara mengikuti lomba, mencari anggota team, dan mencari dosen pembimbing?",
    answer:
      "Untuk mengikuti lomba, kamu bisa pantau informasi lomba yang kami share di media sosial. Jika butuh tim, kamu bisa bergabung dengan komunitas IBISTEK dan mencari partner di sana. Untuk dosen pembimbing, kami akan membantu menghubungkan dengan dosen yang sesuai dengan bidang lomba.",
  },
  {
    question:
      "Saya masih binggung dalam pengembangan karya saya, apa saya bisa melakukan konsultasi?",
    answer:
      "Tentu saja! IBISTEK menyediakan program mentoring dan konsultasi untuk anggota yang ingin mengembangkan karya atau project mereka. Kamu bisa menghubungi koordinator divisi terkait atau langsung datang ke basecamp untuk konsultasi.",
  },
  {
    question: "Bagaimana cara mengajukan dana riset?",
    answer:
      "Untuk mengajukan dana riset, kamu perlu menyiapkan proposal riset yang lengkap dan mengajukannya melalui sistem yang telah ditentukan oleh universitas. Tim IBISTEK dapat membantu dalam proses penyusunan proposal dan pengajuan dana riset.",
  },
  {
    question:
      "Jika saya pihak eksternal, bagaimana cara melakukan kolaborasi dengan Infinite?",
    answer:
      "Kami sangat terbuka untuk kolaborasi dengan pihak eksternal! Silakan hubungi kami melalui email resmi atau DM Instagram @ibistek.uty. Sampaikan proposal kolaborasi atau ide kerjasama yang ingin dilakukan, dan tim kami akan segera merespons.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 overflow-hidden bg-light">
      <div className="container mx-auto px-4">
        {/* Title - Centered */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark inline-block">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - FAQ Questions */}
          <div className="space-y-8">

            {/* FAQ Accordion */}
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                    openIndex === index
                      ? "bg-linear-3 shadow-lg"
                      : "bg-linear-2"
                  }`}
                >
                  {/* Question Button */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left transition-all duration-300 text-white hover:bg-opacity-90"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 bg-white bg-opacity-20 text-dark"
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${
                            openIndex === index ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {/* Question Text */}
                      <span className="font-semibold text-base md:text-lg">
                        {faq.question}
                      </span>
                    </div>
                  </button>

                  {/* Answer */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === index
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-6 pl-20">
                      <p className="text-white leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative lg:sticky lg:top-1/3">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Decorative background circle */}
              {/* <div className="absolute inset-0 bg-linear-2 rounded-full blur-3xl"></div> */}
              
              {/* Image */}
              <div className="relative w-full h-full">
                <Image
                  src="/images/assets/faq.webp"
                  alt="IBISTEK Team"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
    </section>
  );
}
