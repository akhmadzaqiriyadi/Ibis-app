"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { CONTENT } from "@/constants/content";

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
            {CONTENT.faq.title}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - FAQ Questions */}
          <div className="space-y-8">

            {/* FAQ Accordion */}
            <div className="space-y-4">
              {CONTENT.faq.items.map((faq, index) => (
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
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 bg-white bg-opacity-20 text-dark"
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
              {/* Image */}
              <div className="relative w-full h-full">
                <Image
                  src={CONTENT.faq.image}
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
