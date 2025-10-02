"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ListRoomModal from "./ListRoomModal";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    // Set initial width
    updateScreenWidth();

    // Add event listener for window resize
    window.addEventListener('resize', updateScreenWidth);

    return () => {
      window.removeEventListener('resize', updateScreenWidth);
    };
  }, []);

  return (
    <section className="relative overflow-hidden text-white h-[100vh] md:h-[740px] lg:h-[760px] sm:h-[700px]" style={{
      backgroundImage: "url(/images/hero-bg.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      {/* Animated Background Balls */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Yellow Balls */}
        <motion.div
          className="absolute w-1 h-1 bg-[#FFBE06] rounded-full shadow-[0_0_6px_#FFBE06]"
          animate={{
            x: [0, 100, 50, 150, 0],
            y: [0, 80, 120, 60, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "20%", left: "15%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, -80, -120, -60, 0],
            y: [0, 100, 60, 120, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "40%", left: "25%" }}
        />
        <motion.div
          className="absolute w-1.5 h-1.5 bg-[#FFBE06] rounded-full shadow-[0_0_8px_#FFBE06]"
          animate={{
            x: [0, 120, 80, 160, 0],
            y: [0, -60, -100, -40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "60%", left: "10%" }}
        />

        {/* Green Balls */}
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -100, -150, -80, 0],
            y: [0, 80, 120, 60, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "30%", right: "20%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#10D1C1] rounded-full shadow-[0_0_4px_#10D1C1]"
          animate={{
            x: [0, 60, 100, 40, 0],
            y: [0, -80, -120, -60, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "50%", right: "30%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -80, -120, -60, 0],
            y: [0, -100, -60, -120, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "70%", right: "15%" }}
        />

        {/* Additional scattered balls */}
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 40, 80, 40, 0],
            y: [0, 60, 40, 80, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "25%", left: "60%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -60, -40, -80, 0],
            y: [0, 40, 80, 60, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "75%", left: "70%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#FFBE06] rounded-full shadow-[0_0_6px_#FFBE06]"
          animate={{
            x: [0, 80, 120, 60, 0],
            y: [0, -40, -80, -60, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "45%", left: "80%" }}
        />

        {/* More balls for denser effect */}
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 60, 30, 90, 0],
            y: [0, -40, -80, -20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "15%", left: "45%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -70, -110, -50, 0],
            y: [0, 90, 50, 110, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "35%", right: "45%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 50, 100, 30, 0],
            y: [0, 70, 30, 90, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "55%", left: "35%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -90, -130, -70, 0],
            y: [0, -70, -30, -90, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "65%", right: "35%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 70, 110, 50, 0],
            y: [0, -50, -90, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "80%", left: "50%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -40, -80, -20, 0],
            y: [0, 60, 20, 80, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "85%", right: "50%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 80, 40, 120, 0],
            y: [0, 40, 80, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "10%", left: "75%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -60, -100, -40, 0],
            y: [0, -60, -20, -80, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "90%", right: "25%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 90, 130, 70, 0],
            y: [0, 50, 90, 30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "5%", left: "85%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -50, -90, -30, 0],
            y: [0, 70, 30, 90, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "95%", right: "75%" }}
        />

        {/* Even more balls for ultra-dense effect */}
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 40, 80, 20, 0],
            y: [0, -60, -100, -40, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "12%", left: "20%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -80, -120, -60, 0],
            y: [0, 40, 80, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "22%", right: "10%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 60, 100, 40, 0],
            y: [0, 70, 30, 90, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "32%", left: "70%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -70, -110, -50, 0],
            y: [0, -50, -90, -30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "42%", right: "60%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 50, 90, 30, 0],
            y: [0, 80, 40, 100, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "52%", left: "25%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -90, -130, -70, 0],
            y: [0, 60, 20, 80, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "62%", right: "40%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 70, 110, 50, 0],
            y: [0, -40, -80, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "72%", left: "40%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -60, -100, -40, 0],
            y: [0, -70, -30, -90, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "82%", right: "65%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 80, 120, 60, 0],
            y: [0, 50, 90, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "88%", left: "30%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -50, -90, -30, 0],
            y: [0, 80, 40, 100, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "8%", right: "80%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 90, 130, 70, 0],
            y: [0, -50, -90, -30, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "18%", left: "90%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -40, -80, -20, 0],
            y: [0, 70, 30, 90, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "28%", right: "70%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 100, 140, 80, 0],
            y: [0, 60, 20, 80, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "38%", left: "15%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -80, -120, -60, 0],
            y: [0, -60, -20, -80, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "48%", right: "25%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 60, 100, 40, 0],
            y: [0, 90, 50, 110, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "58%", left: "55%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -70, -110, -50, 0],
            y: [0, 40, 80, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "68%", right: "15%" }}
        />
        <motion.div
          className="absolute w-0.5 h-0.5 bg-[#FFBE06] rounded-full shadow-[0_0_4px_#FFBE06]"
          animate={{
            x: [0, 80, 120, 60, 0],
            y: [0, -60, -20, -80, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "78%", left: "65%" }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-[#10D1C1] rounded-full shadow-[0_0_6px_#10D1C1]"
          animate={{
            x: [0, -90, -130, -70, 0],
            y: [0, 70, 30, 90, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: "92%", right: "35%" }}
        />
      </div>

      <div className="relative mx-auto max-w-[1000px] h-full pt-24 sm:pt-28">
        <div className="-mt-[50px]">
          <Image src="/images/hero vector.svg" alt="" 
          width={1400}
          height={320}
          />
        </div>
        <div className="flex flex-col items-center -mt-[20px] md:-mt-[100px] lg:-mt-[170px]">
          <div className="text-center">
            
            <h1 className="max-w-[840px] w-[100%] lg:text-[54px] text-[32px] md:text-[40px] font-extrabold leading-[35px] sm:leading-none px-[25px] sm:px-0" style={{
              letterSpacing: "2px"
            }}>
              Lets help you find your dream roommate with ease!
            </h1>
           
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center" style={{
            zIndex: "3",
          }}>
              <button
                onClick={() => setIsModalOpen(true)}
                className="border border-[#FFBE06] rounded-full bg-[#FFBE06] text-black px-[50px] py-3 shadow transition font-semibold"
                style={{
                  boxShadow: "0px 0px 10px 0px #660ED180"
                }}
              >
                List your room
              </button>
              <Link
                href="#view-apartments"
                className="border border-[#FFBE06] rounded-full bg-[#10D1C1] text-black px-[35px] py-3 shadow transition"
                style={{
                  boxShadow: "box-shadow: 0px 0px 10px 0px #660ED180",
                }}
              >
                View available apartments
              </Link>
            </div>
          <div 
            className="absolute items-center justify-center mx-auto inline-flex -bottom-[10%]"
          >
            {/* Mobile Animation (sm and below) */}
            {screenWidth > 0 && (
              <div className="sm:hidden overflow-hidden w-full">
                <motion.div
                  className="flex"
                  animate={{
                    x: [0, -700]
                  }}
                  transition={{
                    duration: 21,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop"
                  }}
                  style={{ width: `${700 * 4}px` }}
                >
                  <Image
                    src="/images/hero image.png"
                    alt="Friends on a couch"
                    className="object-contain w-[700px] flex-shrink-0"
                    width={1500}
                    height={1500}
                  />
                  <Image
                    src="/images/hero image.png"
                    alt="Friends on a couch"
                    className="object-contain w-[700px] flex-shrink-0"
                    width={1500}
                    height={1500}
                  />
                  <Image
                    src="/images/hero image.png"
                    alt="Friends on a couch"
                    className="object-contain w-[700px] flex-shrink-0"
                    width={1500}
                    height={1500}
                  />
                  <Image
                    src="/images/hero image.png"
                    alt="Friends on a couch"
                    className="object-contain w-[700px] flex-shrink-0"
                    width={1500}
                    height={1500}
                  />
                </motion.div>
              </div>
            )}
            
            {/* Desktop/Tablet Static Image (sm and above) */}
            <div className="hidden sm:inline-flex">
              <Image
                src="/images/hero image.png"
                alt="Friends on a couch"
                className="object-contain max-w-[1000px] w-[100%]"
                width={1500}
                height={1500}
              />
            </div>
          </div>
        </div>
      </div>

      {/* List Room Modal */}
      <ListRoomModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}


