"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use the same dark-on-light navbar variant for Rooms and Payment pages
  const isRooms = pathname?.startsWith("/rooms") || pathname?.startsWith("/payment");

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  return (
    <header className="w-full absolute top-0 left-0 z-50 bg-transparent">
      <div className="mx-auto w-[90%] max-w-[1200px] h-[47px] pt-[15px] flex items-center justify-between">
        {/* Logo Container */}
        <div className="flex itemss-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src={isRooms ? "/images/rooms-page-logo.svg" : "/images/logo.svg"} alt="gcrooms" width={120} height={32} priority />
          </Link>
        </div>

        {/* Navigation Links and Login Button Container */}
        <div className="flex items-center">
          <nav className="hidden lg:flex items-center gap-[40px] text-[16px]">
            <Link href="/" className={isRooms ? "text-black hover:text-black" : "text-white hover:text-white"}>Home</Link>
            <Link href="/rooms" className={isRooms ? "text-black hover:text-black" : "text-white hover:text-white"}>Rooms</Link>
            <Link href="#faqs" className={isRooms ? "text-black hover:text-black" : "text-white hover:text-white"}>FAQs</Link>
            <Link href="#why" className={isRooms ? "text-black hover:text-black" : "text-white hover:text-white"}>Why GCrooms</Link>
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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className={`lg:hidden inline-flex items-center justify-center p-2 rounded-md  transition-colors ${isRooms ? "text-black hover:bg-black/5" : "text-white hover:bg-white/10"}`}
        >
          {isMobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden ${
        isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}>
        {/* Background overlay */}
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Mobile menu panel */}
        <div className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
            {/* Mobile menu header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Image src="/images/rooms-page-logo.svg" alt="gcrooms" width={100} height={28} priority />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Mobile navigation links */}
            <nav className="flex flex-col p-4 space-y-1">
              <Link 
                href="/" 
                className="block px-4 py-3 text-lg font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/rooms" 
                className="block px-4 py-3 text-lg font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Rooms
              </Link>
              <Link 
                href="#faqs" 
                className="block px-4 py-3 text-lg font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQs
              </Link>
              <Link 
                href="#why" 
                className="block px-4 py-3 text-lg font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Why GCrooms
              </Link>
            </nav>

            {/* Mobile contact button */}
            <div className="p-4 border-t border-gray-200 mt-auto">
              <Link
                href="#contact-us"
                className="block w-full text-center bg-[#10D1C1] text-[#222] font-medium px-6 py-3 rounded-full transition-colors hover:bg-[#0FB8A8]"
                style={{
                  boxShadow: "0px 0px 10px 0px #660ED180",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
    </header>
  );
}


