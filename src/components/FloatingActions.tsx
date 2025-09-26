"use client";

import Link from "next/link";
import { FC, useState, useEffect, useRef } from "react";
import ListRoomModal from "./ListRoomModal";

const FloatingActions: FC = () => {
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [isListRoomModalOpen, setIsListRoomModalOpen] = useState(false);
    const actionsRef = useRef<HTMLDivElement>(null);

    const handleWhatsAppClick = () => {
        window.open('https://wa.me/2348123456789', '_blank');
    };

    const handleListRoomClick = () => {
        setIsActionsOpen(false);
        setIsListRoomModalOpen(true);
    };

    // Close actions modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
                setIsActionsOpen(false);
            }
        };

        if (isActionsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isActionsOpen]);

    return (
        <>
            {/* WhatsApp Button - Left */}
            <button
                onClick={handleWhatsAppClick}
                className="fixed z-[1000] cursor-pointer bottom-6 left-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 group"
                aria-label="Contact us on WhatsApp"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="group-hover:scale-110 transition-transform duration-200"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488" />
                </svg>
            </button>

            {/* Actions Button - Right */}
            <div ref={actionsRef} className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-[1000]">
                {/* Actions Modal - Full Screen on Mobile */}
                <div className={`${isActionsOpen ? 'block' : 'hidden'}`}>
                    
                    {/* Modal Content */}
                    <div className={`fixed left-0 right-0 bottom-0 z-[1500] md:static md:inset-auto bg-white/95 backdrop-blur-[15px] shadow-[0px_1px_25px_0px_#0000001A,0px_0px_3px_0px_#00000012] rounded-t-[30px] md:rounded-[20px] mx-auto w-[95%] md:w-[390px] px-[20px] py-[50px] md:px-[60px] md:py-[50px] md:pr-[30px] transform transition-all duration-300 ease-in-out ${isActionsOpen
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-full opacity-0 scale-95'
                    }`}>
                        {/* Close Button */}
                        <button
                            onClick={() => setIsActionsOpen(false)}
                            className="absolute top-4 right-[30px] text-red-400 rounded-full p-1 cursor-pointer transition-colors z-[1600]"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className="flex flex-col gap-6 mt-2 items-center md:items-end">
                            <button
                                onClick={handleListRoomClick}
                                className="flex items-center justify-center shadow-[0px_0px_10px_0px_#660ED160] bg-[#FFBE06] text-black font-semibold px-8 py-4 rounded-full transition-all duration-200 cursor-pointer text-lg md:text-base"
                            >
                                List your room
                            </button>
                            <Link
                                href="/rooms"
                                className="flex items-center justify-center shadow-[0px_0px_10px_0px_#660ED160] bg-[#10D1C1] text-black font-medium px-8 py-4 rounded-full transition-all duration-200 text-lg md:text-base"
                                onClick={() => setIsActionsOpen(false)}
                            >
                                View available apartment
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Actions Button */}
                <button
                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                    className="group cursor-pointer bg-[#ffff] rounded-full shadow-lg transition-all duration-300 ease-in-out p-[5px] hover:pl-[17px] hover:pr-[5px] flex items-center z-[1100]"
                    style={{
                        boxShadow: "0px 0px 27.8px 0px #FFBE06",
                        border: "1px solid #B7E5ED",
                    }}
                >
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-black font-medium whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[80px] mr-2">
                        Actions
                    </span>
                    <span className="p-[7px] rounded-full bg-[#10D1C1] flex-shrink-0 -ml-[7px] group-hover:ml-[0px]">
                        <svg width="22" height="22" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.59697 20.9605C3.68157 20.8758 3.78203 20.8086 3.89261 20.7627C4.00319 20.7168 4.12172 20.6931 4.24145 20.693C4.36117 20.693 4.47974 20.7165 4.59039 20.7622C4.70103 20.8079 4.80159 20.875 4.8863 20.9596C4.97102 21.0442 5.03825 21.1447 5.08414 21.2553C5.13004 21.3658 5.1537 21.4844 5.15379 21.6041C5.15387 21.7238 5.13037 21.8424 5.08464 21.953C5.0389 22.0637 4.97181 22.1642 4.88721 22.249L2.15365 24.9825C1.9828 25.1536 1.75097 25.2498 1.50917 25.25C1.26738 25.2502 1.03542 25.1543 0.86432 24.9834C0.693224 24.8126 0.597007 24.5807 0.596836 24.339C0.596665 24.0972 0.692554 23.8652 0.863409 23.6941L3.59697 20.9605ZM12.7088 19.1382C12.8797 18.9671 13.1115 18.8708 13.3533 18.8707C13.5951 18.8705 13.8271 18.9664 13.9982 19.1372C14.1693 19.3081 14.2655 19.5399 14.2657 19.7817C14.2658 20.0235 14.1699 20.2555 13.9991 20.4266L9.43586 24.9825C9.26401 25.1485 9.03384 25.2403 8.79493 25.2383C8.55602 25.2362 8.32749 25.1404 8.15854 24.9714C7.9896 24.8025 7.89377 24.5739 7.8917 24.335C7.88962 24.0961 7.98147 23.8659 8.14745 23.6941L12.7088 19.1382Z" fill="black"/>
                        </svg>
                    </span>
                </button>
            </div>

            {/* List Room Modal */}
            <ListRoomModal
                isOpen={isListRoomModalOpen}
                onClose={() => setIsListRoomModalOpen(false)}
            />
        </>
    );
};

export default FloatingActions;
