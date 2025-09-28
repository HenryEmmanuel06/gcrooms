'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import MapComponent from '@/components/MapComponent';
import ListRoomModal from '@/components/ListRoomModal';
import ConnectForm from '@/components/ConnectForm';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Room {
  id: number;
  property_title: string;
  location: string;
  latitude?: string;
  longitude?: string;
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
  about_self?: string;
  likes?: string;
  dislikes?: string;
  potrait_img_1?: string;
  potrait_img_2?: string;
}

interface RoomPageProps {
  params: Promise<{ slug: string; }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const backgroundImages = [
    '/images/whyus-img.png',
    '/images/whyus-img-2.jpg', // Add your second image
    '/images/whyus-img-3.jpg'  // Add your third image
  ];

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

  // Background image rotation effect
  useEffect(() => {
    // Auto-rotate the CTA background carousel using currentImageIndex
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % backgroundImages.length
      );
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [backgroundImages.length]);

  if (!room) return <div className="flex justify-center items-center py-12 h-[100vh]">
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  </div>;

  const images = [room.room_img_1, room.room_img_2, room.room_img_3, room.room_img_4, room.room_img_5].filter(Boolean);

  return (
    <>
    <div className="pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] sm:gap-[50px]">
          {/* Left Sidebar - Sticky Images */}
          <div className="lg:sticky lg:top-10 lg:h-fit">
            <div className="bg-white rounded-2xl">
              {images.length > 0 && (
                <div className="relative h-[400px] rounded-lg overflow-hidden bg-gray-100">
                  {/* Crossfade layers */}
                  <div className="absolute inset-0">
                    {images.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img || ''}
                        alt={`Room ${idx + 1}`}
                        fill
                        className={`object-cover transition-opacity duration-700 ease-in-out ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                        priority={idx === 0}
                      />
                    ))}
                  </div>

                  {/* State badge */}
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
                        className={`relative h-20 rounded-lg overflow-hidden cursor-pointer ${idx === currentImageIndex ? 'ring-2 ring-[#FFBE06]' : ''
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
            <div className="bg-white rounded-2xl p-6 py-2 px-0">
              <div className="flex items-center gap-4 mb-4">
                {room.profile_image && (
               <div className="rounded-full w-[60px] h-[60px] sm:w-[90px] sm:h-[90px]" style={{
                backgroundImage: `url(${room.profile_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
               }}>
                </div>
                )}
                <div className="flex-1">
                  <h1 className="text-[24px] sm:text-[36px] leading-[120%] font-semibold text-black mb-2">
                    {room.property_title}
                  </h1>

                </div>

              </div>
              <div className="flex items-start sm:items-center text-black mb-[20px] gap-[10px] border-[0.5px] border-[#00000033] px-[20px] py-[10px] rounded-full max-w-[600px] text-[12px] sm:text-[16px]">
              <span className='pt-[5px]'>
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 7.58337C6.9665 7.58337 7.75 6.79987 7.75 5.83337C7.75 4.86688 6.9665 4.08337 6 4.08337C5.0335 4.08337 4.25 4.86688 4.25 5.83337C4.25 6.79987 5.0335 7.58337 6 7.58337Z" stroke="#111111" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.00004 1.16669C4.76236 1.16669 3.57538 1.65835 2.70021 2.53352C1.82504 3.40869 1.33337 4.59568 1.33337 5.83335C1.33337 6.93702 1.56787 7.65919 2.20837 8.45835L6.00004 12.8334L9.79171 8.45835C10.4322 7.65919 10.6667 6.93702 10.6667 5.83335C10.6667 4.59568 10.175 3.40869 9.29987 2.53352C8.4247 1.65835 7.23772 1.16669 6.00004 1.16669Z" stroke="#111111" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
               </span>
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
            <div className="bg-white pt-[10px] sm:pt-[20px]">
              <h2 className="text-[20px] sm:text-[24px] font-semibold text-black tracking-wide mb-[20px]">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 shadow-[0px_1px_25px_0px_#0000001A,0px_0px_3px_0px_#00000012] rounded-[15px] bg-[#F5D4FF] px-[5px] py-[15px] sm:px-[35px] sm:py-[30px]">
                <div className="p-3 pr-0 rounded-lg flex items-center gap-2">
                  <span className="text-[16px] tracking-wide flex items-center gap-[10px]"><svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.9999 5.99999C13.9999 5.80108 13.9209 5.61031 13.7803 5.46966C13.6396 5.32901 13.4489 5.24999 13.2499 5.24999C13.051 5.24999 12.8603 5.32901 12.7196 5.46966C12.579 5.61031 12.4999 5.80108 12.4999 5.99999H13.9999ZM3.49994 5.99999C3.49994 5.80108 3.42092 5.61031 3.28027 5.46966C3.13962 5.32901 2.94885 5.24999 2.74994 5.24999C2.55103 5.24999 2.36026 5.32901 2.21961 5.46966C2.07896 5.61031 1.99994 5.80108 1.99994 5.99999H3.49994ZM14.2197 8.03024C14.3611 8.16686 14.5506 8.24246 14.7472 8.24075C14.9439 8.23904 15.132 8.16016 15.2711 8.02111C15.4101 7.88205 15.489 7.69394 15.4907 7.49729C15.4924 7.30065 15.4168 7.11119 15.2802 6.96974L14.2197 8.03024ZM7.99994 0.749992L8.53019 0.219742C8.38954 0.0791391 8.19881 0.000152588 7.99994 0.000152588C7.80107 0.000152588 7.61033 0.0791391 7.46969 0.219742L7.99994 0.749992ZM0.719689 6.96974C0.648056 7.03893 0.59092 7.12169 0.551613 7.21319C0.512306 7.30469 0.491616 7.40311 0.490751 7.50269C0.489886 7.60228 0.508862 7.70104 0.546573 7.79321C0.584283 7.88538 0.639973 7.96912 0.710393 8.03954C0.780812 8.10996 0.864551 8.16565 0.956723 8.20336C1.0489 8.24107 1.14766 8.26005 1.24724 8.25918C1.34682 8.25832 1.44524 8.23763 1.53674 8.19832C1.62825 8.15901 1.711 8.10188 1.78019 8.03024L0.719689 6.96974ZM4.24994 15H11.7499V13.5H4.24994V15ZM13.9999 12.75V5.99999H12.4999V12.75H13.9999ZM3.49994 12.75V5.99999H1.99994V12.75H3.49994ZM15.2802 6.96974L8.53019 0.219742L7.46969 1.28024L14.2197 8.03024L15.2802 6.96974ZM7.46969 0.219742L0.719689 6.96974L1.78019 8.03024L8.53019 1.28024L7.46969 0.219742ZM11.7499 15C12.3467 15 12.919 14.7629 13.3409 14.341C13.7629 13.919 13.9999 13.3467 13.9999 12.75H12.4999C12.4999 12.9489 12.4209 13.1397 12.2803 13.2803C12.1396 13.421 11.9489 13.5 11.7499 13.5V15ZM4.24994 13.5C4.05103 13.5 3.86026 13.421 3.71961 13.2803C3.57896 13.1397 3.49994 12.9489 3.49994 12.75H1.99994C1.99994 13.3467 2.23699 13.919 2.65895 14.341C3.08091 14.7629 3.6532 15 4.24994 15V13.5Z" fill="#111111" />
                  </svg>
                    {room.building_type}</span>
                </div>
                <div className="md:pl-[25] md:pr-[10px] pr-0 p-3 flex items-center gap-2 md:border-x md:border-[#00000033]">
                  <span className="text-[16px] tracking-wide flex items-center gap-[10px]"><svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 13V7C1.5 6.60218 1.65804 6.22064 1.93934 5.93934C2.22064 5.65804 2.60218 5.5 3 5.5M3 5.5H15M3 5.5V2.5C3 2.10218 3.15804 1.72064 3.43934 1.43934C3.72064 1.15804 4.10218 1 4.5 1H13.5C13.8978 1 14.2794 1.15804 14.5607 1.43934C14.842 1.72064 15 2.10218 15 2.5V5.5M15 5.5C15.3978 5.5 15.7794 5.65804 16.0607 5.93934C16.342 6.22064 16.5 6.60218 16.5 7V13M9 1V5.5M1.5 11.5H16.5" stroke="#111111" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                    {room.bedrooms} Bedrooms</span>
                </div>
                <div className="p-3 md:pl-[25px] rounded-lg flex items-center gap-2">
                  <span className="text-[16px] tracking-wide flex items-center gap-[10px]"><svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.75 7V5.5C5.75 5.10218 5.90804 4.72064 6.18934 4.43934C6.47064 4.15804 6.85218 4 7.25 4H11.75C12.1478 4 12.5294 4.15804 12.8107 4.43934C13.092 4.72064 13.25 5.10218 13.25 5.5V7M4.25 7H14.75" stroke="#111111" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.25 16V2.5C1.25 2.10218 1.40804 1.72064 1.68934 1.43934C1.97064 1.15804 2.35218 1 2.75 1H8C8.39782 1 8.77936 1.15804 9.06066 1.43934C9.34196 1.72064 9.5 2.10218 9.5 2.5V4M6.5 10H6.5075M9.5 10H9.5075M12.5 10H12.5075M5.75 13H5.7575M9.5 13H9.5075M13.25 13H13.2575M5 16H5.0075M9.5 16H9.5075M14 16H14.0075" stroke="#111111" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                    {room.bathrooms} Bathrooms</span>
                </div>
                <div className="p-3 rounded-lg flex items-center gap-2">
                  <span className="text-[16px] tracking-wide flex items-center gap-[10px]"><svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.75 7V5.5C5.75 5.10218 5.90804 4.72064 6.18934 4.43934C6.47064 4.15804 6.85218 4 7.25 4H11.75C12.1478 4 12.5294 4.15804 12.8107 4.43934C13.092 4.72064 13.25 5.10218 13.25 5.5V7M4.25 7H14.75" stroke="#111111" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.25 16V2.5C1.25 2.10218 1.40804 1.72064 1.68934 1.43934C1.97064 1.15804 2.35218 1 2.75 1H8C8.39782 1 8.77936 1.15804 9.06066 1.43934C9.34196 1.72064 9.5 2.10218 9.5 2.5V4M6.5 10H6.5075M9.5 10H9.5075M12.5 10H12.5075M5.75 13H5.7575M9.5 13H9.5075M13.25 13H13.2575M5 16H5.0075M9.5 16H9.5075M14 16H14.0075" stroke="#111111" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                    {room.room_size} sq ft</span>
                </div>
                {room.furnishing?.length !== undefined && room.furnishing?.length > 0 && (
                  <div className="md:pl-[25] md:pr-[10px] pr-0 p-3 flex items-center gap-2 md:border-x md:border-[#00000033]">
                    <span className="text-[16px] tracking-wide flex items-center gap-[10px]"><svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.7342 13C2.6064 13 2.4996 12.9561 2.4138 12.8683C2.328 12.7805 2.2848 12.6709 2.2842 12.5395V11.6186H1.8C1.2924 11.6186 0.8655 11.4415 0.5193 11.0872C0.1731 10.7329 0 10.2961 0 9.7767V5.172C0 4.58198 0.1905 4.12765 0.5715 3.80901C0.9519 3.48975 1.3614 3.33012 1.8 3.33012V1.8428C1.8 1.32339 1.9731 0.886559 2.3193 0.532304C2.6655 0.178049 3.0924 0.00061396 3.6 0H14.4C14.9076 0 15.3345 0.177128 15.6807 0.531383C16.0269 0.885638 16.2 1.32247 16.2 1.84188V3.3292C16.6848 3.3292 17.106 3.49742 17.4636 3.83387C17.8212 4.17032 18 4.61637 18 5.172V9.7767C18 10.2961 17.8269 10.7329 17.4807 11.0872C17.1345 11.4415 16.7076 11.6186 16.2 11.6186H15.7158V12.5395C15.7158 12.6703 15.6786 12.7796 15.6042 12.8674C15.5298 12.9552 15.4287 12.9994 15.3009 13C15.1731 13.0006 15.066 12.9564 14.9796 12.8674C14.8932 12.7784 14.85 12.6691 14.85 12.5395V11.6186H3.1851V12.5395C3.1851 12.6709 3.1416 12.7805 3.0546 12.8683C2.9682 12.9561 2.8614 13 2.7342 13ZM1.8 10.6976H16.2C16.455 10.6976 16.6689 10.6095 16.8417 10.4333C17.0145 10.2571 17.1006 10.0382 17.1 9.7767V5.172C17.1 4.91107 17.0136 4.6925 16.8408 4.51629C16.668 4.34008 16.4544 4.25167 16.2 4.25106C15.9456 4.25045 15.732 4.33886 15.5592 4.51629C15.3864 4.69373 15.3 4.9123 15.3 5.172V8.39529H2.7V5.172C2.7 4.91107 2.6136 4.6925 2.4408 4.51629C2.268 4.34008 2.0544 4.25167 1.8 4.25106C1.5456 4.25045 1.332 4.33886 1.1592 4.51629C0.9864 4.69373 0.9 4.9123 0.9 5.172V9.7767C0.9 10.0376 0.9864 10.2565 1.1592 10.4333C1.332 10.6102 1.5456 10.6983 1.8 10.6976ZM3.6 7.47435H14.4V5.172C14.4 4.84046 14.4825 4.53532 14.6475 4.25659C14.8125 3.97785 15.03 3.76112 15.3 3.6064V1.8428C15.3 1.58187 15.2136 1.36299 15.0408 1.18617C14.868 1.00935 14.6544 0.921247 14.4 0.921861H3.6C3.345 0.921861 3.1314 1.00996 2.9592 1.18617C2.787 1.36238 2.7006 1.58125 2.7 1.8428V3.6064C2.97 3.76112 3.1875 3.97785 3.3525 4.25659C3.5175 4.53532 3.6 4.84046 3.6 5.172V7.47435Z" fill="#111111" />
                    </svg>
                      Furnished</span>
                  </div>
                )}
                {Array.isArray(room.furnishing) && room.furnishing.some(item => item.toLowerCase().includes('wifi')) && (
                  <div className="p-3 md:pl-[25px] rounded-lg flex items-center gap-2">
                    <span className="text-[16px] tracking-wide flex items-center gap-[10px]"><svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 5C6 -0.000245571 12 -0.000245571 16.5 5M4.5 8C7.2 5 10.8 5 13.5 8" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 11.75C9.41421 11.75 9.75 11.4142 9.75 11C9.75 10.5858 9.41421 10.25 9 10.25C8.58579 10.25 8.25 10.5858 8.25 11C8.25 11.4142 8.58579 11.75 9 11.75Z" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                      Wi-fi Zone</span>
                  </div>
                )}
              </div>
            </div>


            {/* Description */}
            <div className="p-6 pl-0 mt-[0px] sm:mt-[10px]">
              <h2 className="text-[20px] sm:text-[24px] font-semibold text-black tracking-wide mb-[10px]">Description</h2>
              <p className="text-[14px] sm:text-[16px] text-black tracking-wide">
                {room.description || "Property agents are well-educated professionals who play a pivotal role in the real estate industry. They acquire the necessary knowledge and skills through formal education, licensing, and ongoing training. By combining their educational background with practical experience, property agents assist clients in achieving their real estate goals while adhering to ethical and legal standards. make it brief"}
              </p>
            </div>

            {/* About */}
            <div className="p-6 pl-0 pt-0">
              <h2 className="text-[20px] sm:text-[24px] font-semibold text-black tracking-wide mb-[10px]">About Me</h2>
              <p className="text-[14px] sm:text-[16px] text-black tracking-wide">
                {room.about_self || "Property agents are well-educated professionals who play a pivotal role in the real estate industry. They acquire the necessary knowledge and skills through formal education, licensing, and ongoing training. By combining their educational background with practical experience, property agents assist clients in achieving their real estate goals while adhering to ethical and legal standards. make it brief"}
              </p>
            </div>

            {/* Likes and dislikes */}
            <div className='mt-[10px]'>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Likes */}
                <div className="bg-[#10D1C10D] border-2 border-[#10D1C1] rounded-2xl p-6 pb-10 h-full">
                  <h3 className="text-[20px] sm:text-[24px] font-semibold text-black tracking-wide sm:mb-[10px] mb-[5px]">Likes</h3>
                  <p className="text-[14px] sm:text-[16px] text-black tracking-wide">
                    {room.likes || "Property agents are well-educated professionals who play a pivotal role in the real estate industry. They acquire the necessary knowledge and skills through formal education, licensing, and ongoing training."}
                  </p>
                </div>

                {/* Dislikes */}
                <div className="bg-[#FF2C790D] border-2 border-[#FF2C79] rounded-2xl p-6 pb-10 h-full">
                  <h3 className="text-[20px] sm:text-[24px] font-semibold text-black tracking-wide sm:mb-[10px] mb-[5px]">Dislikes</h3>
                  <p className="text-[14px] sm:text-[16px] text-black tracking-wide">
                    {room.dislikes || "Property agents are well-educated professionals who play a pivotal role in the real estate industry. They acquire the necessary knowledge and skills through formal education, licensing, and ongoing training."}
                  </p>
                </div>
              </div>
            </div>


            {/* Room features */}
            <div className='mt-[20px] sm:mt-[40px]'>
              {/* <h2 className="text-[24px] font-semibold text-black tracking-wide mb-[20px]">Room Features</h2> */}
              <div className="grid grid-cols-2 gap-4">
                {Array.isArray(room.furnishing) && room.furnishing.length > 0 ? (
                  room.furnishing.map((item, index) => {
                    // Convert to lowercase and replace spaces with underscores
                    const iconName = item.toLowerCase().replace(/\s+/g, '_');
                    const iconPath = `/images/furnishing/${iconName}.svg`;

                    return (
                      <div key={index} className="flex items-center gap-3 p-3">
                        <div className="w-6 h-6 flex-shrink-0">
                        <Image
                          src={iconPath}
                          alt={item}
                          width={24}
                          height={24}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/furnishing/default_icon.svg';
                          }}
                        />
                      </div>
                        <span className="text-[14px] sm:text-[16px] text-black tracking-wide">{item}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    No furnishing information available
                  </div>
                )}
              </div>
            </div>

            {/* Roommates Photos - Desktop */}
            <div className="mt-[40px] hidden sm:block">
              <h2 className="text-[24px] font-semibold text-black tracking-wide mb-[20px]">Roommates Photos</h2>
              <div className="grid grid-cols-2 gap-4">
                {room.potrait_img_1 && (
                  <div className="rounded-2xl overflow-hidden">
                    <Image
                      src={room.potrait_img_1}
                      alt="Roommate 1"
                      width={1200}
                      height={470}
                      className="w-full h-[470px] object-cover"
                    />
                  </div>
                )}

                {room.potrait_img_2 && (
                  <div className="rounded-2xl overflow-hidden">
                    <Image
                      src={room.potrait_img_2}
                      alt="Roommate 2"
                      width={1200}
                      height={470}
                      className="w-full h-[470px] object-cover"
                    />
                  </div>
                )}

                {!room.potrait_img_1 && !room.potrait_img_2 && (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    No roommate photos available
                  </div>
                )}
              </div>
            </div>

            {/* Roommates Photos - Mobile Swiper */}
            <div className="mt-[20px] sm:hidden">
              <h2 className="text-[20px] font-semibold text-black tracking-wide mb-[15px]">Roommates Photos</h2>
              {(room.potrait_img_1 || room.potrait_img_2) ? (
                <Swiper
                  modules={[Pagination]}
                  spaceBetween={15}
                  slidesPerView={1.2}
                  pagination={{ clickable: true }}
                  className="roommates-swiper"
                >
                  {room.potrait_img_1 && (
                    <SwiperSlide>
                      <div className="rounded-2xl overflow-hidden">
                        <Image
                          src={room.potrait_img_1}
                          alt="Roommate 1"
                          width={1200}
                          height={300}
                          className="w-full h-[600px] object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  )}

                  {room.potrait_img_2 && (
                    <SwiperSlide>
                      <div className="rounded-2xl overflow-hidden">
                        <Image
                          src={room.potrait_img_2}
                          alt="Roommate 2"
                          width={1200}
                          height={300}
                          className="w-full h-[600px] object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No roommate photos available
                </div>
              )}
            </div>

            {/* Property Location */}
            <div className="mt-[20px] sm:mt-[40px]">
              <h2 className="text-[20px] sm:text-[24px] font-semibold text-black tracking-wide mb-[10px] sm:mb-[20px]">Property Location</h2>
              {room.latitude && room.longitude ? (
                <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200">
                  <MapComponent
                    lat={parseFloat(room.latitude)}
                    lng={parseFloat(room.longitude)}
                  />
                </div>
              ) : (
                <div className="w-full h-96 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
                  <p className="text-gray-500">Location not available</p>
                </div>
              )}

            </div>

              {/* Connect form */}
              <div className="mt-[20px] sm:mt-[40px]">
                <ConnectForm roomId={room.id} roomTitle={room.property_title} roomPrice={room.price} roomDuration={room.duration} />
              </div>

          </div>
        </div>
      </div>

      <ListRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
   
    </div>
    <div className="w-[90%] max-w-[1300px] mx-auto rounded-[20px] mt-[30px] mb-[30px] md:mt-[210px] md:mb-[70px]" style={{
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
    </>
  )
};