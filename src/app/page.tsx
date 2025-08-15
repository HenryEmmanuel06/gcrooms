import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ListingSection from "@/components/ListingSection";
import OurProcess from "@/components/OurProcess";
import WhyUs from "@/components/WhyUs";
import StickyCards from "@/components/StickyCards";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <ListingSection />
      <WhyUs />
      <StickyCards />
      <OurProcess />
      
    </main>
  );
}
