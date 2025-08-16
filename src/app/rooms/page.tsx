import ListingSection from "@/components/ListingSection";

export default function RoomsPage() {
  return (
    <div className="pt-20">
      {/* Page Header */}
      <div className="bg-white py-12">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <h1 className="text-[40px] sm:text-5xl font-bold text-black text-center mb-4">
            Available Rooms
          </h1>
          <p className="text-gray-600 text-center text-lg">
            Discover your perfect room from our curated collection
          </p>
        </div>
      </div>
      
      {/* Rooms Listing */}
      <ListingSection />
    </div>
  );
}
