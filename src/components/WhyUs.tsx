import Image from "next/image";

export default function WhyUs() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto w-[90%] max-w-[1200px]">
        {/* Section Title */}
        <h2 className="text-[40px] sm:text-5xl font-bold text-black text-center mb-[60px]">
          Why gcrooms?
        </h2>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
          {/* Card 1: Super Fast */}
          <div className="rounded-[15px] w-[100%] h-[350px] p-8 relative overflow-hidden border-3 border-[#fff]" style={{
            boxShadow: "0px 1px 25px 0px #0000001A",
            background: "linear-gradient(124.32deg, #FEFAFF 6.35%, #F7F7F7 45.28%, rgba(244, 240, 248, 0.969055) 67.39%, rgba(242, 231, 255, 0.59) 85.17%, rgba(202, 159, 254, 0.5) 108.1%)"
          }}>
            <div className="relative z-10">
              <h3 className="text-2xl text-black mb-4">
               Super <span className="font-semibold"> Fast</span> 
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We guide our clients through every step of the buying and selling process.
              </p>
            </div>

            {/* Card Image */}
            <div className="absolute bottom-[20px] right-[15px] w-[137px] rounded-[10px] overflow-hidden">
              <Image
                src="/images/icons8-fast-96 1.png"
                alt="Modern living room"
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Card 2: Very Convenient */}
          <div className="rounded-[15px] w-[100%] h-[350px] p-8 relative overflow-hidden border-3 border-[#fff]" style={{
            boxShadow: "0px 1px 25px 0px #0000001A",
            background: "linear-gradient(124.32deg, #FEFAFF 6.35%, #F7F7F7 45.28%, rgba(244, 240, 248, 0.969055) 67.39%, rgba(242, 231, 255, 0.59) 85.17%, rgba(202, 159, 254, 0.5) 108.1%)"
          }}>
            <div className="relative z-10">
              <h3 className="text-2xl text-black mb-4">
                Very <span className="font-semibold"> Convenient</span> 
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We guide our clients through every step of the buying and selling process.
              </p>
            </div>

            {/* Card Image */}
            <div className="absolute bottom-[20px] right-[15px] w-[137px] rounded-[10px] overflow-hidden">
              <Image
                src="/images/relax.png"
                alt="Modern living room"
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Card 3: Totally Secured */}
          <div className="rounded-[15px] w-[100%] h-[350px] p-8 relative overflow-hidden border-3 border-[#fff]" style={{
            boxShadow: "0px 1px 25px 0px #0000001A",
            background: "linear-gradient(124.32deg, #FEFAFF 6.35%, #F7F7F7 45.28%, rgba(244, 240, 248, 0.969055) 67.39%, rgba(242, 231, 255, 0.59) 85.17%, rgba(202, 159, 254, 0.5) 108.1%)"
          }}>
            <div className="relative z-10">
              <h3 className="text-2xl text-black mb-4">
                Totally <span className="font-semibold"> Secured</span> 
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We guide our clients through every step of the buying and selling process.
              </p>
            </div>

            {/* Card Image */}
            <div className="absolute bottom-[20px] right-[15px] w-[137px] rounded-[10px] overflow-hidden">
              <Image
                src="/images/secure.png"
                alt="Modern living room"
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
