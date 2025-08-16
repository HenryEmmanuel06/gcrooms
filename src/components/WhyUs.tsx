"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

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

export default function WhyUs() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roomSuggestions, setRoomSuggestions] = useState<RoomSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        .select('id, property_title, location, state')
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
  const handleRoomSelect = (room: RoomSuggestion) => {
    setSearchQuery(room.property_title);
    setShowSuggestions(false);
    
    // Navigate to room details page with slug
    const slug = generateSlug(room.property_title, room.id.toString());
    router.push(`/rooms/${slug}`);
  };
  return (
    <section className="bg-white py-23 sm:py-20" style={{
      backgroundImage: "url('images/why-us-bg.svg')",
      backgroundSize: "cover",
      backgroundPositionX: "center",
      backgroundPositionY: "-200px",
      backgroundRepeat: "no-repeat",
    }}>
      <div className="mx-auto w-[90%] max-w-[1155px]">
        {/* Section Title */}
        <h2 className="text-[40px] sm:text-5xl font-bold text-black text-center mb-[60px] pt-15">
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

      <div className="w-[90%] max-w-[1300px] mx-auto rounded-[20px] mt-[120px]" style={{
        background: "linear-gradient(92.93deg, #9B30DF 0.5%, rgba(102, 14, 209, 0.8) 131.44%)",
      }}>
        <div className="flex items-center gap-[20px] pl-[40px] pr-[20px] py-[20px]">
          <div className="">
            <h2 className="text-[36px] w-[600px] sm:text-5xl font-bold text-white">Diverse rooms suited to your style or pocket</h2>
            <div className="relative max-w-[470px] mt-[50px]" ref={dropdownRef}>
              <div className="flex items-center rounded-full bg-white border-1 border-[#fff] overflow-hidden p-1"
              style={{
                boxShadow: "0px 0px 10px 0px #660ED180",
              }}>
                  <input
                    type="text"
                    placeholder="Enter your location or state"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="flex-1 px-4 py-2 outline-none text-gray-800 bg-transparent"
                  />
                  <button className="bg-[#10D1C1] hover:bg-[#10D1C1] border-1 border-[#07C3B3] cursor-pointer text-black px-[20px] py-[10px] rounded-full transition-colors text-[14px]"
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
          <div className="h-[250px] w-[100%] rounded-tr-[10px] rounded-br-[10px] hidden lg:flex" style={{
            backgroundImage: "url('/images/whyus-img.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>

          </div>
        </div>
      </div>
    </section>
  );
}
