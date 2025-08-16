"use client";

import Link from "next/link";
import { FC } from "react";
import Image from "next/image";

const Footer: FC = () => {
    return (
        <footer className="bg-purple-600 text-white py-10 px-0 md:px-20 pt-[70px]">
            <div className="max-w-[1300px] mx-auto flex md:flex-row flex-col gap-[30px] justify-between items-start px-4">
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
        </footer>
    );
};

export default Footer;
