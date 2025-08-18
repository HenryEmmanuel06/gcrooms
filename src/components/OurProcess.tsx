"use client";
import Image from "next/image";


// Initialize Supabase client

   export default function OurProcess() {
    return (
        <section className="bg-white md:py-16 md:pt-0 pt-0 py-0 bg-[url('/images/process-bg.svg')]" style={
            {
                backgroundSize: "contain",
                backgroundPositionX: "center",
                backgroundPositionY: "center",
                backgroundRepeat: "no-repeat",
            }
        }>
            <div className="mx-auto w-[90%] max-w-[1200px]">
                {/* Section Title */}
                <h2 className="md:text-[40px] text-[32px] font-bold text-black text-center mb-[20px] md:mb-[60px] pt-0 lg:pt-15">
                    How it works
                </h2>

                {/* Process Steps Grid */}
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-[20px] lg:gap-[80px] py-[30px] md:py-[60px]">
                    <div className="w-full absolute hidden lg:block top-0 left-0">
                        <Image
                        src="/images/process-img.svg"
                        alt="Process Image"
                        width={1006}
                        height={501}
                        className="w-full h-auto"
                        />
                    </div>
                    {/* Step 1: Discover Rooms */}
                    <div className="flex flex-col items-center">
                        <div className="bg-[#E8C5FF] text-black text-lg font-medium rounded-[10px] px-4 py-2 mb-6">
                            01
                        </div>
                        <h3 className="text-[24px] font-medium text-black mb-4">
                            Discover Rooms
                        </h3>
                        <div className="mt-[13px]">
                           <Image
                           src="/images/search svg.png"
                           alt="Discover Rooms"
                           width={800}
                           height={600}
                           className="w-full h-auto"
                           />
                        </div>
                    </div>

                    {/* Step 2: Select Preference */}
                    <div className="flex flex-col items-center">
                        <div className="bg-[#E8C5FF] text-black text-lg font-medium rounded-[10px] px-4 py-2 mb-6">
                            02
                        </div>
                        <h3 className="text-[24px] font-medium text-black mb-4">
                            Select Preference
                        </h3>
                        <div className="w-[279px] h-[90px] flex gap-0 hover:gap-[5px] transition-all duration-500 group cursor-pointer">
                            <div className="relative flex-1 bg-[#8B5CF6] rounded-[10px] -mr-5 group-hover:mr-0 transition-all duration-500 border-2 border-[#ffffff]" 
                            style={{
                                boxShadow: "0px 1px 25px 0px #00000033, 0px 0px 3px 0px #00000026",
                                backgroundImage: "url('/images/preference-1.jpg')",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                            >
                                <div className="absolute top 0 h-full w-full bg-[#F9C57133] rounded-[10px]">

                                </div>
                            </div>
                            <div className="relative flex-1 bg-[#10B981] rounded-[10px] -mr-5 group-hover:mr-0 transition-all duration-500 border-2 border-[#ffffff]" 
                            style={{
                                boxShadow: "0px 1px 25px 0px #00000033, 0px 0px 3px 0px #00000026",
                                backgroundImage: "url('/images/preference-2.jpg')",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                            >
                                <div className="absolute top 0 h-full w-full bg-[#F9C57133] rounded-[10px]">

                                </div>
                            </div>
                            <div className="relative flex-1 bg-[#F59E0B] rounded-[10px] -mr-5 group-hover:mr-0 transition-all duration-500 border-2 border-[#ffffff]" 
                            style={{
                                boxShadow: "0px 1px 25px 0px #00000033, 0px 0px 3px 0px #00000026",
                                backgroundImage: "url('/images/preference-3.jpg')",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}>
                                <div className="absolute top 0 h-full w-full bg-[#F9C57133] rounded-[10px]">

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Get Connected */}
                    <div className="flex flex-col items-center mt-[40px]">
                        <div className="bg-[#E8C5FF] text-black text-lg font-medium rounded-[10px] px-4 py-2 mb-6">
                            03
                        </div>
                        <h3 className="text-[24px] font-medium text-black mb-4">
                            Get Connected
                        </h3>
                        <div className="mt-[13px]">
                           <Image
                           src="/images/search svg.png"
                           alt="Discover Rooms"
                           width={800}
                           height={600}
                           className="w-full h-auto"
                           />
                        </div>
                    </div>

                    {/* Step 4: Get Comfortable */}
                    <div className="flex flex-col items-center mt-[40px]">
                        <div className="bg-[#E8C5FF] text-black text-lg font-medium rounded-[10px] px-4 py-2 mb-6">
                            04
                        </div>
                        <h3 className="text-[24px] font-medium text-black mb-4">
                            Get Comfortable
                        </h3>
                        <div className="mt-[13px]">
                           <Image
                           src="/images/search svg.png"
                           alt="Discover Rooms"
                           width={800}
                           height={600}
                           className="w-full h-auto"
                           />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
