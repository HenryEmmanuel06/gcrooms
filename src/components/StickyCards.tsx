// components/StickyCards.tsx
"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ListRoomModal from "./ListRoomModal";

interface CardData {
    id: number;
    title: string;
    description: string;
    image: string;
    alt: string;
}

const cardsData: CardData[] = [
    {
        id: 1,
        title: "Splitting Rent",
        description: "We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process.",
        image: "/images/rent.jpg",
        alt: "Splitting Rent"
    },
    {
        id: 2,
        title: "Source of passive income",
        description: "We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process.",
        image: "/images/income.jpg",
        alt: "Passive Income"
    },
    {
        id: 3,
        title: "Connecting with new friends",
        description: "We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process. We guide our clients through every step of the buying and selling process.",
        image: "/images/friends.jpg",
        alt: "New Friends"
    }
];

export default function StickyCards() {
    const sectionRef = useRef<HTMLDivElement>(null);

    // Track scroll progress for overlap animations
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    // Transform values for each card
    const card1Y = useTransform(scrollYProgress, [0, 1], ["0%", "0%"]);
    const card1Scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

    const card2Y = useTransform(scrollYProgress, [0, 0.5, 1], ["110%", "50%", "50%"]);
    const card2Scale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);

    const card3Y = useTransform(scrollYProgress, [0, 0.5, 1], ["220%", "110%", "50%"]);
    const card3Scale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);

    // Get transforms for each card by index
    const getCardTransforms = (index: number) => {
        if (index === 0) return { cardY: card1Y, cardScale: card1Scale };
        if (index === 1) return { cardY: card2Y, cardScale: card2Scale };
        if (index === 2) return { cardY: card3Y, cardScale: card3Scale };
        return { cardY: card1Y, cardScale: card1Scale }; // fallback
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <>
            <section
                ref={sectionRef}
                className="relative hidden lg:flex w-[90%] max-w-[1300px] mx-auto gap-8 py-20 text-black"
            >
                {/* LEFT COLUMN */}
                <div className="w-1/3 sticky top-20 h-fit self-start lg:pb-[270px] pb-[100px]">
                    <h2 className="text-[36px] font-bold text-black">Got A Room To List?</h2>
                    <p className="text-[36px] text-black font-light leading-none w-[361px]">See how others earn on grooms</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex border border-[#FFBE06] items-center justify-center rounded-full bg-[#FFBE06] text-black text-[16px] px-[30px] py-3 transition mt-[30px]"
                        style={{
                            boxShadow: "0px 0px 10px 0px #660ED180"
                        }}
                    >
                        List your room
                    </button>
                </div>

                {/* RIGHT COLUMN */}
                <div className="w-2/3 relative h-[600px] xl:h-[800px]">
                    {cardsData.map((card, index) => {
                        const { cardY, cardScale } = getCardTransforms(index);

                        return (
                            <motion.div
                                key={card.id}
                                style={{
                                    y: cardY,
                                    scale: cardScale,
                                    zIndex: -10 + index,
                                    background: "linear-gradient(124.32deg, #FEFAFF 6.35%, #F7F7F7 45.28%, #F4F0F8 67.39%, #F7F1FF 85.17%, #E4CFFF 108.1%)",
                                }}
                                className="absolute top-0 left-0 w-full bg-white shadow-lg rounded-xl p-[30px] flex justify-between border-3 border-[#F2F2F2F7]"
                            >
                                <div className="flex-1 pt-[15px] max-w-[400px]">
                                    <h3 className="font-medium text-[24px]">{card.title}</h3>
                                    <p className="text-[16px] font-normal">
                                        {card.description}
                                    </p>
                                </div>

                                <div className="flex items-center w-[212px] h-[180px] " style={
                                    {
                                        backgroundImage: `url('${card.image}')`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        borderRadius: "10px",
                                        backgroundRepeat: "no-repeat",
                                    }
                                }>

                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </section>
            <section className="w-[100%] max-w-[1300px] mx-auto block lg:hidden bg-[#ffff]">
                <div className="w-[90%] max-w-[1300px] mx-auto bg-[#ffff]">
                    <h2 className="text-[30px] md:text-[36px] font-bold text-black">Got A Room To List?</h2>
                    <p className="text-[30px] md:text-[36px] text-black font-light leading-none max-w-[361px]">See how others earn on grooms</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex border border-[#FFBE06] items-center justify-center rounded-full bg-[#FFBE06] text-black text-[16px] px-[30px] py-3 transition mt-[30px]"
                        style={{
                            boxShadow: "0px 0px 10px 0px #660ED180"
                        }}
                    >
                        List your room
                    </button>
                </div>


                <div className="w-[90%] max-w-[1300px] mx-auto flex flex-col gap-[20px] mt-[30px] bg-[#ffff]">
                    {cardsData.map((card) => {
                        return (
                            <div
                                key={card.id}
                                style={{
                                    background: "linear-gradient(124.32deg, #FEFAFF 6.35%, #F7F7F7 45.28%, #F4F0F8 67.39%, #F7F1FF 85.17%, #E4CFFF 108.1%)",
                                }}
                                className=" w-full bg-white shadow-lg rounded-xl p-[30px] flex justify-between flex-col gap-5 md:flex-row border-3 border-[#F2F2F2F7] text-black"
                            >
                                <div className="flex-1 pt-[15px] max-w-[400px]">
                                    <h3 className="font-medium text-[20px] md:text-[24px] leading-tight">{card.title}</h3>
                                    <p className="text-[14px] md:text-[16px] mt-2 md:mt-0 font-normal">
                                        {card.description}
                                    </p>
                                </div>

                                <div className="flex items-center w-[150px] h-[120px] md:w-[212px] md:h-[180px] " style={
                                    {
                                        backgroundImage: `url('${card.image}')`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        borderRadius: "10px",
                                        backgroundRepeat: "no-repeat",
                                    }
                                }>

                                </div>
                            </div>
                        );
                    })}
                </div>
                <ListRoomModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </section>
        </>
    );
}
