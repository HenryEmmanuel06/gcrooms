"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'top'>('top');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Use the same dark-on-light navbar variant for Rooms and Payment pages
  const isRooms = pathname?.startsWith("/rooms") || pathname?.startsWith("/payment");

  // Handle navigation to sections with smooth scrolling
  const handleSectionNavigation = (sectionId: string) => {
    const isOnHomepage = pathname === '/';
    
    if (isOnHomepage) {
      // If already on homepage, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on other pages, navigate to homepage with hash
      router.push(`/#${sectionId}`);
    }
  };

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle scrolling to section after navigation
  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname]);

  // Handle scroll direction detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY === 0) {
        setScrollDirection('top');
        setHasScrolled(false);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - only set direction, don't change hasScrolled yet
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY && currentScrollY > 50) {
        // Scrolling up and past 50px - now we activate the fixed header
        setScrollDirection('up');
        setHasScrolled(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

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
    <header className={`w-full top-0 left-0 z-1500 transition-all duration-300 ease-in-out ${
      !hasScrolled 
        ? 'absolute bg-transparent transform translate-y-0'
        : scrollDirection === 'up' 
        ? 'fixed bg-white shadow-md transform translate-y-0' 
        : hasScrolled
        ? 'fixed bg-white shadow-md transform -translate-y-full'
        : 'absolute bg-transparent transform translate-y-0'
    }`}>
      <div className="mx-auto w-[90%] max-w-[1200px] h-[80px] py-[15px] flex items-center justify-between">
        {/* Logo Container */}
        <div className="flex itemss-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src={
              isRooms || hasScrolled 
                ? "/images/rooms-page-logo.svg" 
                : "/images/logo.svg"
            } alt="gcrooms" width={120} height={32} priority />
          </Link>
        </div>

        {/* Navigation Links and Login Button Container */}
        <div className="flex items-center">
          <nav className="hidden lg:flex items-center gap-[40px] text-[16px]">
            <Link href="/" className={
              !hasScrolled 
                ? (isRooms ? "text-black hover:text-black" : "text-white hover:text-white")
                : "text-black hover:text-black"
            }>Home</Link>
            <Link href="/rooms" className={
              !hasScrolled 
                ? (isRooms ? "text-black hover:text-black" : "text-white hover:text-white")
                : "text-black hover:text-black"
            }>Rooms</Link>
            <button 
              onClick={() => handleSectionNavigation('faq')} 
              className={`cursor-pointer ${
                !hasScrolled 
                  ? (isRooms ? "text-black hover:text-black" : "text-white hover:text-white")
                  : "text-black hover:text-black"
              }`}
            >
              FAQs
            </button>
            <button 
              onClick={() => handleSectionNavigation('why-us')} 
              className={`cursor-pointer ${
                !hasScrolled 
                  ? (isRooms ? "text-black hover:text-black" : "text-white hover:text-white")
                  : "text-black hover:text-black"
              }`}
            >
              Why GCrooms
            </button>
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
          className={`lg:hidden inline-flex items-center justify-center p-2 rounded-md transition-colors ${
            !hasScrolled 
              ? (isRooms ? "text-black hover:bg-black/5" : "text-white hover:bg-white/10")
              : "text-black hover:bg-black/5"
          }`}
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
          className={`fixed inset-0 bg-black/50 h-[100vh] backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Mobile menu panel */}
        <div className={`fixed top-0 right-0 h-[100vh] w-[85%] bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
            {/* Mobile menu header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
            <nav className="flex flex-col px-6 py-8 space-y-6 flex-1">
              <Link 
                href="/" 
                className="block text-xl font-medium text-gray-900 hover:text-[#10D1C1] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/rooms" 
                className="block text-xl font-medium text-gray-900 hover:text-[#10D1C1] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Rooms
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSectionNavigation('faq');
                }}
                className="block text-xl font-medium text-gray-900 hover:text-[#10D1C1] transition-colors text-left"
              >
                FAQs
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSectionNavigation('why-us');
                }}
                className="block text-xl font-medium text-gray-900 hover:text-[#10D1C1] transition-colors text-left"
              >
                Why GCrooms
              </button>
   {/* Mobile contact button */}
            <div className="py-6">
              <Link
                href="#contact-us"
                className="block w-full text-center bg-[#10D1C1] text-[#222] font-medium px-6 py-4 rounded-full transition-colors hover:bg-[#0FB8A8]"
                style={{
                  boxShadow: "0px 0px 10px 0px #660ED180",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact us
              </Link>
            </div>
            </nav>

         
          </div>
        </div>
    </header>
  );
}


