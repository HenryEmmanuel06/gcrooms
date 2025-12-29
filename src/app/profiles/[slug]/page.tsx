'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import CreateProfileModal from '@/components/CreateProfileModal';
import ShareDetailsModal from '@/components/ShareDetailsModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Profile {
  id: number;
  full_name: string;
  age: number;
  occupation: string;
  location: string;
  state: string;
  about: string;
  profile_photo?: string;
  profile_protrait1?: string;
  profile_protrait2?: string;
  monthly_budget: number;
  duration: string;
  cleanliness_level: string;
  pet_friendly: boolean;
  smoking: boolean;
  overnight_guests: string;
  noise_level: string;
  phone_number?: string;
  email_address?: string;
  is_verified: string;
  created_at: string;
}

interface ProfilePageProps {
  params: Promise<{ slug: string; }>;
}

// Format budget to display with Nigerian currency and duration
const formatBudget = (budget: number, duration: string): string => {
  return `₦${budget.toLocaleString()}/${duration}`;
};

export default function ProfilePage({ params }: ProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isShareDetailsModalOpen, setIsShareDetailsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const backgroundImages = [
    '/images/whyus-img.png',
    '/images/whyus-img-2.jpg',
    '/images/whyus-img-3.jpg'
  ];

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      const profileId = resolvedParams.slug.split('-').pop();

      if (profileId) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
        setProfile(data);
      }
    }
    getParams();
  }, [params]);

  // Background image rotation effect
  useEffect(() => {
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

  if (!profile) return (
    <div className="flex justify-center items-center py-12 h-[100vh]">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );

  return (
    <>
      <div className="pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] sm:gap-[50px]">
            {/* Left Sidebar - Profile Picture and Quick Info */}
            <div className="lg:sticky lg:top-10 lg:h-fit">
              <div className="bg-white rounded-2xl space-y-6">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <div className="relative w-100 h-100 overflow-hidden border-4 border-gray-100">
                    {profile.profile_photo ? (
                      <Image
                        src={profile.profile_photo}
                        alt={profile.full_name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/rooms-page-logo.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Info</h3>
                  <div className="space-y-4">
                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mt-0.5 flex-shrink-0">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Location</p>
                        <p className="text-sm text-gray-500">{profile.location}, {profile.state}</p>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10D1C1] mt-0.5 flex-shrink-0">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Budget</p>
                        <p className="text-sm text-gray-500">{formatBudget(profile.monthly_budget, profile.duration)}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 mt-0.5 flex-shrink-0">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Duration</p>
                        <p className="text-sm text-gray-500">{profile.duration}</p>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Profile Views - Placeholder */}
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 mt-0.5 flex-shrink-0">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Profile Views</p>
                        <p className="text-sm text-gray-500">0 views</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Scrollable */}
            <div className="">
              {/* Header */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-[24px] sm:text-[36px] leading-[120%] font-semibold text-black mb-2">
                      {profile.full_name}, {profile.age}
                    </h1>
                    <p className="text-lg text-gray-600">{profile.occupation}</p>
                  </div>
                  {/* Verified Badge */}
                 
                </div>

                {/* Tags/Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.cleanliness_level && (
                    <span className="bg-[#E6FFFB] text-[#0FB8A8] text-sm px-4 py-2 rounded-full font-medium">
                      {profile.cleanliness_level}
                    </span>
                  )}
                  {profile.noise_level && (
                    <span className="bg-[#E6FFFB] text-[#0FB8A8] text-sm px-4 py-2 rounded-full font-medium">
                      {profile.noise_level}
                    </span>
                  )}
                  {profile.smoking === false && (
                    <span className="bg-[#E6FFFB] text-[#0FB8A8] text-sm px-4 py-2 rounded-full font-medium">
                      Non-smoker
                    </span>
                  )}
                  {profile.pet_friendly && (
                    <span className="bg-[#E6FFFB] text-[#0FB8A8] text-sm px-4 py-2 rounded-full font-medium">
                      Pet-friendly
                    </span>
                  )}
                </div>
              </div>

              {/* About Me */}
              <div className="bg-white rounded-2xl p-6 pt-0">
                <h2 className="text-[20px] sm:text-[24px] font-semibold text-black tracking-wide mb-4">About Me</h2>
                <p className="text-[14px] sm:text-[16px] text-gray-700 leading-relaxed">
                  {profile.about || "No information provided."}
                </p>
              </div>

              {/* Living Preferences */}
              <div className="bg-white rounded-2xl p-6 pt-0">
                <h2 className="text-[20px] sm:text-[24px] font-semibold text-black tracking-wide mb-4">Living Preferences</h2>
                <div className="space-y-4">
                  {/* Cleanliness */}
                  <div className="flex items-center gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Cleanliness</p>
                      <p className="text-sm text-gray-500">{profile.cleanliness_level || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Pets */}
                  <div className="flex items-center gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                      <path d="M19.69 14a6.9 6.9 0 0 0 .31-2 7 7 0 0 0-7-7h-1.5a7 7 0 0 0-7 7c0 .73.11 1.43.31 2"></path>
                      <path d="M10.5 20.2a3.5 3.5 0 0 0 4.9 2.6"></path>
                      <path d="M12.5 10.5a2.5 2.5 0 0 0-2.5 2.5v1.5a2.5 2.5 0 0 0 5 0V13a2.5 2.5 0 0 0-2.5-2.5z"></path>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Pets</p>
                      <p className="text-sm text-gray-500">{profile.pet_friendly ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {/* Smoking */}
                  <div className="flex items-center gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                      <line x1="18" y1="10" x2="18" y2="20"></line>
                      <line x1="12" y1="10" x2="12" y2="20"></line>
                      <line x1="6" y1="10" x2="6" y2="20"></line>
                      <line x1="18" y1="14" x2="12" y2="14"></line>
                      <line x1="12" y1="14" x2="6" y2="14"></line>
                      <path d="M12 4v6"></path>
                      <path d="M18 4v6"></path>
                      <path d="M6 4v6"></path>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Smoking</p>
                      <p className="text-sm text-gray-500">{profile.smoking ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {/* Overnight Guests */}
                  <div className="flex items-center gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      <line x1="12" y1="2" x2="12" y2="22"></line>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Overnight Guests</p>
                      <p className="text-sm text-gray-500">{profile.overnight_guests || 'Not specified'}</p>
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* More Photos (portraits) - Desktop and Mobile */}
              {(profile.profile_protrait1 || profile.profile_protrait2) && (
                <div className="bg-white rounded-2xl p-6 mt-6 pt-0">
                  {/* Desktop: side-by-side photos */}
                  <div className="hidden sm:block mt-[20px]">
                    <h2 className="text-[20px] sm:text-[24px] font-semibold text-black tracking-wide mb-[15px]">
                      More Photos
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {profile.profile_protrait1 && (
                        <div className="rounded-2xl overflow-hidden">
                          <Image
                            src={profile.profile_protrait1}
                            alt="Profile portrait 1"
                            width={1200}
                            height={470}
                            className="w-full h-[300px] object-cover"
                          />
                        </div>
                      )}
                      {profile.profile_protrait2 && (
                        <div className="rounded-2xl overflow-hidden">
                          <Image
                            src={profile.profile_protrait2}
                            alt="Profile portrait 2"
                            width={1200}
                            height={470}
                            className="w-full h-[300px] object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile: Swiper similar to room portraits */}
                  <div className="mt-[20px] sm:hidden">
                    <h2 className="text-[20px] font-semibold text-black tracking-wide mb-[15px]">
                      More Photos
                    </h2>
                    <Swiper
                      modules={[Pagination]}
                      spaceBetween={15}
                      slidesPerView={1.2}
                      pagination={{ clickable: true }}
                      className="roommates-swiper"
                    >
                      {profile.profile_protrait1 && (
                        <SwiperSlide>
                          <div className="rounded-2xl overflow-hidden">
                            <Image
                              src={profile.profile_protrait1}
                              alt="Profile portrait 1"
                              width={1200}
                              height={300}
                              className="w-full h-[400px] object-cover"
                            />
                          </div>
                        </SwiperSlide>
                      )}
                      {profile.profile_protrait2 && (
                        <SwiperSlide>
                          <div className="rounded-2xl overflow-hidden">
                            <Image
                              src={profile.profile_protrait2}
                              alt="Profile portrait 2"
                              width={1200}
                              height={300}
                              className="w-full h-[400px] object-cover"
                            />
                          </div>
                        </SwiperSlide>
                      )}
                    </Swiper>
                  </div>
                </div>
              )}

              {/* I am Interested Button */}
              <div className="bg-white rounded-2xl p-6 mt-6">
                <button
                  onClick={() => setIsShareDetailsModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#10D1C1] text-black font-semibold px-6 py-3 transition hover:bg-[#0FB8A8]"
                  style={{
                    boxShadow: "0px 0px 10px 0px #660ED180"
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  I am Interested - Share My Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-[90%] max-w-[1300px] mx-auto rounded-[20px] mt-[30px] mb-[30px] md:mt-[70px] md:mb-[70px]" style={{
        background: "linear-gradient(92.93deg, #9B30DF 0.5%, rgba(102, 14, 209, 0.8) 131.44%)",
      }}>
        <div className="flex items-center gap-[20px] pl-[15px] pr-[15px] py-[15px] md:pl-[40px] md:pr-[20px] md:py-[20px]">
          <div className="">
            <h2 className="lg:text-[36px] md:text-[32px] lg:w-[450px] w-[100%] text-[26px] font-bold text-white leading-tight">Connect with verified roommates</h2>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex border border-[#FFBE06] items-center justify-center rounded-full bg-[#FFBE06] text-black text-[16px] px-[30px] py-3 transition mt-[40px]"
              style={{
                boxShadow: "0px 0px 10px 0px #660ED180"
              }}
            >
              Create your profile
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

      <CreateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {profile && (
        <ShareDetailsModal
          isOpen={isShareDetailsModalOpen}
          onClose={() => setIsShareDetailsModalOpen(false)}
          profileName={profile.full_name}
          profileId={profile.id}
        />
      )}
    </>
  );
}

