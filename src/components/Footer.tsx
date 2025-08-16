"use client";

import { FC } from "react";

const Footer: FC = () => {
  return (
    <footer className="bg-purple-600 text-white py-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo + Description */}
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-3xl">🏠</span>
            <span>
              gc<span className="font-normal">rooms</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-200 max-w-xs">
            We guide our clients through every step of the buying and selling process.
          </p>
          {/* Social Icons */}
          <div className="flex gap-4 mt-4 text-xl">
            <a href="#" className="hover:text-gray-300">
            </a>
            <a href="#" className="hover:text-gray-300">
            </a>
            <a href="#" className="hover:text-gray-300">
            </a>
            <a href="#" className="hover:text-gray-300">
            </a>
          </div>
        </div>

        {/* More Links */}
        <div>
          <h3 className="font-semibold mb-3">More Links</h3>
          <ul className="space-y-2 text-sm text-gray-100">
            <li><a href="#">List Your Rooms</a></li>
            <li><a href="#">View All Apartments</a></li>
            <li><a href="#">View All Apartments</a></li>
          </ul>
        </div>

        {/* Why Gcrooms */}
        <div>
          <h3 className="font-semibold mb-3">Why Gcrooms</h3>
          <ul className="space-y-2 text-sm text-gray-100">
            <li><a href="#">List Your Rooms</a></li>
            <li><a href="#">View All Apartments</a></li>
            <li><a href="#">View All Apartments</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-3">Get In Touch</h3>
          <ul className="space-y-2 text-sm text-gray-100">
            <li>+234 812 3456 789</li>
            <li>support@gcrooms.com</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-400 mt-10 pt-4 text-center text-sm text-gray-200">
        © {new Date().getFullYear()} Gcrooms. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
