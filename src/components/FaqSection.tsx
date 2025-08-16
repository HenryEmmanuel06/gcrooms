// components/FaqSection.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { s } from "framer-motion/client";
type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "Can I list my rooms on gcrooms?",
    answer:
      "We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process.",
  },
  {
    question: "Are gcrooms only for finding roommates?",
    answer:
      "We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process. ",
  },
  {
    question: "Do I pay before connecting with room owners?",
    answer:
      "We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process. ",
  },
  {
    question: "Can it be refunded?",
    answer:
      "We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process. ",
  },
  {
    question: "What types of rooms are available in gcrooms?",
    answer:
      "We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process. ",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="pb-[86px]">
        {/* Section Title */}
        <h2 className="text-[40px] sm:text-5xl font-bold text-black text-center mb-[80px] pt-15">
        Frequently Asked Questions
        </h2>
        <div className="w-[90%] max-w-[1160px] mx-auto flex md:flex-row flex-col justify-between gap-[70px]" style={{
            backgroundImage: "url('/images/why-us-bg.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }}>
      {/* Left side image */}
      <div className="relative rounded-[20px] overflow-hidden h-[560px] w-[450px] p-[40px]" style={{
        backgroundImage: "url('/images/faq-img-1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
    <Image
          src="/images/faq-logo.png" // replace with your image path
          alt="FAQ Illustration"
          className="w-full h-full object-contain"
          width={450}
          height={520}
        />
        {/* <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div> */}
      </div>

      {/* Right side FAQ */}
      <div className="flex flex-col gap-4 flex-1">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-[20px] shadow-sm overflow-hidden bg-[#fff]" style={{
                boxShadow: "box-shadow: 0px 1px 25px 0px #0000001A, 0px 0px 3px 0px #00000012",
            }}
          >
            <button
              onClick={() => toggleFaq(i)}
              className="flex justify-between items-center w-full px-[20px] py-[25px] pb-[20px] text-left text-[20px] text-[#000] font-medium"
            >
              {faq.question}
            <div className="bg-[#E3CCFF2E] py-[9px] px-[9px] rounded-full cursor-pointer border-[0.5px] border-[#E3E3E3]">
              <ChevronDown
                className={`h-5 w-5 flex items-center justify-center transition-transform text-[#5A5A5A] ${
                    openIndex === i ? "rotate-180" : ""
                }`} 
              />
            </div>
              
            </button>

            {/* Answer */}
            {openIndex === i && (
              <div className="px-[20px] pb-4 text-[#000] text-[16px] animate-fadeIn">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
