"use client";
import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
// dynamic import not needed currently
import { 
  sanitizeText, 
  sanitizeNumber, 
  isValidPrice, 
  isValidCoordinate, 
  validateImageFile, 
  generateSecureFilename, 
  RateLimiter,
  sanitizeStreet,
  isValidStreet
} from '../utils/security';

// MapComponent not used currently; remove to satisfy lint. Re-add when needed.

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase environment variables are not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Nigerian States
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface FormData {
  property_title: string;
  location: string;
  state: string;
  price: string;
  bathrooms: string; // Will be used for Toilet input
  bedrooms: string;
  room_size: string;
  furniture: string; // kept for backward compat but unused in UI
  furnishing: string[]; // new multi-select field
  duration: string; // new duration text field
  house_no: string; // required in form (initialized as empty string)
  street: string; // street address field
  wifi_zone: boolean;
  description: string;
  room_features: string;
  building_type: string;
  latitude?: string;
  longitude?: string;
  // Step 2 fields
  full_name?: string;
  gender?: string;
  phone_number?: string;
  email_address?: string;
  religion?: string;
  status?: string;
  age_range?: string;
  pet?: string;
  about_self?: string;
  dislikes?: string;
  likes?: string;
}

interface RoomData {
  property_title: string;
  location: string;
  state: string;
  price: number;
  bathrooms: number;
  bedrooms: number;
  room_size: number;
  furniture?: string; // optional for backward compatibility
  furnishing?: string[]; // new
  duration?: string; // new
  house_no?: number; // optional numeric
  street?: string; // street address field
  wifi_zone: boolean;
  description: string;
  room_features: string;
  building_type: string;
  latitude: number;
  longitude: number;
  created_at: string;
  room_img_1?: string;
  room_img_2?: string;
  room_img_3?: string;
  room_img_4?: string;
  room_img_5?: string;
  profile_image?: string; // new avatar image URL
  // Step 2 fields (optional — adjust names to match DB schema)
  full_name?: string;
  gender?: string;
  phone_number?: string;
  email_address?: string;
  religion?: string;
  status?: string;
  age_range?: string;
  pet?: string;
  about_self?: string;
  dislikes?: string;
  likes?: string;
  potrait_img_1?: string;
  potrait_img_2?: string;
}

interface ListRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ListRoomModal({ isOpen, onClose }: ListRoomModalProps) {
  const [formData, setFormData] = useState<FormData>({
    property_title: '',
    location: '',
    state: '',
    price: '',
    bathrooms: '',
    bedrooms: '',
    room_size: '',
    furniture: '',
    furnishing: [],
    duration: '',
    house_no: '',
    street: '',
    wifi_zone: false,
    description: '',
    room_features: '',
    building_type: '',
    // Step 2 defaults
    full_name: '',
    gender: '',
    phone_number: '',
    email_address: '',
    religion: '',
    status: '',
    age_range: '',
    pet: '',
    about_self: '',
    dislikes: '',
    likes: '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: string; lon: string } | null>(null);
  const [, setShowMap] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isFurnishingOpen, setIsFurnishingOpen] = useState(false);
  const FURNISHING_OPTIONS = [
    'Fan',
    'Netflix',
    'PS4 Console',
    'Desk lamp',
    'Ceiling Fan',
    'Television',
    'Cable',
    'WiFi',
    'Bathroom',
    'Shower-room',
    'Bed',
    'Bedsheet',
    'Treated water',
    'Lock on bedroom door',
    'Desk',
    'Chair',
    'Mirror',
    'Vanity table',
    'Side drawer',
    'Hanger',
    'Sliding door',
    'Workspace',
    'Sink',
    'Balcony',
    'Pillow',
    'Double bed',
    'Wardrobe',
    'TV',
    'Fridge',
    'AC',
    'DSTV'
  ];
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailValidateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Using per-slot inputs, no shared file input needed
  const profileInputRef = useRef<HTMLInputElement>(null);
  const locationRateLimiter = useRef(new RateLimiter(5, 10000)); // 5 requests per 10 seconds
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [uploadingProfile, setUploadingProfile] = useState<boolean>(false);
  const [, setCurrentSlotIndex] = useState<number | null>(null);
  const [uploadingSlotIndex, setUploadingSlotIndex] = useState<number | null>(null);
  // Step 2 portrait uploads
  const [portrait1Url, setPortrait1Url] = useState<string>('');
  const [portrait2Url, setPortrait2Url] = useState<string>('');
  const [uploadingPortraitIndex, setUploadingPortraitIndex] = useState<0 | 1 | null>(null);
  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  
  // Email validation state (Abstract API)
  const [emailChecking, setEmailChecking] = useState<boolean>(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  // Helper: ensure mandatory Step 2 selects are filled
  const isStep2MandatorySelectsFilled = () => {
    return (
      (formData.religion?.trim() || '').length > 0 &&
      (formData.status?.trim() || '').length > 0 &&
      (formData.age_range?.trim() || '').length > 0 &&
      (formData.pet?.trim() || '').length > 0
    );
  };

  // Helper: can submit checker (Step 2 gating)
  const canSubmit = (
    !isLoading &&
    !!selectedLocation &&
    !uploadingImages &&
    uploadingPortraitIndex === null &&
    !emailChecking &&
    emailValid === true &&
    isStep2MandatorySelectsFilled() &&
    (formData.full_name?.trim() || '').length > 0 &&
    (formData.gender || '').length > 0 &&
    !!formData.phone_number && /^\+?[0-9]{7,15}$/.test(formData.phone_number) &&
    (formData.about_self?.trim() || '').length > 0 &&
    (formData.dislikes?.trim() || '').length > 0 &&
    (formData.likes?.trim() || '').length > 0 &&
    !!portrait1Url && !!portrait2Url
  );

  // Helper function to format number with commas
  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
    // Add commas for thousands
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Helper function to remove commas and get numeric value
  const getNumericValue = (value: string): string => {
    return value.replace(/,/g, '');
  };


  // Validate email with Abstract API on blur
  const validateEmailWithAbstract = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailValid(false);
      setValidationErrors(prev => ({ ...prev, email_address: 'Enter a valid email format' }));
      return;
    }
    try {
      setEmailChecking(true);
      const res = await fetch(`/api/validate-email?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { valid: boolean; reason?: string } = await res.json();
      const isValid = data.valid === true;
      setEmailValid(isValid);
      if (!isValid) {
        setValidationErrors(prev => ({ ...prev, email_address: 'Email is not deliverable' }));
      } else {
        setValidationErrors(prev => ({ ...prev, email_address: '' }));
      }
    } catch (err) {
      console.error('Abstract email validation failed:', err);
    } finally {
      setEmailChecking(false);
    }
  };


  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        // Only close if the click is not on the location input itself
        if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close furnishing dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFurnishingOpen) {
        const target = event.target as HTMLElement;
        const furnishingContainer = target.closest('.relative.md\\:col-span-5');
        if (!furnishingContainer || !furnishingContainer.querySelector('.absolute.z-20')) {
          setIsFurnishingOpen(false);
        }
      }
    };

    if (isFurnishingOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFurnishingOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (emailValidateTimeoutRef.current) {
        clearTimeout(emailValidateTimeoutRef.current);
      }
    };
  }, []);

  // Debounce email validation: validate 2s after user stops typing
  useEffect(() => {
    // Reset validation when field is empty
    if (!formData.email_address) {
      setEmailValid(null);
      if (emailValidateTimeoutRef.current) clearTimeout(emailValidateTimeoutRef.current);
      return;
    }
    if (emailValidateTimeoutRef.current) clearTimeout(emailValidateTimeoutRef.current);
    emailValidateTimeoutRef.current = setTimeout(() => {
      validateEmailWithAbstract(formData.email_address || '');
    }, 2000);
    return () => {
      if (emailValidateTimeoutRef.current) clearTimeout(emailValidateTimeoutRef.current);
    };
  }, [formData.email_address]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Search for location suggestions using Nominatim with rate limiting
  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setIsLocationSearching(false);
      return;
    }

    // Rate limiting check
    if (!locationRateLimiter.current.isAllowed('location_search')) {
      console.warn('Location search rate limit exceeded');
      return;
    }

    // Sanitize query
    const sanitizedQuery = sanitizeText(query, 100);
    if (!sanitizedQuery) return;

    setIsLocationSearching(true);
    setShowSuggestions(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sanitizedQuery)}&limit=5&addressdetails=1&countrycodes=ng`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response data
      const validSuggestions = data.filter((item: unknown): item is LocationSuggestion => 
        typeof item === 'object' &&
        item !== null &&
        typeof (item as LocationSuggestion).display_name === 'string' && 
        typeof (item as LocationSuggestion).lat === 'string' && 
        typeof (item as LocationSuggestion).lon === 'string' &&
        isValidCoordinate((item as LocationSuggestion).lat, (item as LocationSuggestion).lon)
      );
      
      setLocationSuggestions(validSuggestions);
      setIsLocationSearching(false);
    } catch (error) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setIsLocationSearching(false);
      console.error('Location search error:', error);
    }
  };

