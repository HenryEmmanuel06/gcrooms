"use client";

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateProfileModal from '@/components/CreateProfileModal';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase environment variables are not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ProfileSuggestion {
  id: number;
  full_name: string;
  location: string;
  state: string;
  profile_photo?: string;
  monthly_budget: number;
  duration: string;
  age: number;
  occupation: string;
  cleanliness_level: string;
  noise_level: string;
  smoking: boolean;
  is_verified: string;
}

interface SearchSuggestion {
  id: number;
  full_name: string;
  location: string;
  state: string;
  is_verified: string;
}

// Generate URL slug from full name
const generateProfileSlug = (fullName: string, id: number): string => {
  const slug = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return `${slug}-${id}`;
};

// Format budget to display with Nigerian currency and duration
const formatBudget = (budget: number, duration: string): string => {
  return `₦${budget.toLocaleString()}/${duration}`;
};

export default function ProfilesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileSuggestions, setProfileSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allProfiles, setAllProfiles] = useState<ProfileSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Background images for carousel
  const backgroundImages = [
    '/images/whyus-img.png',
    '/images/whyus-img-2.jpg',
    '/images/whyus-img-3.jpg'
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Fetch all profiles for the grid
  useEffect(() => {
    const fetchAllProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_verified', 'verified')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching all profiles:', error);
        } else {
          setAllProfiles(data || []);
        }
      } catch (error) {
        console.error('Error fetching all profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProfiles();
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

  // Search for profiles in database by location or state
  const searchProfiles = async (query: string) => {
    if (query.length < 2) {
      setProfileSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, location, state, is_verified')
        .eq('is_verified', 'verified')
        .or(`location.ilike.%${query}%,state.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Error searching profiles:', error);
        setProfileSuggestions([]);
      } else {
        setProfileSuggestions(data || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching profiles:', error);
      setProfileSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setProfileSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchProfiles(value);
    }, 300);
  };

  // Handle profile selection
  const handleProfileSelect = (profile: SearchSuggestion) => {
    setSearchQuery(profile.full_name);
    setShowSuggestions(false);

    // Navigate to profile details page with slug
    const slug = generateProfileSlug(profile.full_name, profile.id);
    router.push(`/profiles/${slug}`);
  };

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
              <h2 className="lg:text-[54px] md:text-[42px] lg:w-[850px] w-[100%] text-[30px] font-extrabold text-black leading-tight text-center mt-[40px] md:mt-[0px]">Browse through all profiles</h2>
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
                  <button className="bg-[#10D1C1] hover:bg-[#10D1C1] border-1 border-[#07C3B3] cursor-pointer text-black px-[10px] py-[8px] md:px-[20px] md:py-[10px] rounded-full transition-colors text-[11px] md:text-[14px]"
                    style={{
                      boxShadow: "0px 0px 10px 0px #660ED180",
                    }}
                  >
                    Search profiles
                  </button>
                </div>

                {/* Profile Suggestions Dropdown */}
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
                    ) : profileSuggestions.length > 0 ? (
                      profileSuggestions.map((profile) => (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => handleProfileSelect(profile)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-black border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm">{profile.full_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {profile.location}, {profile.state}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        No profiles found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Profiles Grid Section */}
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
          ) : allProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[15px] gap-y-[15px] xl:gap-x-[10px] xl:gap-y-[50px]">
              {allProfiles.map((profile) => (
                <Link key={profile.id} href={`/profiles/${generateProfileSlug(profile.full_name, profile.id)}`} className="block">
                  <div className="group bg-white rounded-[15px] overflow-hidden shadow-[0px_1px_15px_0px_#0000001A] cursor-pointer transition-all duration-300 hover:shadow-[0px_4px_20px_0px_#0000002A]">
                    {/* Profile Image */}
                    <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                      {profile.profile_photo ? (
                        <img
                          src={profile.profile_photo}
                          alt={profile.full_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = '/images/rooms-page-logo.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      {/* Verified Badge */}
                      <div className="absolute top-3 left-3 bg-[#10D1C1] text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                          <path d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.25a1 1 0 0 1-1.43.005L3.29 9.17a1 1 0 1 1 1.42-1.41l3.06 3.05 6.49-6.54a1 1 0 0 1 1.444.02z" fill="currentColor" />
                        </svg>
                        Verified
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div className="p-5">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-black mb-1">
                          {profile.full_name}, {profile.age}
                        </h3>
                        <p className="text-sm text-gray-600">{profile.occupation}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        {/* State */}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>{profile.state}</span>
                        </div>

                        {/* Monthly Budget */}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                          <span>{formatBudget(profile.monthly_budget, profile.duration)}</span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>{profile.duration}</span>
                        </div>
                      </div>

                      {/* Lifestyle Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {profile.cleanliness_level && (
                          <span className="bg-[#E6FFFB] text-[#0FB8A8] text-xs px-3 py-1 rounded-full font-medium">
                            {profile.cleanliness_level}
                          </span>
                        )}
                        {profile.noise_level && (
                          <span className="bg-[#E6FFFB] text-[#0FB8A8] text-xs px-3 py-1 rounded-full font-medium">
                            {profile.noise_level}
                          </span>
                        )}
                        {profile.smoking === false && (
                          <span className="bg-[#E6FFFB] text-[#0FB8A8] text-xs px-3 py-1 rounded-full font-medium">
                            Non-smoker
                          </span>
                        )}
                      </div>

                      {/* Views */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>View profile</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No profiles available at the moment. Check back soon!
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
            <h2 className="lg:text-[36px] md:text-[32px] lg:w-[450px] w-[100%] text-[26px] font-bold text-white leading-tight">Connect with verified roommates</h2>
            <div className="relative lg:w-[470px] max-w-[470px] w-[100%] mt-[20px] md:mt-[50px]">
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

      <CreateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}

