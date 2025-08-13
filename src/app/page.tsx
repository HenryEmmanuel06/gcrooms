import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ListingSection from "@/components/ListingSection";
import WhyUs from "@/components/WhyUs";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <ListingSection />
      <WhyUs />
    </main>
  );
}