  // Handle location input change with validation
  const handleLocationChange = (value: string) => {
    // Sanitize input
    const sanitizedValue = sanitizeText(value, 200);
    setFormData(prev => ({ ...prev, location: sanitizedValue }));
    
    // Clear validation error
    if (validationErrors.location) {
      setValidationErrors(prev => ({ ...prev, location: '' }));
    }
    
    // Clear suggestions if input is cleared
    if (!sanitizedValue.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setIsLocationSearching(false);
      setSelectedLocation(null);
      setShowMap(false);
      return;
    }
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce the search to avoid too many API calls
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(sanitizedValue);
    }, 500); // Increased debounce time
  };

  // Handle location selection with validation
  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    // Validate coordinates
    if (!isValidCoordinate(suggestion.lat, suggestion.lon)) {
      console.error('Invalid coordinates received');
      return;
    }
    
    const sanitizedDisplayName = sanitizeText(suggestion.display_name, 200);
    setFormData(prev => ({ ...prev, location: sanitizedDisplayName }));
    setSelectedLocation({ lat: suggestion.lat, lon: suggestion.lon });
    setShowSuggestions(false);
    setShowMap(true);
    
    // Clear validation error
    if (validationErrors.location) {
      setValidationErrors(prev => ({ ...prev, location: '' }));
    }
    
    // Focus back to the input after selection
    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
  };

  // Function to test database connection
  const testDatabaseConnection = async () => {
    try {
      // Try to select from the rooms table to see if it exists and is accessible
      const { error } = await supabase
        .from('rooms')
        .select('*')
        .limit(1);

      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  };

  // Function to handle room insertion
  const insertRoomData = async (roomData: RoomData) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_title: roomData.property_title,
          location: roomData.location,
          state: roomData.state,
          price: roomData.price,
          bathrooms: roomData.bathrooms,
          bedrooms: roomData.bedrooms,
          room_size: roomData.room_size,
          furniture: roomData.furniture,
          furnishing: roomData.furnishing,
          duration: roomData.duration,
          house_no: roomData.house_no,
          street: roomData.street,
          wifi_zone: roomData.wifi_zone,
          description: roomData.description,
          room_features: roomData.room_features,
          building_type: roomData.building_type,
          latitude: roomData.latitude,
          longitude: roomData.longitude,
          room_img_1: roomData.room_img_1,
          room_img_2: roomData.room_img_2,
          room_img_3: roomData.room_img_3,
          room_img_4: roomData.room_img_4,
          room_img_5: roomData.room_img_5,
          profile_image: roomData.profile_image,
          full_name: roomData.full_name,
          gender: roomData.gender,
          phone_number: roomData.phone_number,
          email_address: roomData.email_address,
          religion: roomData.religion,
          status: roomData.status,
          age_range: roomData.age_range,
          pet: roomData.pet,
          about_self: roomData.about_self,
          dislikes: roomData.dislikes,
          likes: roomData.likes,
          potrait_img_1: roomData.potrait_img_1,
          potrait_img_2: roomData.potrait_img_2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Response Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      return result.room;
    } catch (error) {
      console.error('❌ Room creation failed:', error);
      throw error;
    }
  };

  // Validate form data
  const validateFormData = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate property title
    if (!formData.property_title.trim()) {
      errors.property_title = 'Property title is required';
    } else if (formData.property_title.length > 100) {
      errors.property_title = 'Property title must be less than 100 characters';
    }
    
    // Validate location
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    } else if (!selectedLocation) {
      errors.location = 'Please select a location from the suggestions';
    }

    // Require state selection in Step 1
    // Validate State
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    } else if (formData.state.length > 50) {
      errors.state = 'State must be less than 50 characters';
    }
    
    // Validate price
    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (!isValidPrice(formData.price)) {
      errors.price = 'Please enter a valid price';
    }
    
    // Validate bathrooms (Toilet)
    if (!formData.bathrooms) {
      errors.bathrooms = 'Number of toilets is required';
    } else {
      const bathrooms = sanitizeNumber(formData.bathrooms, 0, 10);
      if (bathrooms === null) {
        errors.bathrooms = 'Please enter a valid number of toilets (0-10)';
      }
    }

    // Validate bedrooms
    if (!formData.bedrooms) {
      errors.bedrooms = 'Bedrooms is required';
    } else if (sanitizeNumber(formData.bedrooms, 0, 20) === null) {
      errors.bedrooms = 'Please enter a valid number of bedrooms (0-20)';
    }

    // Validate house number (required and numeric)
    if (!formData.house_no || !formData.house_no.trim()) {
      errors.house_no = 'House number is required';
    } else if (sanitizeNumber(formData.house_no, 0, 1000000) === null) {
      errors.house_no = 'Please enter a valid house number';
    }
    
    // Validate street (required)
    if (!formData.street || !formData.street.trim()) {
      errors.street = 'Street is required';
    } else if (!isValidStreet(formData.street)) {
      errors.street = 'Please enter a valid street address (2-100 characters, letters, numbers, spaces, hyphens, apostrophes, commas, and periods only)';
    }
    
    // Room size is no longer required in this step/UI
    
    // Validate furnishing (multi-select)
    if (!formData.furnishing || formData.furnishing.length === 0) {
      errors.furnishing = 'Please select at least one furnishing item';
    }

    // Validate duration
    if (!formData.duration.trim()) {
      errors.duration = 'Duration is required';
    } else if (formData.duration.length > 50) {
      errors.duration = 'Duration must be less than 50 characters';
    }
    
    // Building type no longer required in Step 1 UI
    
    // Validate description
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length > 2000) {
      errors.description = 'Description must be less than 2000 characters';
    }

    // Step 2 validations (basic)
    if (!formData.full_name || !formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    // Newly required Step 2 selects
    if (!formData.religion || !formData.religion.trim()) {
      errors.religion = 'Religion is required';
    }
    if (!formData.status || !formData.status.trim()) {
      errors.status = 'Status is required';
    }
    if (!formData.age_range || !formData.age_range.trim()) {
      errors.age_range = 'Age range is required';
    }
    if (!formData.pet || !formData.pet.trim()) {
      errors.pet = 'Pet selection is required';
    }
    if (!formData.email_address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
      errors.email_address = 'Valid email is required';
    }
    if (!formData.phone_number || !/^\+?[0-9]{7,15}$/.test(formData.phone_number)) {
      errors.phone_number = 'Valid phone number is required';
    }
    if (!formData.about_self || !formData.about_self.trim()) {
      errors.about_self = 'Please tell us about yourself';
    }
    if (!formData.dislikes || !formData.dislikes.trim()) {
      errors.dislikes = 'Dislikes are required';
    }
    if (!formData.likes || !formData.likes.trim()) {
      errors.likes = 'Likes are required';
    }
    // Images validation
    if (!profileImageUrl) {
      errors.profile_image = 'Profile image is required';
    }
    const missingGallery: number[] = [];
    for (let i = 0; i < 5; i++) {
      if (!uploadedImages[i]) {
        errors[`gallery${i}`] = 'Required';
        missingGallery.push(i);
      }
    }
    if (!portrait1Url) {
      errors.portrait1 = 'Portrait image is required';
    }
    if (!portrait2Url) {
      errors.portrait2 = 'Portrait image is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate only Step 1 fields to enable moving to Step 2
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.property_title.trim()) {
      errors.property_title = 'Property title is required';
    } else if (formData.property_title.length > 100) {
      errors.property_title = 'Property title must be less than 100 characters';
    }

    // Validate State (required in Step 1)
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    } else if (formData.state.length > 50) {
      errors.state = 'State must be less than 50 characters';
    }

    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    } else if (!selectedLocation) {
      errors.location = 'Please select a location from the suggestions';
    }

    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (!isValidPrice(formData.price)) {
      errors.price = 'Please enter a valid price';
    }

    if (!formData.bathrooms) {
      errors.bathrooms = 'Number of toilets is required';
    } else if (sanitizeNumber(formData.bathrooms, 0, 10) === null) {
      errors.bathrooms = 'Please enter a valid number of toilets (0-10)';
    }

    if (!formData.bedrooms) {
      errors.bedrooms = 'Bedrooms is required';
    } else if (sanitizeNumber(formData.bedrooms, 0, 20) === null) {
      errors.bedrooms = 'Please enter a valid number of bedrooms (0-20)';
    }

    if (!formData.house_no.trim()) {
      errors.house_no = 'House number is required';
    }

    // Validate street (required in Step 1)
    if (!formData.street || !formData.street.trim()) {
      errors.street = 'Street is required';
    } else if (!isValidStreet(formData.street)) {
      errors.street = 'Please enter a valid street address (2-100 characters, letters, numbers, spaces, hyphens, apostrophes, commas, and periods only)';
    }

    if (!formData.duration.trim()) {
      errors.duration = 'Duration is required';
    }

    if (!formData.furnishing || formData.furnishing.length === 0) {
      errors.furnishing = 'Please select at least one furnishing item';
    }

    // Building type not required

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    // Require all Step 1 gallery images (slots 0-4)
    for (let i = 0; i < 5; i++) {
      if (!uploadedImages[i]) {
        errors[`gallery${i}`] = 'Required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission with comprehensive validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!validateFormData()) {
      return;
    }
    
    setIsLoading(true);
    let roomData: RoomData | null = null;

    try {
      // Sanitize and validate all inputs
      const sanitizedData = {
        property_title: sanitizeText(formData.property_title, 100),
        location: sanitizeText(formData.location, 200),
        state: formData.state, // Already validated from dropdown
        price: sanitizeNumber(formData.price, 0.01, 1000000),
        bathrooms: sanitizeNumber(formData.bathrooms, 0, 10),
        bedrooms: sanitizeNumber(formData.bedrooms || '0', 0, 20),
        room_size: sanitizeNumber(formData.room_size, 1, 10000) ?? 0,
        furniture: formData.furniture, // legacy optional
        furnishing: Array.isArray(formData.furnishing)
          ? formData.furnishing
              .map((f) => sanitizeText(f, 50))
              .filter((f) => f && f.length <= 50)
          : [],
        duration: sanitizeText(formData.duration, 50),
        house_no: formData.house_no ? sanitizeNumber(formData.house_no, 0, 1000000) : null,
        street: sanitizeStreet(formData.street),
        wifi_zone: formData.wifi_zone,
        description: sanitizeText(formData.description, 2000),
        room_features: sanitizeText(formData.room_features, 1000),
        building_type: formData.building_type || 'Apartment',
        latitude: sanitizeNumber(selectedLocation!.lat, -90, 90),
        longitude: sanitizeNumber(selectedLocation!.lon, -180, 180),
        // Step 2 fields
        full_name: sanitizeText(formData.full_name || '', 100),
        gender: sanitizeText(formData.gender || '', 20),
        phone_number: sanitizeText(formData.phone_number || '', 20),
        email_address: sanitizeText(formData.email_address || '', 200),
        religion: sanitizeText(formData.religion || '', 50),
        status: sanitizeText(formData.status || '', 50),
        age_range: sanitizeText(formData.age_range || '', 20),
        pet: sanitizeText(formData.pet || '', 10),
        about_self: sanitizeText(formData.about_self || '', 2000),
        dislikes: sanitizeText(formData.dislikes || '', 2000),
        likes: sanitizeText(formData.likes || '', 2000),
      };
      
      // Final validation of sanitized data with clear messages
      const invalids: string[] = [];
      if (!sanitizedData.property_title) invalids.push('property title');
      if (!sanitizedData.location) invalids.push('location');
      if (sanitizedData.price === null) invalids.push('price');
      if (sanitizedData.bathrooms === null) invalids.push('toilets');
      if (!sanitizedData.description) invalids.push('description');
      if (!selectedLocation || sanitizedData.latitude === null || sanitizedData.longitude === null) {
        invalids.push('map location (select from suggestions)');
        setValidationErrors(prev => ({ ...prev, location: 'Please select a location from the suggestions' }));
      }
      if (invalids.length > 0) {
        alert('Please check these fields: ' + invalids.join(', '));
        return;
      }

      roomData = {
        property_title: sanitizedData.property_title,
        location: sanitizedData.location,
        state: sanitizedData.state,
        price: sanitizedData.price as number,
        bathrooms: sanitizedData.bathrooms as number,
        bedrooms: sanitizedData.bedrooms || 0,
        room_size: sanitizedData.room_size || 10, // Default room size in sqm
        furniture: sanitizedData.furniture,
        furnishing: sanitizedData.furnishing,
        duration: sanitizedData.duration,
        house_no: sanitizedData.house_no !== null ? sanitizedData.house_no : undefined,
        street: sanitizedData.street || undefined,
        wifi_zone: sanitizedData.wifi_zone,
        description: sanitizedData.description,
        room_features: sanitizedData.room_features || 'Standard room features', // Default room features
        building_type: sanitizedData.building_type,
        latitude: sanitizedData.latitude as number,
        longitude: sanitizedData.longitude as number,
        created_at: new Date().toISOString(),
        room_img_1: uploadedImages[0] || undefined,
        room_img_2: uploadedImages[1] || undefined,
        room_img_3: uploadedImages[2] || undefined,
        room_img_4: uploadedImages[3] || undefined,
        room_img_5: uploadedImages[4] || undefined,
        profile_image: profileImageUrl || undefined,
        // Step 2 fields
        full_name: sanitizedData.full_name || undefined,
        gender: sanitizedData.gender || undefined,
        phone_number: sanitizedData.phone_number || undefined,
        email_address: sanitizedData.email_address || undefined,
        religion: sanitizedData.religion || undefined,
        status: sanitizedData.status || undefined,
        age_range: sanitizedData.age_range || undefined,
        pet: sanitizedData.pet || undefined,
        about_self: sanitizedData.about_self || undefined,
        dislikes: sanitizedData.dislikes || undefined,
        likes: sanitizedData.likes || undefined,
        potrait_img_1: portrait1Url || undefined,
        potrait_img_2: portrait2Url || undefined,
      };

      // Test database connection first
      await testDatabaseConnection();

      // Debug: show a quick summary before insert
      try {
        const debugSummary = [
          `Title: ${roomData.property_title}`,
          `Location: ${roomData.location} (${sanitizedData.latitude}, ${sanitizedData.longitude})`,
          `State: ${roomData.state}`,
          `Street: ${roomData.street}`,
          `Price: ${roomData.price}`,
          `Toilets: ${roomData.bathrooms}, Bedrooms: ${roomData.bedrooms}`,
          `Duration: ${roomData.duration}`,
          `Images: count=${uploadedImages.filter((u)=>u && u.length>0).length}`,
          `Profile image: ${roomData.profile_image ? 'yes' : 'no'}`,
          `Portrait1: ${portrait1Url ? 'yes' : 'no'}, Portrait2: ${portrait2Url ? 'yes' : 'no'}`,
          `Full name: ${sanitizedData.full_name}`,
          `Gender: ${sanitizedData.gender}`,
          `Email: ${sanitizedData.email_address}`,
          `Phone: ${sanitizedData.phone_number}`
        ].join('\n');
        if (!confirm(`Confirm Your data\n\n${debugSummary}`)) {
          return;
        }
      } catch { /* ignore alert failures */ }

      // Insert the room data
      await insertRoomData(roomData!);
      setShowSuccessPopup(true);

      // Do not immediately close/reset; wait for user action in success popup
    } catch (error) {
      // Show more detailed error information
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Handle specific Supabase/common errors
      if (errorMessage.includes('JWT')) {
        errorMessage = 'Authentication error. Please check your Supabase configuration.';
      } else if (errorMessage.toLowerCase().includes('permission')) {
        errorMessage = 'Permission denied (RLS/Policies). Please check your database policies.';
      } else if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
        errorMessage = 'Database schema error. Some required columns are missing in rooms table.';
      } else if (errorMessage.toLowerCase().includes('invalid input syntax')) {
        errorMessage = 'Type mismatch error. One or more fields have the wrong type for the column.';
      }

      // Include a compact snapshot of payload keys to help debug
      const payloadKeys = Object.keys({ ...(roomData ?? {}) });
      const presentImages = {
        profile_image: !!roomData?.profile_image,
        potrait_img_1: !!roomData?.potrait_img_1,
        potrait_img_2: !!roomData?.potrait_img_2,
        gallery_count: uploadedImages.filter((u)=>u && u.length>0).length,
      };
      alert(
        `Error listing room: ${errorMessage}\n\n` +
        `Payload fields: ${payloadKeys.join(', ')}\n` +
        `Images: ${JSON.stringify(presentImages)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Submit for verification action removed (no longer used)

  // Go back action: close popup and reset/close modal
  const handleSuccessGoBack = () => {
    setShowSuccessPopup(false);
    onClose();
    // Reset form
    setFormData({
      property_title: '',
      location: '',
      state: '',
      price: '',
      bathrooms: '',
      bedrooms: '',
      room_size: '',
      furniture: '',
      furnishing: [],
      duration: '',
      house_no: '',
      street: '',
      wifi_zone: false,
      description: '',
      room_features: '',
      building_type: '',
      // Step 2
      full_name: '',
      gender: '',
      phone_number: '',
      email_address: '',
      religion: '',
      status: '',
      age_range: '',
      pet: '',
      about_self: '',
      dislikes: '',
      likes: '',
    });
    setSelectedLocation(null);
    setShowMap(false);
    setUploadedImages([]);
    setProfileImageUrl('');
    setPortrait1Url('');
    setPortrait2Url('');
    setValidationErrors({});
    setCurrentStep(1);
    locationRateLimiter.current.reset('location_search');
  };

  // Handle input change with validation and sanitization
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    let sanitizedValue = value;
    
    // Sanitize inputs based on field type
    if (typeof value === 'string') {
      switch (field) {
        case 'price':
          // For price field: handle comma formatting
          const numericPrice = getNumericValue(value);
          sanitizedValue = numericPrice;
          break;
        case 'bathrooms':
        case 'bedrooms':
        case 'room_size':
        case 'house_no':
          // For numeric fields: remove spaces and non-numeric characters except decimal point
          sanitizedValue = value.replace(/[^0-9.]/g, '');
          break;
        case 'property_title':
          // For text fields: preserve spaces but sanitize HTML and limit length
          sanitizedValue = sanitizeText(value, 100);
          break;
        case 'duration':
          sanitizedValue = sanitizeText(value, 50);
          break;
        case 'description':
          sanitizedValue = sanitizeText(value, 2000);
          break;
        case 'full_name':
          sanitizedValue = sanitizeText(value, 100);
          break;
        case 'email_address':
          sanitizedValue = sanitizeText(value, 200);
          // reset api validation on edit
          setEmailValid(null);
          if (validationErrors.email_address) {
            setValidationErrors(prev => ({ ...prev, email_address: '' }));
          }
          break;
        case 'phone_number':
          sanitizedValue = value.replace(/[^0-9+]/g, '');
          break;
        case 'street':
          sanitizedValue = sanitizeStreet(value);
          break;
        case 'about_self':
        case 'dislikes':
        case 'likes':
          sanitizedValue = sanitizeText(value, 2000);
          break;
        case 'room_features':
          sanitizedValue = sanitizeText(value, 1000);
          break;
        default:
          // For other text fields: preserve spaces
          sanitizedValue = sanitizeText(value, 200);
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Compress image using Tinify
  const compressImage = async (file: File): Promise<Blob> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/compress-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image compression failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Image compression error:', error);
      throw new Error('Failed to compress image');
    }
  };

  // Upload image to Supabase Storage
  const uploadImageToStorage = async (file: Blob, fileName: string): Promise<string> => {
    try {
      const { error } = await supabase.storage
        .from('rooms_image')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('rooms_image')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  // Handle secure image upload with comprehensive validation (removed unused implementation)

  // Upload a single image to a specific slot index (0..4)
  const handleSlotImageUpload = async (files: FileList, slot: number) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingImages(true);
    setUploadingSlotIndex(slot);
    try {
      const validation = await validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error || 'Invalid image');
        return;
      }
      const compressedBlob = await compressImage(file);
      const fileName = generateSecureFilename(file.name);
      const imageUrl = await uploadImageToStorage(compressedBlob, fileName);
      setUploadedImages(prev => {
        const next = [...prev];
        // Ensure array has at least 5 positions
        for (let i = 0; i < 5; i++) if (next[i] === undefined) next[i] = '' as unknown as string;
        next[slot] = imageUrl;
        return next;
      });
    } catch (err) {
      console.error('Slot image upload error:', err);
      alert('Failed to upload image');
    } finally {
      setUploadingImages(false);
      setCurrentSlotIndex(null);
      setUploadingSlotIndex(null);
    }
  };

  // Remove/clear image at a fixed slot without shifting indexes
  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const next = [...prev];
      // Ensure at least 5 positions exist
      for (let i = 0; i < 5; i++) if (next[i] === undefined) next[i] = '' as unknown as string;
      next[index] = '' as unknown as string;
      return next;
    });
  };

  // Handle profile image upload (single file)
  const handleProfileImageChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingProfile(true);
    try {
      const validation = await validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error || 'Invalid image');
        return;
      }
      const compressed = await compressImage(file);
      const fileName = generateSecureFilename(file.name);
      const url = await uploadImageToStorage(compressed, fileName);
      setProfileImageUrl(url);
    } catch (err) {
      console.error('Profile image upload error:', err);
      alert('Failed to upload profile image');
    } finally {
      setUploadingProfile(false);
      if (profileInputRef.current) profileInputRef.current.value = '';
    }
  };

  // Step 2: Upload portrait image (index 0 or 1)
  const handlePortraitUpload = async (files: FileList | null, index: 0 | 1) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingPortraitIndex(index);
    try {
      const validation = await validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error || 'Invalid image');
        return;
      }
      const compressed = await compressImage(file);
      const fileName = generateSecureFilename(file.name);
      const url = await uploadImageToStorage(compressed, fileName);
      if (index === 0) setPortrait1Url(url); else setPortrait2Url(url);
    } catch (err) {
      console.error('Portrait upload error:', err);
      alert('Failed to upload portrait image');
    } finally {
      setUploadingPortraitIndex(null);
    }
  };

  // Helpers for furnishing multi-select
  const toggleFurnishingItem = (item: string) => {
    setFormData(prev => {
      const exists = prev.furnishing.includes(item);
      const updated = exists ? prev.furnishing.filter(f => f !== item) : [...prev.furnishing, item];
      return { ...prev, furnishing: updated };
    });
    if (validationErrors.furnishing) {
      setValidationErrors(prev => ({ ...prev, furnishing: '' }));
    }
  };

  const removeFurnishingTag = (item: string) => {
    setFormData(prev => ({ ...prev, furnishing: prev.furnishing.filter(f => f !== item) }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-1600 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-x-hidden"
          onClick={() => { if (!showSuccessPopup) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[1250px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between py-4 px-[10px] lg:px-[60px] border-b border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">Steps: {currentStep}/2</span>
                
              </div>
              <div className="flex items-center gap-4">
                  <div className={`w-28 h-1 rounded ${currentStep >= 1 ? 'bg-[#6F3AFF]' : 'bg-gray-200'}`}></div>
                  <div className={`w-28 h-1 rounded ${currentStep === 2 ? 'bg-[#6F3AFF]' : 'bg-[#E9D5FF]'}`}></div>
                </div>
              <div className="flex items-center gap-3">
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => { setShowSuggestions(false); if (validateStep1()) setCurrentStep(2); }}
                    className="text-black hover:text-[#10D1C1] text-sm flex items-center gap-1 cursor-pointer duration-300"
                    aria-label="Next"
                  >
                    Next <span aria-hidden>›</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-black hover:text-[#10D1C1] text-sm flex items-center gap-1 cursor-pointer duration-300"
                    aria-label="Back"
                  >
                    ‹ Back
                  </button>
                )}
                
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-[10px] py-[20px] lg:px-[60px] lg:py-[30px] space-y-6">
              {currentStep === 1 && (
              <div className="flex gap-[50px] lg:flex-row flex-col">
                {/* Left: Images Upload */}
                <div className="w-full lg:w-[400px]">

                  {/* Slot 0: Living room (room_img_1) */}
                  <div
                    className={`relative w-full h-56 md:h-64 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden ${uploadingSlotIndex === 0 ? 'opacity-60 cursor-not-allowed' : (uploadedImages[0] ? 'cursor-default' : 'cursor-pointer')}`}
                  >
                    {!uploadedImages[0] && (
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingSlotIndex === 0}
                        onChange={(e) => { if (e.currentTarget.files) handleSlotImageUpload(e.currentTarget.files, 0); e.currentTarget.value = ''; }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    )}
                    {uploadedImages[0] ? (
                      <div className="relative w-full h-full">
                        <Image src={uploadedImages[0]} alt="living room" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(0); }}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full px-2 py-1 text-xs"
                        >
                          Remove
                        </button>
                        {/* Inline error for gallery slot 0 */}
                        {validationErrors.gallery0 && !uploadedImages[0] && (
                          <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[11px] px-2 py-0.5 rounded">{validationErrors.gallery0}</span>
                        )}
                  </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <span><svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 17V19C2 19.5304 2.22388 20.0391 2.6224 20.4142C3.02091 20.7893 3.56141 21 4.125 21H16.875C17.4386 21 17.9791 20.7893 18.3776 20.4142C18.7761 20.0391 19 19.5304 19 19V17M5.1875 11L10.5 16M10.5 16L15.8125 11M10.5 16V4" stroke="#111111" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg></span>
                        <span className="mt-2 text-sm">living room image</span>
                        {validationErrors.gallery0 && (
                          <span className="mt-1 text-red-600 text-[12px]">{validationErrors.gallery0}</span>
                        )}
                      </div>
                    )}
                    {uploadingSlotIndex === 0 && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#10D1C1] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Slot 1: Apartment surroundings (room_img_2) */}
                  <div
                    className={`relative w-full h-28 mt-3 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden ${uploadingSlotIndex === 1 ? 'opacity-60 cursor-not-allowed' : (uploadedImages[1] ? 'cursor-default' : 'cursor-pointer')}`}
                  >
                    {!uploadedImages[1] && (
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingSlotIndex === 1}
                        onChange={(e) => { if (e.currentTarget.files) handleSlotImageUpload(e.currentTarget.files, 1); e.currentTarget.value = ''; }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    )}
                    {uploadedImages[1] ? (
                      <div className="relative w-full h-full">
                        <Image src={uploadedImages[1]} alt="apartment surroundings" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(1); }}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full px-2 py-1 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <span><svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 17V19C2 19.5304 2.22388 20.0391 2.6224 20.4142C3.02091 20.7893 3.56141 21 4.125 21H16.875C17.4386 21 17.9791 20.7893 18.3776 20.4142C18.7761 20.0391 19 19.5304 19 19V17M5.1875 11L10.5 16M10.5 16L15.8125 11M10.5 16V4" stroke="#111111" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg></span>
                        <span className="mt-2 text-sm">apartment surrounding image</span>
                        {validationErrors.gallery1 && (
                          <span className="mt-1 text-red-600 text-[12px]">{validationErrors.gallery1}</span>
                        )}
                      </div>
                    )}
                    {uploadingSlotIndex === 1 && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#10D1C1] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Slots 2-4: Bedroom, Kitchen, Restroom (room_img_3..5) */}
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[2,3,4].map((i) => (
                      <div
                        key={i}
                        className={`relative h-24 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden ${uploadingSlotIndex === i ? 'opacity-60 cursor-not-allowed' : (uploadedImages[i] ? 'cursor-default' : 'cursor-pointer')}`}
                      >
                        {!uploadedImages[i] && (
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingSlotIndex === i}
                            onChange={(e) => { if (e.currentTarget.files) handleSlotImageUpload(e.currentTarget.files, i); e.currentTarget.value = ''; }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        )}
                        {uploadedImages[i] ? (
                          <div className="relative w-full h-full">
                            <Image src={uploadedImages[i]} alt={i===2? 'bedroom': i===3? 'kitchen':'restroom'} fill className="object-cover" />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                              className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-700 rounded-full px-2 py-0.5 text-[10px]"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-500 text-xs">
                            <span><svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 17V19C2 19.5304 2.22388 20.0391 2.6224 20.4142C3.02091 20.7893 3.56141 21 4.125 21H16.875C17.4386 21 17.9791 20.7893 18.3776 20.4142C18.7761 20.0391 19 19.5304 19 19V17M5.1875 11L10.5 16M10.5 16L15.8125 11M10.5 16V4" stroke="#111111" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg></span>
                            <span className="mt-1">{i===2? 'bedroom image': i===3? 'kitchen image':'restroom image'}</span>
                            {validationErrors[`gallery${i}` as keyof typeof validationErrors] && (
                              <span className="mt-1 text-red-600 text-[11px]">{validationErrors[`gallery${i}` as keyof typeof validationErrors]}</span>
                            )}
                          </div>
                        )}
                        {uploadingSlotIndex === i && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#10D1C1] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        {/* Inline error badge bottom-left when missing */}
                        {validationErrors[`gallery${i}` as keyof typeof validationErrors] && !uploadedImages[i] && (
                          <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">{validationErrors[`gallery${i}` as keyof typeof validationErrors]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-10 gap-4 flex-1">
                {/* Avatar + Title row */}
                <div className="md:col-span-10 flex items-center gap-4">
                  {/* Circle avatar uploader */}
                  <div className="shrink-0">
                    <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleProfileImageChange(e.currentTarget.files)}
                  />
                  <button
                    type="button"
                      onClick={() => profileInputRef.current?.click()}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden relative"
                      aria-label="Upload profile image"
                    >
                      {profileImageUrl ? (
                        <Image src={profileImageUrl} alt="Profile" fill className="object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-500 leading-tight text-center px-4">Enter a clear photo of you</span>
                      )}
                      {uploadingProfile && (
                        <span className="absolute inset-0 bg-white/60 flex items-center justify-center text-xs">Uploading...</span>
                      )}
                      {validationErrors.profile_image && !profileImageUrl && (
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-red-600">{validationErrors.profile_image}</span>
                      )}
                    </button>
                  </div>

                  {/* Property Title */}
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={formData.property_title}
                      onChange={(e) => handleInputChange('property_title', e.target.value)}
                      className={`w-full px-3 py-5 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[20px] ${
                        validationErrors.property_title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Apartment Title"
                    />
                    {validationErrors.property_title && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.property_title}</p>
                    )}
                  </div>
                </div>

                 {/* House no. (20%) */}
                 <div className="md:col-span-1">
                  <input
                    type="number"
                    required
                    value={formData.house_no}
                    onChange={(e) => handleInputChange('house_no', e.target.value)}
                    className={`w-full px-1 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${
                      validationErrors.house_no ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="No:"
                    pattern="[0-9]+"
                  />
                  {validationErrors.house_no && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.house_no}</p>
                  )}
                </div>
                {/* street */}
                <div className="md:col-span-3">
                  <input 
                    type="text" 
                    required
                    value={formData.street || ''} 
                    onChange={(e) => handleInputChange('street', e.target.value)} 
                    placeholder="Street" 
                    className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${validationErrors.street ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {validationErrors.street && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.street}</p>
                  )}
                </div>
                {/* Location (60%) */}
                <div className="relative md:col-span-4">
                  <input
                    ref={locationInputRef}
                    type="text"
                    required
                    maxLength={200}
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${
                      validationErrors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Start typing location..."
                  />
                  {validationErrors.location && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.location}</p>
                  )}
                  
                  {/* Location Suggestions */}
                  {showSuggestions && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {isLocationSearching ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-[#10D1C1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      ) : locationSuggestions.length > 0 ? (
                        locationSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleLocationSelect(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-black"
                          >
                            {suggestion.display_name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          No locations found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* State (20%) */}
                <div className="relative md:col-span-2 z-20">
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-gray-500 text-[14px] ${
                      validationErrors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!validationErrors.state}
                    aria-describedby={validationErrors.state ? 'state-error' : undefined}
                  >
                    <option value="">State</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {validationErrors.state && (
                    <p id="state-error" className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
                  )}
                </div>

               

                {/* Amount */}
                <div className="md:col-span-7">
                  <input
                    type="text"
                    required
                    value={formatNumberWithCommas(formData.price)}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${
                      validationErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter amount"
                    pattern="[0-9,]+(\.[0-9]{1,2})?"
                  />
                  {validationErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
                  )}
                </div>

                {/* Duration (30%) */}
                <div className="md:col-span-3">
                  <select
                    required
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-gray-500 text-[14px] ${
                      validationErrors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select duration</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                  {validationErrors.duration && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.duration}</p>
                  )}
                </div>

                {/* Bedrooms (30%) */}
                <div className="md:col-span-3">
                  <input
                    type="number"
                    required
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${
                      validationErrors.bedrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Bedrooms"
                    pattern="[0-9]+"
                  />
                  {validationErrors.bedrooms && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.bedrooms}</p>
                  )}
                </div>

                {/* Toilets (maps to bathrooms) (20%) */}
                <div className="md:col-span-2">
                  <input
                    type="number"
                    required
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${
                      validationErrors.bathrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Restroom"
                    pattern="[0-9]+(\.[0-9])?"
                  />
                  {validationErrors.bathrooms && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.bathrooms}</p>
                  )}
                </div>

                {/* Available furnishing (multi-select) (50%) */}
                <div className="relative md:col-span-5">
                  <button
                    type="button"
                    onClick={() => setIsFurnishingOpen(v => !v)}
                    className={`w-full h-[42px] px-3 py-2 border rounded-full text-left focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-black flex items-center overflow-x-auto overflow-y-hidden ${
                      validationErrors.furnishing ? 'border-red-500' : 'border-gray-300'
                    } [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400`}
                  >
                    <div className="flex gap-2 min-w-max">
                      {formData.furnishing.length === 0 ? (
                        <span className="text-gray-500 whitespace-nowrap">Select furnishing options</span>
                      ) : (
                        formData.furnishing.map(item => (
                          <span key={item} className="bg-[#E6FFFB] text-[#0FB8A8] text-xs px-2 py-1 rounded-full flex items-center whitespace-nowrap">
                            {item}
                            <span
                              onClick={(e) => { e.stopPropagation(); removeFurnishingTag(item); }}
                              className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700"
                            >×</span>
                          </span>
                        ))
                      )}
                    </div>
                  </button>
                  {isFurnishingOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {FURNISHING_OPTIONS.map(opt => (
                        <label key={opt} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer placeholder-gray-500 text-black text-[14px]">
                          <input
                            type="checkbox"
                            checked={formData.furnishing.includes(opt)}
                            onChange={() => toggleFurnishingItem(opt)}
                            className="mr-2"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}
                  {validationErrors.furnishing && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.furnishing}</p>
                  )}
                </div>

                {/* Description (full width) */}
                <div className="md:col-span-10">
                  <textarea
                    required
                    maxLength={2000}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${
                      validationErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Property agents are well-educated professionals..."
                  />
                  {validationErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                  )}
                </div>
              </div>
              </div>
              )}

              {currentStep === 2 && (
                <div className="flex gap-6">
                  {/* Left: Portrait uploads */}
                  <div className="w-[420px] grid grid-cols-2 gap-4">
                    {/* Portrait 1 */}
                    <label className={`relative block h-72 bg-gray-100 rounded-xl border border-dashed border-gray-300 overflow-hidden ${uploadingPortraitIndex===0 ? 'opacity-60' : ''}`}>
                      {!portrait1Url ? (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={uploadingPortraitIndex===0}
                            onChange={(e)=>handlePortraitUpload(e.currentTarget.files, 0)}
                          />
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm select-none">
                            <div className="flex flex-col items-center">
                              <span className="mb-2">⬇️</span>
                              <span>Photo of you</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full relative">
                          <Image src={portrait1Url} alt="Portrait 1" fill className="object-cover" />
                          <button type="button" className="absolute top-2 right-2 bg-white/80 text-xs px-2 py-1 rounded" onClick={(e)=>{e.stopPropagation(); setPortrait1Url('');}}>Remove</button>
                        </div>
                      )}
                      {uploadingPortraitIndex===0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-[#10D1C1] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {validationErrors.portrait1 && !portrait1Url && (
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[11px] px-2 py-0.5 rounded">{validationErrors.portrait1}</span>
                      )}
                    </label>

                    {/* Portrait 2 */}
                    <label className={`relative block h-72 bg-gray-100 rounded-xl border border-dashed border-gray-300 overflow-hidden ${uploadingPortraitIndex===1 ? 'opacity-60' : ''}`}>
                      {!portrait2Url ? (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={uploadingPortraitIndex===1}
                            onChange={(e)=>handlePortraitUpload(e.currentTarget.files, 1)}
                          />
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm select-none">
                            <div className="flex flex-col items-center">
                              <span className="mb-2">⬇️</span>
                              <span>More photos</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full relative">
                          <Image src={portrait2Url} alt="Portrait 2" fill className="object-cover" />
                          <button type="button" className="absolute top-2 right-2 bg-white/80 text-xs px-2 py-1 rounded" onClick={(e)=>{e.stopPropagation(); setPortrait2Url('');}}>Remove</button>
                        </div>
                      )}
                      {uploadingPortraitIndex===1 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-[#10D1C1] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {validationErrors.portrait2 && !portrait2Url && (
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[11px] px-2 py-0.5 rounded">{validationErrors.portrait2}</span>
                      )}
                    </label>
                  </div>

                  {/* Right: Fields */}
                  <div className="flex-1 space-y-4">
                    {/* Row 1: Full name 70% | Gender 30% */}
                    <div className="grid grid-cols-1 md:[grid-template-columns:70%_30%] gap-4">
                      <div>
                        <input type="text" value={formData.full_name||''} onChange={(e)=>handleInputChange('full_name', sanitizeText(e.target.value, 100))} placeholder="Your full name" className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${validationErrors.full_name? 'border-red-500':'border-gray-300'}`} />
                        {validationErrors.full_name && (<p className="text-red-500 text-sm mt-1">{validationErrors.full_name}</p>)}
                      </div>
                      <div>
                        <select value={formData.gender||''} onChange={(e)=>handleInputChange('gender', e.target.value)} className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-gray-500 text-[14px] ${validationErrors.gender? 'border-red-500':'border-gray-300'}`}> 
                          <option value="">Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {validationErrors.gender && (<p className="text-red-500 text-sm mt-1">{validationErrors.gender}</p>)}
                      </div>
                    </div>

                    {/* Row 2: Email 60% | Phone 40% */}
                    <div className="grid grid-cols-1 md:[grid-template-columns:60%_40%] gap-4">
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email_address||''}
                          onChange={(e)=>handleInputChange('email_address', e.target.value)}
                          placeholder="Enter email address"
                          className={`w-full pr-9 px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-gray-500 text-[14px] ${validationErrors.email_address? 'border-red-500':'border-gray-300'}`}
                        />
                        {/* Status icon */}
                        {emailChecking && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#10D1C1] border-t-transparent rounded-full animate-spin" aria-label="Checking email"></span>
                        )}
                        {!emailChecking && emailValid === true && (
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-label="Email valid">
                            <path d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.25a1 1 0 0 1-1.43.005L3.29 9.17a1 1 0 1 1 1.42-1.41l3.06 3.05 6.49-6.54a1 1 0 0 1 1.444.02z" fill="currentColor"/>
                          </svg>
                        )}
                        {validationErrors.email_address && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.email_address}</p>
                        )}
                      </div>
                      <div>
                        <input type="tel" value={formData.phone_number||''} onChange={(e)=>handleInputChange('phone_number', sanitizeText(e.target.value, 20))} placeholder="Enter phone number" className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-gray-500 text-[14px] ${validationErrors.phone_number? 'border-red-500':'border-gray-300'}`} />
                        {validationErrors.phone_number && (<p className="text-red-500 text-sm mt-1">{validationErrors.phone_number}</p>)}
                      </div>
                    </div>

                    {/* Row 3: Religion | Status | Age range | Pet (equal) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <select value={formData.religion||''} onChange={(e)=>handleInputChange('religion', e.target.value)} className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-gray-500 text-[14px] ${validationErrors.religion ? 'border-red-500' : 'border-gray-300'}`}>
                          <option value="">Religion</option>
                          <option>Christianity</option>
                          <option>Islam</option>
                          <option>Traditional</option>
                          <option>Other</option>
                        </select>
                        {validationErrors.religion && (<p className="text-red-500 text-sm mt-1">{validationErrors.religion}</p>)}
                      </div>
                      <div>
                        <select value={formData.status||''} onChange={(e)=>handleInputChange('status', e.target.value)} className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-gray-500 text-[14px] ${validationErrors.status ? 'border-red-500' : 'border-gray-300'}`}>
                          <option value="">Status</option>
                          <option>Student</option>
                          <option>Employed</option>
                          <option>Self-employed</option>
                          <option>Unemployed</option>
                        </select>
                        {validationErrors.status && (<p className="text-red-500 text-sm mt-1">{validationErrors.status}</p>)}
                      </div>
                      <div>
                        <select value={formData.age_range||''} onChange={(e)=>handleInputChange('age_range', e.target.value)} className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-gray-500 text-[14px] ${validationErrors.age_range ? 'border-red-500' : 'border-gray-300'}`}>
                          <option value="">Age range</option>
                          <option>18-24</option>
                          <option>25-34</option>
                          <option>35-44</option>
                          <option>45+</option>
                        </select>
                        {validationErrors.age_range && (<p className="text-red-500 text-sm mt-1">{validationErrors.age_range}</p>)}
                      </div>
                      <div>
                        <select value={formData.pet||''} onChange={(e)=>handleInputChange('pet', e.target.value)} className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-gray-500 text-[14px] ${validationErrors.pet ? 'border-red-500' : 'border-gray-300'}`}>
                          <option value="">Pet</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                        {validationErrors.pet && (<p className="text-red-500 text-sm mt-1">{validationErrors.pet}</p>)}
                      </div>
                    </div>

                    {/* Textareas */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">Tell us about yourself:</label>
                      <textarea rows={4} value={formData.about_self||''} onChange={(e)=>handleInputChange('about_self', sanitizeText(e.target.value, 2000))} className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${validationErrors.about_self? 'border-red-500':'border-gray-300'}`} placeholder="Write a short bio..." />
                      {validationErrors.about_self && (<p className="text-red-500 text-sm mt-1">{validationErrors.about_self}</p>)}
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">My dislikes:</label>
                      <textarea rows={3} value={formData.dislikes||''} onChange={(e)=>handleInputChange('dislikes', sanitizeText(e.target.value, 2000))} className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${validationErrors.dislikes? 'border-red-500':'border-gray-300'}`} placeholder="Things you don't like..." />
                      {validationErrors.dislikes && (<p className="text-red-500 text-sm mt-1">{validationErrors.dislikes}</p>)}
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">My likes:</label>
                      <textarea rows={3} value={formData.likes||''} onChange={(e)=>handleInputChange('likes', sanitizeText(e.target.value, 2000))} className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent placeholder-gray-500 text-black text-[14px] ${validationErrors.likes? 'border-red-500':'border-gray-300'}`} placeholder="Things you like..." />
                      {validationErrors.likes && (<p className="text-red-500 text-sm mt-1">{validationErrors.likes}</p>)}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons (only on Step 2) */}
              {currentStep === 2 && (
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (!canSubmit) {
                        e.preventDefault();
                        // Trigger full validation to show inline errors
                        validateFormData();
                        // Optionally scroll to first error field
                        try {
                          const firstErrorKey = Object.keys(validationErrors)[0];
                          if (firstErrorKey) {
                            document.querySelector('[data-error="' + firstErrorKey + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        } catch {}
                      }
                    }}
                    aria-disabled={!canSubmit}
                    className={`px-6 py-2 rounded-lg transition-colors ${canSubmit ? 'bg-[#10D1C1] text-white hover:bg-[#0FB8A8]' : 'bg-[#10D1C1] text-white opacity-50 cursor-not-allowed'}`}
                  >
                    {uploadingImages || uploadingPortraitIndex !== null ? 'Uploading Images...' : isLoading ? 'Listing Room...' : 'List Room'}
                  </button>
                </div>
              )}
            </form>

            {/* Success Popup Overlay */}
            <AnimatePresence>
              {showSuccessPopup && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 text-center border border-gray-200"
                    onClick={(e)=>e.stopPropagation()}
                  >
                    <div className="mx-auto w-14 h-14 rounded-full bg-[#FFBE06]/20 flex items-center justify-center mb-4">
                      <Image src="/images/rooms-page-logo.svg" alt="Listed" width={32} height={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-2">Room Listed!</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      Thanks for listing on gcrooms!<br/>
                      We&apos;ll notify you by email once your room is approved. A 5.9% commission applies to each booking, and your full details will be shared after confirmation.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        type="button"
                        onClick={handleSuccessGoBack}
                        className="px-5 py-2 rounded-full border border-[#10D1C1] text-[#10D1C1] hover:bg-[#10D1C1]/10"
                      >
                        Go Back
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
