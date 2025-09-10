"use client";

import Link from "next/link";
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { createClient } from '@supabase/supabase-js';
import ListRoomModal from "./ListRoomModal";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface Room {
  building_type: string;
  id: string;
  property_title: string;
  location: string;
  price: number;
  bathrooms: number;
  bedrooms: number;
  room_size: number;
  room_img_1?: string;
  state: string;
  is_verified: string;
  profile_image?: string;
}

// Generate URL slug from property title
const generateSlug = (title: string, id: string): string => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return `${slug}-${id}`;
};

export default function ListingSection() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Format price to display in K format
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `₦${(price / 1000).toFixed(0)}K`;
    }
    return `₦${price}`;
  };

  // Fetch rooms from Supabase
  useEffect(() => {
    const fetchRooms = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_verified', 'verified')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching rooms:', error);
        } else {
          setRooms(data || []);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <section className="bg-white md:pt-[70px] pt-[30px]">
      <div className="mx-auto w-[90%] max-w-[1165px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left Side - Main Headline */}
          <div className="text-center lg:text-left">
            <h2 className="md:text-[40px] text-[32px] lg:text-5xl font-bold text-black leading-tight">
              Finding roommates should never be tough!
            </h2>
          </div>

          {/* Right Side - Supporting Text and Buttons */}
          <div className="space-y-[12px]">
            <p className="text-[16px] text-center lg:text-left text-[#000] leading-relaxed">
              We guide our clients through every step of the buying and selling process.
            </p>

            <div className="flex flex-col sm:flex-row gap-[30px] items-center justify-center lg:justify-start">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex border border-[#FFBE06] items-center justify-center rounded-full bg-[#FFBE06] text-black text-[16px] px-[30px] py-3 transition w-full md:w-auto"
                style={{
                  boxShadow: "0px 0px 10px 0px #660ED180"
                }}
              >
                List your room
              </button>
              <Link
                href="#view-apartments"
                className="inline-flex border-[1.5px] border-[#10D1C1] items-center justify-center rounded-full text-black px-6 py-3 transition w-full md:w-auto"
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

      {/* Room Listings Section */}
      <div className="mt-[75px] mx-auto w-[90%] max-w-[1320px]">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : rooms.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 15,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="rooms-swiper"
          >
            {rooms.map((room) => (
              <SwiperSlide key={room.id}>
                <Link href={`/rooms/${generateSlug(room.property_title, room.id)}`} className="block">
                  <div className="group bg-white min-h-[391px] h-[391px] rounded-[15px] p-[15px] pb-[10px] shadow-[0px_1px_15px_0px_#0000001A] overflow-hidden my-3 cursor-pointer">
                    <div className="absolute top-[35px] rounded-[5px] right-[25px] z-20 flex items-center justify-center gap-[5px] bg-[#FFFFFFE5] px-[10px] py-[7px]">
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 7.58337C6.9665 7.58337 7.75 6.79987 7.75 5.83337C7.75 4.86688 6.9665 4.08337 6 4.08337C5.0335 4.08337 4.25 4.86688 4.25 5.83337C4.25 6.79987 5.0335 7.58337 6 7.58337Z" stroke="#111111" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.00004 1.16669C4.76236 1.16669 3.57538 1.65835 2.70021 2.53352C1.82504 3.40869 1.33337 4.59568 1.33337 5.83335C1.33337 6.93702 1.56787 7.65919 2.20837 8.45835L6.00004 12.8334L9.79171 8.45835C10.4322 7.65919 10.6667 6.93702 10.6667 5.83335C10.6667 4.59568 10.175 3.40869 9.29987 2.53352C8.4247 1.65835 7.23772 1.16669 6.00004 1.16669Z" stroke="#111111" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>

                      <span className="text-[12px] text-black">{room.state.trim().replace(/\b\w/g, (char) => char.toUpperCase())}</span>
                    </div>
                    {/* Room Image */}
                    <div className="relative transition-all duration-300 overflow-hidden rounded-lg">
                      {room.room_img_1 ? (
                        <div className="w-full h-60 object-cover transition-all duration-500 group-hover:h-35" style={{
                          backgroundImage: `url(${room.room_img_1})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-[10px] left-[10px] w-[40px] h-[40px] rounded-[50%] bg-[#FFBE06]/10 flex items-center justify-center" style={{
                        backgroundImage: `url(${room.profile_image || '/images/rooms-page-logo.svg'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}>
                      </div>

                      {/* Overlay */}
                      <div className="absolute top-0 left-0 w-full h-full bg-[#FFBE06]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-[#10D1C1] text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
                          <span>Go to property</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="pt-[15px]">
                      <h4 className="font-semibold text-lg text-black mb-[20px] pl-[5px]">
                        {room.property_title.length > 20
                          ? room.property_title.substring(0, 20) + "..."
                          : room.property_title}
                      </h4>

                      <div className="flex items-end h-[45px] justify-between transition-all group-hover:flex-col group-hover:items-start">
                        {/* Price - moves up and expands on hover */}
                        <div className="">
                          <div className="bg-[#FFBE06] text-[16px] text-black px-[25px] py-[10px] rounded-full font-semibold group-hover:px-[35px] group-hover:min-w-[120px] transition-all duration-500 ease-in-out">
                            <span className="group-hover:hidden">{formatPrice(room.price)}</span>
                            <span className="hidden group-hover:inline">₦{room.price.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Room Details - slide in on hover */}

                        <div className="flex flex-col relative right-[30px] lg:right-[45px] top-[85px] group-hover:right-[0px] group-hover:top-0 group-hover:mt-[20px] items-end w-[100%] group-hover:items-end gap-[30px] group-hover:gap-[10px]">
                          <div className="flex items-center justify-between group-hover:justify-end group-hover:w-[100%]">
                            <div className="flex items-center space-x-[10px] text-sm text-gray-600">
                              {/* Bathrooms */}
                              <div className="group flex items-center space-x-1 bg-[#F5D4FF] p-[11px] text-black rounded-[5px] transition-all duration-300">
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M5.625 6.25V5C5.625 4.66848 5.7567 4.35054 5.99112 4.11612C6.22554 3.8817 6.54348 3.75 6.875 3.75H10.625C10.9565 3.75 11.2745 3.8817 11.5089 4.11612C11.7433 4.35054 11.875 4.66848 11.875 5V6.25M4.375 6.25H13.125"
                                    stroke="#111111"
                                    strokeWidth="1.1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M1.875 13.75V2.5C1.875 2.16848 2.0067 1.85054 2.24112 1.61612C2.47554 1.3817 2.79348 1.25 3.125 1.25H7.5C7.83152 1.25 8.14946 1.3817 8.38388 1.61612C8.6183 1.85054 8.75 2.16848 8.75 2.5V3.75M6.25 8.75H6.25625M8.75 8.75H8.75625M11.25 8.75H11.2562M5.625 11.25H5.63125M8.75 11.25H8.75625M11.875 11.25H11.8812M5 13.75H5.00625M8.75 13.75H8.75625M12.5 13.75H12.5062"
                                    stroke="#111111"
                                    strokeWidth="1.1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>

                                <span className="text-[12px]">{room.bathrooms}</span>

                                {/* Sliding text */}
                                <span
                                  className="overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-300 ease-in-out ml-1 text-xs inline-block transform translate-x-2 group-hover:translate-x-0"
                                >
                                  Bathrooms
                                </span>
                              </div>

                              {/* Bedrooms */}
                              <div className="group flex items-center space-x-1 bg-[#F5D4FF] p-[11px] text-black rounded-[5px] transition-all duration-300">
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M2.5 11.25V8.75C2.5 8.41848 2.6317 8.10054 2.86612 7.86612C3.10054 7.6317 3.41848 7.5 3.75 7.5H11.25C11.5815 7.5 11.8995 7.6317 12.1339 7.86612C12.3683 8.10054 12.5 8.41848 12.5 8.75V11.25M1.25 13.75H13.75M3.75 7.5V3.75C3.75 3.41848 3.8817 3.10054 4.11612 2.86612C4.35054 2.6317 4.66848 2.5 5 2.5H10C10.3315 2.5 10.6495 2.6317 10.8839 2.86612C11.1183 3.10054 11.25 3.41848 11.25 3.75V7.5"
                                    stroke="#111111"
                                    strokeWidth="1.1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>

                                <span className="text-[12px]">{room.bedrooms}</span>

                                {/* Sliding text */}
                                <span
                                  className="overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-300 ease-in-out ml-1 text-xs inline-block transform translate-x-2 group-hover:translate-x-0"
                                >
                                  Bedrooms
                                </span>
                              </div>
                            </div>
                          </div>


                          <div className="flex items-center justify-between group-hover:justify-end group-hover:w-[100%]">
                            <div className="flex items-center space-x-[10px] text-sm text-gray-600">
                              {/* Bathrooms */}
                              <div className="group flex items-center space-x-1 bg-[#F5D4FF] p-[11px] text-black rounded-[5px] transition-all duration-300">
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M5.625 6.25V5C5.625 4.66848 5.7567 4.35054 5.99112 4.11612C6.22554 3.8817 6.54348 3.75 6.875 3.75H10.625C10.9565 3.75 11.2745 3.8817 11.5089 4.11612C11.7433 4.35054 11.875 4.66848 11.875 5V6.25M4.375 6.25H13.125"
                                    stroke="#111111"
                                    strokeWidth="1.1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M1.875 13.75V2.5C1.875 2.16848 2.0067 1.85054 2.24112 1.61612C2.47554 1.3817 2.79348 1.25 3.125 1.25H7.5C7.83152 1.25 8.14946 1.3817 8.38388 1.61612C8.6183 1.85054 8.75 2.16848 8.75 2.5V3.75M6.25 8.75H6.25625M8.75 8.75H8.75625M11.25 8.75H11.2562M5.625 11.25H5.63125M8.75 11.25H8.75625M11.875 11.25H11.8812M5 13.75H5.00625M8.75 13.75H8.75625M12.5 13.75H12.5062"
                                    stroke="#111111"
                                    strokeWidth="1.1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>

                                <span className="text-[12px]">{room.building_type}</span>

                                {/* Sliding text */}
                                <span
                                  className="overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-300 ease-in-out ml-1 text-xs inline-block transform translate-x-2 group-hover:translate-x-0"
                                >
                                </span>
                              </div>

                              {/* Bedrooms */}
                              <div className="group flex items-center space-x-1 bg-[#F5D4FF] p-[11px] text-black rounded-[5px] transition-all duration-300">
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M2.5 11.25V8.75C2.5 8.41848 2.6317 8.10054 2.86612 7.86612C3.10054 7.6317 3.41848 7.5 3.75 7.5H11.25C11.5815 7.5 11.8995 7.6317 12.1339 7.86612C12.3683 8.10054 12.5 8.41848 12.5 8.75V11.25M1.25 13.75H13.75M3.75 7.5V3.75C3.75 3.41848 3.8817 3.10054 4.11612 2.86612C4.35054 2.6317 4.66848 2.5 5 2.5H10C10.3315 2.5 10.6495 2.6317 10.8839 2.86612C11.1183 3.10054 11.25 3.41848 11.25 3.75V7.5"
                                    stroke="#111111"
                                    strokeWidth="1.1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>

                                <span className="text-[12px]">{room.room_size}</span>

                                {/* Sliding text */}
                                <span
                                  className="text-[12px]"
                                >
                                  Sq Ft
                                </span>
                              </div>
                            </div>
                          </div>


                        </div>



                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No rooms available at the moment. Check back soon!
            </p>
          </div>
        )}
      </div>
      <ListRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
