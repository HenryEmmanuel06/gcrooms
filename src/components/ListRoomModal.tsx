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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: string; lon: string } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=ng`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      // Silently handle errors - don't show suggestions if API fails
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle location input change
  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
    
    // Clear suggestions if input is cleared
    if (!value.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
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
      const { data, error } = await supabase
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
  const insertRoomData = async (roomData: any) => {
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
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {locationSuggestions.map((suggestion, index) => (
                                                 <button
                           key={index}
                           type="button"
                           onClick={() => handleLocationSelect(suggestion)}
                           className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-black"
                         >
                           {suggestion.display_name}
                         </button>
                      ))}
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
