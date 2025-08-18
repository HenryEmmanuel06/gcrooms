"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full absolute top-0 left-0 z-50 bg-transparent">
      <div className="mx-auto w-[90%] max-w-[1200px] h-[47px] pt-[15px] flex items-center justify-between">
        {/* Logo Container */}
        <div className="flex itemss-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="gcrooms" width={120} height={32} priority />
          </Link>
        </div>

        {/* Navigation Links and Login Button Container */}
        <div className="flex items-center">
          <nav className="hidden lg:flex items-center gap-[40px] text-[16px] text-white">
            <Link href="#" className="hover:text-white">Home</Link>
            <Link href="/rooms" className="hover:text-white">Rooms</Link>
            <Link href="#faqs" className="hover:text-white">FAQs</Link>
            <Link href="#why" className="hover:text-white">Why GCrooms</Link>
          </nav>

          <div className="hidden lg:block ml-[50px] text-[16px]">
            <Link
              href="#contact-us"
              className="inline-flex border border-[#FFBE06] items-center rounded-[50px] bg-[#10D1C1] text-[#222] font-medium px-[35px] py-2 shadow-sm transition-colors"
              style={{
                boxShadow: "box-shadow: 0px 0px 10px 0px #660ED180",
              }}
            >
              Contact us
            </Link>
          </div>
        </div>

        <button
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-white/30 text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}


