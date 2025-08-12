import Link from "next/link";

export default function ListingSection() {
  return (
    <section className="bg-white py-[70px] sm:py-20">
      <div className="mx-auto w-[90%] max-w-[1165px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Main Headline */}
          <div className="text-center lg:text-left">
            <h2 className="text-[40px] sm:text-5xl font-bold text-black leading-tight">
              Finding roommates should never be tough!
            </h2>
          </div>

          {/* Right Side - Supporting Text and Buttons */}
          <div className="space-y-[12px]">
            <p className="text-[16px] text-gray-600 leading-relaxed">
              We guide our clients through every step of the buying and selling process.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#list-room"
                className="inline-flex border border-[#FFBE06] items-center justify-center rounded-full bg-[#FFBE06] text-black text-[16px] px-[30px] py-3 transition"
                style={{
                  boxShadow: "0px 0px 10px 0px #660ED180"
                }}
              >
                List Your Room
              </Link>
              
              <Link
                href="#view-apartments"
                className="inline-flex border-[1.5px] border-[#10D1C1] items-center justify-center rounded-full text-black px-6 py-3 transition"
                style={{
                  boxShadow: "0px 0px 10px 0px #10D1C159"
                }}
              >
                View All Apartments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
