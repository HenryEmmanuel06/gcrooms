import HeroSection from "@/components/HeroSection";
import ListingSection from "@/components/ListingSection";
import OurProcess from "@/components/OurProcess";
import WhyUs from "@/components/WhyUs";
import StickyCards from "@/components/StickyCards";
import FaqSection from "@/components/FaqSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ListingSection />
      <WhyUs />
      <OurProcess />
      <StickyCards />
      <FaqSection />
    </>
  );
}
