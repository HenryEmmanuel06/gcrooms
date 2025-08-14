"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg"></div>
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase environment variables are not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface FormData {
  property_title: string;
  location: string;
  price: string;
  bathrooms: string;
  room_size: string;
  furniture: string;
  wifi_zone: boolean;
  description: string;
  room_features: string;
  building_type: string;
  latitude?: string;
  longitude?: string;
}

interface RoomData {
  property_title: string;
  location: string;
  price: number;
  bathrooms: number;
  room_size: number;
  furniture: string;
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
}

interface ListRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ListRoomModal({ isOpen, onClose }: ListRoomModalProps) {
  const [formData, setFormData] = useState<FormData>({
    property_title: '',
    location: '',
    price: '',
    bathrooms: '',
    room_size: '',
    furniture: '',
    wifi_zone: false,
    description: '',
    room_features: '',
    building_type: '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: string; lon: string } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Search for location suggestions using Nominatim
  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setIsLocationSearching(false);
      return;
    }

    setIsLocationSearching(true);
    setShowSuggestions(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=ng`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setLocationSuggestions(data);
      setIsLocationSearching(false);
    } catch (error) {
      // Silently handle errors - don't show suggestions if API fails
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setIsLocationSearching(false);
      console.log(error);
      
    }
  };

  // Handle location input change
  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
    
    // Clear suggestions if input is cleared
    if (!value.trim()) {
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
      searchLocation(value);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setFormData(prev => ({ ...prev, location: suggestion.display_name }));
    setSelectedLocation({ lat: suggestion.lat, lon: suggestion.lon });
    setShowSuggestions(false);
    setShowMap(true);
    
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
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.property_title.trim()) {
        throw new Error('Property title is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('Valid price is required');
      }
      if (!selectedLocation) {
        throw new Error('Please select a location from the suggestions');
      }

             const roomData = {
         property_title: formData.property_title.trim(),
         location: formData.location.trim(),
         price: parseFloat(formData.price),
         bathrooms: parseFloat(formData.bathrooms) || 0,
         room_size: parseFloat(formData.room_size) || 0,
         furniture: formData.furniture,
         wifi_zone: formData.wifi_zone,
         description: formData.description.trim(),
         room_features: formData.room_features.trim(),
         building_type: formData.building_type,
         latitude: parseFloat(selectedLocation.lat),
         longitude: parseFloat(selectedLocation.lon),
         created_at: new Date().toISOString(),
         room_img_1: uploadedImages[0] || undefined,
         room_img_2: uploadedImages[1] || undefined,
         room_img_3: uploadedImages[2] || undefined,
         room_img_4: uploadedImages[3] || undefined,
         room_img_5: uploadedImages[4] || undefined,
       };

      // Test database connection first
      await testDatabaseConnection();

             // Insert the room data
       const result = await insertRoomData(roomData);

      alert('Room listed successfully!');
      onClose();
             setFormData({
         property_title: '',
         location: '',
         price: '',
         bathrooms: '',
         room_size: '',
         furniture: '',
         wifi_zone: false,
         description: '',
         room_features: '',
         building_type: '',
       });
       setSelectedLocation(null);
       setShowMap(false);
       setUploadedImages([]);
    } catch (error) {
      // Show more detailed error information
      if (error instanceof Error) {
        let errorMessage = error.message;
        
        // Handle specific Supabase errors
        if (error.message.includes('JWT')) {
          errorMessage = 'Authentication error. Please check your Supabase configuration.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please check your database policies.';
        } else if (error.message.includes('column') && error.message.includes('does not exist')) {
          errorMessage = 'Database schema error. Some required columns are missing.';
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Data validation error. Please check your input values.';
        }
        
        alert(`Error listing room: ${errorMessage}`);
      } else {
        alert('Error listing room. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      throw new Error('Failed to compress image');
    }
  };

  // Upload image to Supabase Storage
  const uploadImageToStorage = async (file: Blob, fileName: string): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
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
      throw new Error('Failed to upload image');
    }
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList) => {
    if (uploadedImages.length >= 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);

    try {
      const fileArray = Array.from(files);
      const newImages: string[] = [];

      for (let i = 0; i < fileArray.length && uploadedImages.length + newImages.length < 5; i++) {
        const file = fileArray[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          continue;
        }

        // Compress image
        const compressedBlob = await compressImage(file);
        
        // Generate unique filename
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        
        // Upload to storage
        const imageUrl = await uploadImageToStorage(compressedBlob, fileName);
        newImages.push(imageUrl);
      }

      setUploadedImages(prev => [...prev, ...newImages]);
    } catch (error) {
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">List Your Room</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.property_title}
                    onChange={(e) => handleInputChange('property_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-black"
                    placeholder="Enter property title"
                  />
                </div>

                {/* Location */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    ref={locationInputRef}
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-black"
                    placeholder="Start typing location..."
                  />
                  
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

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (per month) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-black"
                    placeholder="Enter price"
                    min="0"
                  />
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Bathrooms *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-black"
                    placeholder="Enter number of bathrooms"
                    min="0"
                    step="0.5"
                  />
                </div>

                {/* Room Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Size (sq ft) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.room_size}
                    onChange={(e) => handleInputChange('room_size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-black"
                    placeholder="Enter room size"
                    min="0"
                  />
                </div>

                {/* Furniture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furniture *
                  </label>
                  <select
                    required
                    value={formData.furniture}
                    onChange={(e) => handleInputChange('furniture', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-black"
                  >
                    <option value="">Select furniture option</option>
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-furnished">Semi-furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>

                {/* Building Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Building Type *
                  </label>
                  <select
                    required
                    value={formData.building_type}
                    onChange={(e) => handleInputChange('building_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-black"
                  >
                    <option value="">Select building type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                {/* WiFi Zone */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="wifi_zone"
                    checked={formData.wifi_zone}
                    onChange={(e) => handleInputChange('wifi_zone', e.target.checked)}
                    className="w-4 h-4 text-[#10D1C1] border-gray-300 rounded focus:ring-[#10D1C1] focus:ring-2"
                  />
                  <label htmlFor="wifi_zone" className="ml-2 text-sm font-medium text-gray-700">
                    WiFi Zone Available
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-black"
                  placeholder="Describe your room, amenities, and what makes it special..."
                />
              </div>

                             {/* Room Features */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Room Features
                 </label>
                 <textarea
                   value={formData.room_features}
                   onChange={(e) => handleInputChange('room_features', e.target.value)}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent text-black"
                   placeholder="List additional features (e.g., balcony, parking, gym access...)"
                 />
               </div>

               {/* Room Images */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Room Images (Max 5)
                 </label>
                 
                 {/* File Input */}
                 <input
                   ref={fileInputRef}
                   type="file"
                   multiple
                   accept="image/*"
                   onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                   className="hidden"
                 />
                 
                 {/* Upload Button */}
                 <button
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   disabled={uploadedImages.length >= 5 || uploadingImages}
                   className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#10D1C1] hover:text-[#10D1C1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {uploadingImages ? (
                     <span className="flex items-center justify-center">
                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#10D1C1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Uploading...
                     </span>
                   ) : (
                     <span className="flex items-center justify-center">
                       <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                       {uploadedImages.length >= 5 ? 'Maximum images reached' : 'Upload Images'}
                     </span>
                   )}
                 </button>
                 
                 {/* Image Preview Grid */}
                 {uploadedImages.length > 0 && (
                   <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                     {uploadedImages.map((imageUrl, index) => (
                       <div key={index} className="relative group">
                         <img
                           src={imageUrl}
                           alt={`Room image ${index + 1}`}
                           className="w-full h-32 object-cover rounded-lg"
                         />
                         <button
                           type="button"
                           onClick={() => removeImage(index)}
                           className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           ×
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

              {/* Map Display */}
              {showMap && selectedLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Confirmation
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <MapComponent
                      lat={parseFloat(selectedLocation.lat)}
                      lng={parseFloat(selectedLocation.lon)}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Please confirm this is the correct location for your room.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !selectedLocation}
                  className="px-6 py-2 bg-[#10D1C1] text-white rounded-lg hover:bg-[#0FB8A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Listing Room...' : 'List Room'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
