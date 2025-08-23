"use client";

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ListRoomModal from "@/components/ListRoomModal";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase environment variables are not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface RoomSuggestion {
  id: number;
  property_title: string;
  location: string;
  state: string;
  price: number;
  bathrooms: number;
  bedrooms: number;
  room_img_1: string;
  room_img_2?: string;
  room_img_3?: string;
  room_img_4?: string;
  room_img_5?: string;
  building_type: string;
  room_size: number;
  is_verified: string;
}

interface SearchSuggestion {
  id: number;
  property_title: string;
  location: string;
  state: string;
  is_verified: string;
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
export default function RoomsPage() {

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roomSuggestions, setRoomSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allRooms, setAllRooms] = useState<RoomSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [imageIndexByRoom, setImageIndexByRoom] = useState<Record<number, number>>({});

  // Background images for carousel
  const backgroundImages = [
    '/images/whyus-img.png',
    '/images/whyus-img-2.jpg', // Add your second image
    '/images/whyus-img-3.jpg'  // Add your third image
  ];
  useEffect(() => {
    const startCarousel = () => {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % backgroundImages.length
        );
      }, 3000); // 3 seconds
    };

    startCarousel();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [backgroundImages.length]);

  // Format price to display in K format
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `₦${(price / 1000).toFixed(0)}K`;
    }
    return `₦${price}`;
  };

  // Fetch all rooms for the grid
  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_verified', 'verified')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching all rooms:', error);
        } else {
          setAllRooms(data || []);
        }
      } catch (error) {
        console.error('Error fetching all rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRooms();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  // Search for rooms in database by location or state
  const searchRooms = async (query: string) => {
    if (query.length < 2) {
      setRoomSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, property_title, location, state, is_verified')
        .eq('is_verified', 'verified')
        .or(`location.ilike.%${query}%,state.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Error searching rooms:', error);
        setRoomSuggestions([]);
      } else {
        setRoomSuggestions(data || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching rooms:', error);
      setRoomSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setRoomSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchRooms(value);
    }, 300);
  };

  // Handle room selection
  const handleRoomSelect = (room: SearchSuggestion) => {
    setSearchQuery(room.property_title);
    setShowSuggestions(false);

    // Navigate to room details page with slug
    const slug = generateSlug(room.property_title, room.id.toString());
    router.push(`/rooms/${slug}`);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <section className="relative overflow-hidden text-white lg:h-[500px] h-[350px]" style={{
        backgroundImage: "url(/images/room-banner-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        {/* Animated Background Balls */}
        <div className="absolute top-0 inset-0 overflow-hidden pointer-events-none">
          {/* Add your animated background content here */}
        </div>
        <div className="w-[90%] max-w-[1300px] mx-auto rounded-[20px] mt-[60px] md:mt-[120px]">
          <div className="flex items-center justify-center gap-[20px] pl-[15px] pr-[15px] py-[15px] md:pl-[40px] md:pr-[20px] md:py-[20px]">
            <div className="w-[100%] flex items-center flex-col">
              <h2 className="lg:text-[54px] md:text-[42px] lg:w-[850px] w-[100%] text-[30px] font-extrabold text-black leading-tight text-center">Browse through all rooms</h2>
              <div className="relative lg:w-[470px] max-w-[470px] w-[100%] mt-[20px] md:mt-[40px]" ref={dropdownRef}>
                <div className="flex items-center rounded-full bg-white border-1 border-[#fff] overflow-hidden p-1"
                  style={{
                    boxShadow: "0px 0px 10px 0px #660ED180",
                  }}>
                  <input
                    type="text"
                    placeholder="Enter your location or state"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="flex-1 md:px-4 md:py-2 px-2 py-1 outline-none text-gray-800 bg-transparent text-[12px] md:text-[14px]"
                  />
                  <button className="bg-[#10D1C1] hover:bg-[#10D1C1] border-1 border-[#07C3B3] cursor-pointer text-black px-[10px] py-[5px] md:px-[20px] md:py-[10px] rounded-full transition-colors text-[11px] md:text-[14px]"
                    style={{
                      boxShadow: "0px 0px 10px 0px #660ED180",
                    }}
                  >
                    Search apartments
                  </button>
                </div>

                {/* Room Suggestions Dropdown */}
                {(showSuggestions || isLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    ) : roomSuggestions.length > 0 ? (
                      roomSuggestions.map((room) => (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => handleRoomSelect(room)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-black border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm">{room.property_title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {room.location}, {room.state}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        No rooms found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Rooms Grid Section */}
      <section className="bg-white pt-[70px]">
        <div className="mx-auto w-[90%] max-w-[1300px]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ) : allRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[15px] gap-y-[15px] xl:gap-x-[10px] xl:gap-y-[50px]">
              {allRooms.map((room) => {
                const images = [
                  room.room_img_1,
                  room.room_img_2,
                  room.room_img_3,
                  room.room_img_4,
                  room.room_img_5,
                ].filter(Boolean) as string[];
                const idx = imageIndexByRoom[room.id] ?? 0;
                const currentImg = images[idx] || room.room_img_1;

                const goPrev = (e: any) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (images.length === 0) return;
                  setImageIndexByRoom((prev) => ({
                    ...prev,
                    [room.id]: (idx - 1 + images.length) % images.length,
                  }));
                };

                const goNext = (e: any) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (images.length === 0) return;
                  setImageIndexByRoom((prev) => ({
                    ...prev,
                    [room.id]: (idx + 1) % images.length,
                  }));
                };

                return (
                <Link key={room.id} href={`/rooms/${generateSlug(room.property_title, room.id.toString())}`} className="block">
                  <div className="relative bg-white min-h-[391px] h-[391px] rounded-[15px] p-[15px] pb-[10px] shadow-[0px_1px_15px_0px_#0000001A] overflow-hidden cursor-pointer">
                    {/* Image controls - replace state badge */}
                    <div className="absolute top-[18px] right-[18px] z-20 flex items-center gap-[5px] bg-[#FFFFFFE5] px-[5px] py-[5px] rounded-full">
                      <button onClick={goPrev} className="w-6 h-6 rounded-full bg-black/90 text-white flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button onClick={goNext} className="w-6 h-6 rounded-full bg-black/90 text-white flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>

                    

                    {/* Room Image */}
                    <div className="relative transition-all duration-300 overflow-hidden rounded-lg">
                      {room.room_img_1 ? (
                        <div className="w-full h-60 object-cover transition-all duration-500 group-hover:h-35" style={{
                          backgroundImage: `url(${currentImg})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}>
                        </div>
                      ) : (
                        <div className="w-full h-60 flex items-center justify-center bg-gray-100">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
<div className="absolute bottom-[5px] rounded-[5px] right-[5px] z-20 flex items-center justify-center gap-[5px] bg-[#FFFFFFE5] px-[10px] py-[7px]">
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 7.58337C6.9665 7.58337 7.75 6.79987 7.75 5.83337C7.75 4.86688 6.9665 4.08337 6 4.08337C5.0335 4.08337 4.25 4.86688 4.25 5.83337C4.25 6.79987 5.0335 7.58337 6 7.58337Z" stroke="#111111" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M6.00004 1.16669C4.76236 1.16669 3.57538 1.65835 2.70021 2.53352C1.82504 3.40869 1.33337 4.59568 1.33337 5.83335C1.33337 6.93702 1.56787 7.65919 2.20837 8.45835L6.00004 12.8334L9.79171 8.45835C10.4322 7.65919 10.6667 6.93702 10.6667 5.83335C10.6667 4.59568 10.175 3.40869 9.29987 2.53352C8.4247 1.65835 7.23772 1.16669 6.00004 1.16669Z" stroke="#111111" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

                    <span className="text-[12px] text-black">{room.state.trim().replace(/\b\w/g, (char) => char.toUpperCase())}</span>
                  </div>
                      {/* Overlay */}
                      {/* <div className="absolute top-0 left-0 w-full h-full bg-[#FFBE06]/10 opacity-100 flex items-center justify-center">
                        <Link
                          href={`/rooms/${generateSlug(room.property_title, room.id.toString())}`}
                          className="bg-[#10D1C1] text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <span>Go to property</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div> */}
                    </div>

                    {/* Room Details */}
                    <div className="pt-[15px]">
                      <h4 className="font-semibold text-lg text-black mb-[20px]">
                        {room.property_title}
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
                                {/* <span className="overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-300 ease-in-out ml-1 text-xs inline-block transform translate-x-2 group-hover:translate-x-0">
                                  Bathrooms
                                </span> */}
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
                                {/* <span className="overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-300 ease-in-out ml-1 text-xs inline-block transform translate-x-2 group-hover:translate-x-0">
                                  Bedrooms
                                </span> */}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between group-hover:justify-end group-hover:w-[100%]">
                            <div className="flex items-center space-x-[10px] text-sm text-gray-600">
                              {/* Building Type */}
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
                              </div>

                              {/* Room Size */}
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
                                <span className="text-[12px]">Sq Ft</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No rooms available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>


      <div className="w-[90%] max-w-[1300px] mx-auto rounded-[20px] mt-[30px] mb-[30px] md:mt-[70px] md:mb-[70px]" style={{
        background: "linear-gradient(92.93deg, #9B30DF 0.5%, rgba(102, 14, 209, 0.8) 131.44%)",
      }}>
        <div className="flex items-center gap-[20px] pl-[15px] pr-[15px] py-[15px] md:pl-[40px] md:pr-[20px] md:py-[20px]">
          <div className="">
            <h2 className="lg:text-[36px] md:text-[32px] lg:w-[450px] w-[100%] text-[26px] font-bold text-white leading-tight">Diverse rooms suited to your style or pocket</h2>
            {/* <div className="relative lg:w-[470px] max-w-[470px] w-[100%] mt-[20px] md:mt-[50px]" ref={dropdownRef}> */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex border border-[#FFBE06] items-center justify-center rounded-full bg-[#FFBE06] text-black text-[16px] px-[30px] py-3 transition mt-[40px]"
              style={{
                boxShadow: "0px 0px 10px 0px #660ED180"
              }}
            >
              List your room
            </button>

          </div>
          <div className="relative h-[300px] w-[100%] rounded-tr-[10px] rounded-br-[10px] hidden lg:flex overflow-hidden">
            {/* Background Images with Transition */}
            {backgroundImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                style={{
                  backgroundImage: `url('${image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}

            {/* Vertical Pagination Bars with Timer */}
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
              {backgroundImages.map((_, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    // Reset interval when manually clicked
                    if (intervalRef.current) {
                      clearInterval(intervalRef.current);
                      intervalRef.current = setInterval(() => {
                        setCurrentImageIndex((prevIndex) =>
                          (prevIndex + 1) % backgroundImages.length
                        );
                      }, 4000);
                    }
                  }}
                >
                  {/* Background bar */}
                  <div className={`bg-white/50 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'w-[7px] h-[50px]' : 'w-[7px] h-[20px]'
                    }`} />

                  {/* Active bar with draining animation */}
                  {index === currentImageIndex && (
                    <div className="absolute top-0 left-0 w-[7px] h-[50px] bg-[#FFBE06] rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-[#FFBE06] rounded-full animate-drain" />
                    </div>
                  )}

                  {/* Static active bar */}
                  <div className={`absolute top-0 left-0 rounded-full transition-all duration-300 ${index === currentImageIndex
                      ? 'w-[7px] h-[50px] bg-[#FFBE06]/20'
                      : 'w-[7px] h-[20px] bg-white/70'
                    }`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ListRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />  

    </>
  );

}

