"use client";

import Link from "next/link";
import { FC, useState } from "react";
import Image from "next/image";
import ListRoomModal from "./ListRoomModal";

const Footer: FC = () => {
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [isListRoomModalOpen, setIsListRoomModalOpen] = useState(false);

    const handleWhatsAppClick = () => {
        // Replace with your actual WhatsApp number
        window.open('https://wa.me/2348123456789', '_blank');
    };

    const handleListRoomClick = () => {
        setIsActionsOpen(false);
        setIsListRoomModalOpen(true);
    };

    return (
        <footer className="bg-purple-600 text-white py-10 px-0 md:px-20 pt-[70px]">
            <div className="max-w-[1300px] mx-auto flex md:flex-row flex-col gap-[30px] justify-between items-start md:items-center px-4">
                {/* Logo + Description */}
                <div>
                    <div className="flex items-center gap-2 text-2xl font-bold">
                        <Image src="/images/footer-logo.svg" alt="Logo" width={250} height={90} />
                    </div>
                    <p className="mt-3 text-sm text-[#fff] max-w-xs">
                        We guide our clients through every step of the buying and selling process.
                    </p>
                    {/* Social Icons */}
                    <div className="flex gap-4 mt-4 text-xl">
                        <Link href="#" className="hover:text-gray-300">
                            <Image src="/images/facebook.svg" alt="Facebook" width={24} height={24} />
                        </Link>
                        <Link href="#" className="hover:text-gray-300">
                            <Image src="/images/twitter.svg" alt="Twitter" width={24} height={24} />
                        </Link>
                        <Link href="#" className="hover:text-gray-300">
                            <Image src="/images/instagram.svg" alt="Instagram" width={24} height={24} />
                        </Link>
                        <Link href="#" className="hover:text-gray-300">
                            <Image src="/images/linkedin.svg" alt="LinkedIn" width={24} height={26} />
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-[30px] lg:gap-[100px]">
                    {/* More Links */}
                    <div>
                        <h3 className="font-semibold mb-3 text-[#fff]">More Links</h3>
                        <ul className="space-y-2 text-sm text-[#fff]">
                            <li><a href="#">List Your Rooms</a></li>
                            <li><a href="#">View All Apartments</a></li>
                            <li><a href="#">View All Apartments</a></li>
                        </ul>
                    </div>

                    {/* Why gcrooms */}
                    <div>
                        <h3 className="font-semibold mb-3 text-[#fff]">Why gcrooms</h3>
                        <ul className="space-y-2 text-sm text-[#fff]">
                            <li><a href="#">List Your Rooms</a></li>
                            <li><a href="#">View All Apartments</a></li>
                            <li><a href="#">View All Apartments</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-3 text-[#fff]">Get In Touch</h3>
                        <ul className="space-y-2 text-sm text-[#fff]">
                            <li>+234 812 3456 789</li>
                            <li>support@gcrooms.com</li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* Divider */}
            <div className="border-t border-[#FFFFFF80] mt-10 pt-6 text-center text-sm text-[#fff]">
                © {new Date().getFullYear()} gcrooms. All rights reserved.
            </div>

            {/* Floating Action Buttons */}
            {/* WhatsApp Button - Left */}
            <button
                onClick={handleWhatsAppClick}
                className="fixed z-1000 cursor-pointer bottom-6 left-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 group"
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
            <div className="fixed bottom-6 right-[18px] sm:right-6 flex flex-col items-end gap-4 z-1000">
                {/* Actions Modal */}
                <div className={`transform transition-all duration-300 ease-in-out ${isActionsOpen
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
                    }`}>
                    <div className="z-1500 relative top-[100px] sm:top-0 sm:static bg-white/90 backdrop-blur-[15px] shadow-[0px_1px_25px_0px_#0000001A,0px_0px_3px_0px_#00000012] rounded-[20px] p-6 mx-auto sm:mx-0 w-[100%] sm:w-[390px] relative px-[20px] py-[50px] sm:px-[60px] sm:py-[50px] sm:pr-[30px]">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsActionsOpen(false)}
                            className="absolute top-4 right-[30px] text-red-400 rounded-full p-1 cursor-pointer transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className="flex flex-col gap-6 mt-2 items-center md:items-end">
                            <button
                                onClick={handleListRoomClick}
                                className="flex items-center justify-self-end justify-center shadow-[0px_0px_10px_0px_#660ED160] bg-[#FFBE06] text-black font-semibold px-8 py-3 rounded-full transition-all duration-200 cursor-pointer"
                            >
                                List your room
                            </button>
                            <Link
                                href="/rooms"
                                className="flex items-center justify-center shadow-[0px_0px_10px_0px_#660ED160] bg-[#10D1C1] text-black font-medium px-8 py-3 rounded-full transition-all duration-200"
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
                    className="group cursor-pointer bg-[#ffff] rounded-full shadow-lg transition-all duration-300 ease-in-out p-[5px] hover:pl-[17px] hover:pr-[5px] flex items-center"
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
                            <path d="M3.59697 20.9605C3.68157 20.8758 3.78203 20.8086 3.89261 20.7627C4.00319 20.7168 4.12172 20.6931 4.24145 20.693C4.36117 20.693 4.47974 20.7165 4.59039 20.7622C4.70103 20.8079 4.80159 20.875 4.8863 20.9596C4.97102 21.0442 5.03825 21.1447 5.08414 21.2553C5.13004 21.3658 5.1537 21.4844 5.15379 21.6041C5.15387 21.7238 5.13037 21.8424 5.08464 21.953C5.0389 22.0637 4.97181 22.1642 4.88721 22.249L2.15365 24.9825C1.9828 25.1536 1.75097 25.2498 1.50917 25.25C1.26738 25.2502 1.03542 25.1543 0.86432 24.9834C0.693224 24.8126 0.597007 24.5807 0.596836 24.339C0.596665 24.0972 0.692554 23.8652 0.863409 23.6941L3.59697 20.9605ZM12.7088 19.1382C12.8797 18.9671 13.1115 18.8708 13.3533 18.8707C13.5951 18.8705 13.8271 18.9664 13.9982 19.1372C14.1693 19.3081 14.2655 19.5399 14.2657 19.7817C14.2658 20.0235 14.1699 20.2555 13.9991 20.4266L9.43586 24.9825C9.26401 25.1485 9.03384 25.2403 8.79493 25.2383C8.55602 25.2362 8.32749 25.1404 8.15854 24.9714C7.9896 24.8025 7.89377 24.5739 7.8917 24.335C7.88962 24.0961 7.98147 23.8659 8.14745 23.6941L12.7088 19.1382ZM20.6143 11.5808C20.7286 11.5797 20.8403 11.6145 20.9338 11.6802C21.0273 11.7459 21.0978 11.8392 21.1355 11.9471L21.5875 13.343C21.7293 13.7668 21.9677 14.1517 22.284 14.4674C22.6003 14.7831 22.9858 15.0208 23.4098 15.1617L24.804 15.6137L24.8313 15.621C24.9115 15.6495 24.9841 15.6963 25.0432 15.7576C25.1024 15.8188 25.1466 15.8929 25.1723 15.9741C25.1981 16.0553 25.2047 16.1413 25.1917 16.2255C25.1787 16.3096 25.1464 16.3897 25.0974 16.4593C25.0317 16.5521 24.9387 16.6222 24.8313 16.6597L23.4372 17.1117C23.0135 17.2529 22.6284 17.4907 22.3124 17.8063C21.9964 18.122 21.7582 18.5068 21.6166 18.9304L21.1629 20.3263C21.1251 20.434 21.0549 20.5273 20.9618 20.5932C20.8688 20.6592 20.7575 20.6947 20.6435 20.6947C20.5294 20.6947 20.4182 20.6592 20.3251 20.5932C20.2321 20.5273 20.1618 20.434 20.1241 20.3263L19.6685 18.9304C19.528 18.5057 19.2905 18.1195 18.9748 17.8026C18.6591 17.4856 18.2739 17.2465 17.8498 17.1044L16.4557 16.6524C16.3754 16.6239 16.3029 16.5771 16.2437 16.5159C16.1846 16.4546 16.1404 16.3805 16.1146 16.2993C16.0889 16.2181 16.0822 16.1321 16.0952 16.0479C16.1082 15.9638 16.1405 15.8838 16.1896 15.8141C16.2553 15.7213 16.3483 15.6512 16.4557 15.6137L17.8498 15.1617C18.2684 15.017 18.6481 14.7775 18.9591 14.4621C19.2701 14.1466 19.5041 13.7637 19.643 13.343L20.0968 11.9452C20.1346 11.8383 20.2047 11.7458 20.2974 11.6805C20.3902 11.6152 20.5009 11.5803 20.6143 11.5808ZM9.97529 14.5804C10.06 14.4957 10.1606 14.4285 10.2713 14.3826C10.382 14.3368 10.5006 14.3132 10.6204 14.3132C10.7402 14.3132 10.8589 14.3368 10.9695 14.3826C11.0802 14.4285 11.1808 14.4957 11.2655 14.5804C11.3502 14.6651 11.4174 14.7657 11.4633 14.8764C11.5091 14.9871 11.5327 15.1057 11.5327 15.2255C11.5327 15.3453 11.5091 15.464 11.4633 15.5747C11.4174 15.6853 11.3502 15.7859 11.2655 15.8706L7.62078 19.5154C7.53618 19.6001 7.43572 19.6673 7.32514 19.7132C7.21456 19.7591 7.09603 19.7828 6.9763 19.7829C6.85658 19.783 6.73801 19.7595 6.62736 19.7137C6.51672 19.668 6.41617 19.6009 6.33145 19.5163C6.16035 19.3454 6.06413 19.1136 6.06396 18.8718C6.06388 18.7521 6.08738 18.6335 6.13311 18.5229C6.17885 18.4122 6.24594 18.3117 6.33054 18.227L9.97529 14.5804ZM5.41935 11.8468C5.50407 11.7621 5.60464 11.6949 5.71533 11.6491C5.82602 11.6032 5.94466 11.5796 6.06447 11.5796C6.18428 11.5796 6.30292 11.6032 6.41361 11.6491C6.5243 11.6949 6.62487 11.7621 6.70959 11.8468C6.79431 11.9315 6.86151 12.0321 6.90736 12.1428C6.95321 12.2535 6.97681 12.3721 6.97681 12.492C6.97681 12.6118 6.95321 12.7304 6.90736 12.8411C6.86151 12.9518 6.79431 13.0524 6.70959 13.1371L2.15365 17.693C1.98255 17.8641 1.7505 17.9602 1.50853 17.9602C1.26656 17.9602 1.03451 17.8641 0.863409 17.693C0.692313 17.5219 0.596191 17.2899 0.596191 17.0479C0.596191 16.8059 0.692313 16.5739 0.863409 16.4028L5.41935 11.8468ZM13.3175 0.646508C13.4772 0.645628 13.6331 0.694698 13.7635 0.78685C13.8939 0.879001 13.9922 1.00962 14.0447 1.16042L14.6788 3.11401C14.8758 3.70732 15.2087 4.24637 15.651 4.68809C16.0934 5.12981 16.6329 5.46197 17.2265 5.65804L19.1801 6.29405L19.2202 6.30316C19.3693 6.35735 19.4981 6.45611 19.5891 6.58603C19.6801 6.71595 19.729 6.87075 19.729 7.02938C19.729 7.18801 19.6801 7.3428 19.5891 7.47273C19.4981 7.60265 19.3693 7.70141 19.2202 7.7556L17.2666 8.39161C16.6727 8.58743 16.1328 8.91948 15.6901 9.36122C15.2474 9.80296 14.9142 10.3421 14.7171 10.9356L14.0829 12.8892C14.0431 13.0015 13.9779 13.103 13.8922 13.1858C13.8066 13.2686 13.703 13.3304 13.5895 13.3665C13.4759 13.4025 13.3556 13.4117 13.2379 13.3934C13.1202 13.3751 13.0084 13.3298 12.9111 13.261L12.871 13.2337C12.7578 13.1447 12.6735 13.0242 12.6287 12.8874L11.9945 10.9375C11.799 10.3421 11.4667 9.80089 11.0243 9.35719C10.5819 8.91348 10.0416 8.57965 9.4468 8.38249L7.49139 7.74648C7.34148 7.69312 7.21176 7.59467 7.12003 7.46464C7.02831 7.33462 6.97906 7.17939 6.97906 7.02027C6.97906 6.86114 7.02831 6.70592 7.12003 6.57589C7.21176 6.44587 7.34148 6.34742 7.49139 6.29405L9.44498 5.65804C10.0315 5.45691 10.5634 5.12249 10.9988 4.68106C11.4342 4.23963 11.7613 3.70322 11.9544 3.11401L12.5886 1.16042C12.6411 1.00932 12.7397 0.878495 12.8705 0.786317C13.0012 0.694139 13.1576 0.645246 13.3175 0.646508Z" fill="black" />
                        </svg>
                    </span>
                </button>
            </div>


            {/* List Room Modal */}
            <ListRoomModal
                isOpen={isListRoomModalOpen}
                onClose={() => setIsListRoomModalOpen(false)}
            />
        </footer>
    );
};

export default Footer;
