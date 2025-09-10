'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Room {
  id: number;
  property_title: string;
  location: string;
  state: string;
  price: number;
  duration: string;
  bedrooms: number;
  bathrooms: number;
  building_type: string;
  room_size: number;
  furnishing?: string[];
  description?: string;
  full_name: string;
  email_address: string;
  phone_number: string;
  gender: string;
  profile_image?: string;
  room_img_1?: string;
  room_img_2?: string;
  room_img_3?: string;
  room_img_4?: string;
  room_img_5?: string;
}

interface RoomPageProps {
  params: Promise<{ slug: string; }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      const roomId = resolvedParams.slug.split('-').pop();
      
      if (roomId) {
        const { data } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        setRoom(data);
      }
    }
    getParams();
  }, [params]);

  if (!room) return <div className="flex justify-center items-center py-12 h-[100vh]">
  <div className="flex space-x-2">
    <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
</div>;

  const images = [room.room_img_1, room.room_img_2, room.room_img_3, room.room_img_4, room.room_img_5].filter(Boolean);

  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Sidebar - Sticky Images */}
          <div className="lg:sticky lg:top-10 lg:h-fit">
            <div className="bg-white rounded-2xl">
              {images.length > 0 && (
                <div className="relative h-[400px] rounded-lg" style={{
                  backgroundImage: `url(${images[currentImageIndex]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                  <div className="absolute top-4 right-4 bg-white/90 px-[10px] py-[8px] rounded-full flex items-center gap-[5px]">
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 7.58337C6.9665 7.58337 7.75 6.79987 7.75 5.83337C7.75 4.86688 6.9665 4.08337 6 4.08337C5.0335 4.08337 4.25 4.86688 4.25 5.83337C4.25 6.79987 5.0335 7.58337 6 7.58337Z" stroke="#111111" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.00004 1.16669C4.76236 1.16669 3.57538 1.65835 2.70021 2.53352C1.82504 3.40869 1.33337 4.59568 1.33337 5.83335C1.33337 6.93702 1.56787 7.65919 2.20837 8.45835L6.00004 12.8334L9.79171 8.45835C10.4322 7.65919 10.6667 6.93702 10.6667 5.83335C10.6667 4.59568 10.175 3.40869 9.29987 2.53352C8.4247 1.65835 7.23772 1.16669 6.00004 1.16669Z" stroke="#111111" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>

                      <span className="text-[12px] text-black">{room.state.trim().replace(/\b\w/g, (char: string) => char.toUpperCase())}</span>
                  </div>
                </div>
              )}
              
              {images.length > 1 && (
                <div className="py-2">
                  <div className="grid grid-cols-5 gap-2">
                    {images.slice(0, 5).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative h-20 rounded-lg overflow-hidden ${
                          idx === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <Image
                          src={img || ''}
                          alt={`Room ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Scrollable */}
          <div className="space-y-2">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 py-2">
              <div className="flex items-center gap-4 mb-4">
                {room.profile_image && (
                  <Image
                    src={room.profile_image}
                    alt="Profile"
                    width={90}
                    height={90}
                    className="rounded-full w-[90px] h-[90px]"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-[36px] leading-[120%] font-semibold text-black mb-2">
                    {room.property_title}
                  </h1>
                  
                </div>
                
              </div>
              <div className="flex items-center text-black mb-[20px] gap-[10px] border-[0.5px] border-[#00000033] px-[20px] py-[10px] rounded-full max-w-[500px]">
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 7.58337C6.9665 7.58337 7.75 6.79987 7.75 5.83337C7.75 4.86688 6.9665 4.08337 6 4.08337C5.0335 4.08337 4.25 4.86688 4.25 5.83337C4.25 6.79987 5.0335 7.58337 6 7.58337Z" stroke="#111111" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.00004 1.16669C4.76236 1.16669 3.57538 1.65835 2.70021 2.53352C1.82504 3.40869 1.33337 4.59568 1.33337 5.83335C1.33337 6.93702 1.56787 7.65919 2.20837 8.45835L6.00004 12.8334L9.79171 8.45835C10.4322 7.65919 10.6667 6.93702 10.6667 5.83335C10.6667 4.59568 10.175 3.40869 9.29987 2.53352C8.4247 1.65835 7.23772 1.16669 6.00004 1.16669Z" stroke="#111111" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    {room.location}
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-[#FFBE06] text-black text-[16px] px-[25px] py-[10px] rounded-full font-bold">
                      ₦{room.price?.toLocaleString()}
                    </span>
                    <span className="bg-[#10D1C159] text-black text-[16px] px-[25px] py-[10px] rounded-full font-normal">
                      {room.duration}
                    </span>
                  </div>
            </div>

            {/* Overview */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-[24px] font-semibold text-black tracking-wide mb-[20px]">Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-100 p-3 rounded-lg flex items-center gap-2">
                  <span className="text-sm">🏠 {room.building_type}</span>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg flex items-center gap-2">
                  <span className="text-sm">🛏️ {room.bedrooms} Bedrooms</span>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg flex items-center gap-2">
                  <span className="text-sm">🚿 {room.bathrooms} Bathrooms</span>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg flex items-center gap-2">
                  <span className="text-sm">📐 {room.room_size} sq ft</span>
                </div>
                {room.furnishing?.length !== undefined && room.furnishing?.length > 0 && (
                  <div className="bg-purple-100 p-3 rounded-lg flex items-center gap-2">
                    <span className="text-sm">🪑 Furnished</span>
                  </div>
                )}
                <div className="bg-purple-100 p-3 rounded-lg flex items-center gap-2">
                  <span className="text-sm">📶 Wi-fi Zone</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {room.description || "Property agents are well-educated professionals who play a pivotal role in the real estate industry. They acquire the necessary knowledge and skills through formal education, licensing, and ongoing training. By combining their educational background with practical experience, property agents assist clients in achieving their real estate goals while adhering to ethical and legal standards. make it brief"}
              </p>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {room.full_name}</p>
                <p><strong>Email:</strong> {room.email_address}</p>
                <p><strong>Phone:</strong> {room.phone_number}</p>
                <p><strong>Gender:</strong> {room.gender}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
