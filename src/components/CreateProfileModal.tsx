"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import {
  sanitizeText,
  sanitizeNumber,
  validateImageFile,
  generateSecureFilename,
  isValidCoordinate,
  RateLimiter,
} from "@/utils/security";

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormState = {
  full_name: string;
  age: string;
  occupation: string;
  location: string;
  state: string;
  about: string;
  monthly_budget: string;
  duration: string;
  cleanliness_level: string;
  pet_friendly: boolean;
  smoking: boolean;
  overnight_guests: string;
  phone_number: string;
  email_address: string;
  noise_level: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

export default function CreateProfileModal({ isOpen, onClose }: CreateProfileModalProps) {
  const [form, setForm] = useState<FormState>({
    full_name: "",
    age: "",
    occupation: "",
    location: "",
    state: "",
    about: "",
    monthly_budget: "",
    duration: "",
    cleanliness_level: "",
    pet_friendly: false,
    smoking: false,
    overnight_guests: "",
    phone_number: "",
    email_address: "",
    noise_level: "",
  });
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [profilePortrait1Url, setProfilePortrait1Url] = useState<string>("");
  const [profilePortrait2Url, setProfilePortrait2Url] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const emailValidateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const locationRateLimiter = useRef(new RateLimiter(5, 10000)); // 5 requests per 10 seconds

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Validate email with Abstract API
  const validateEmailWithAbstract = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailValid(false);
      setValidationErrors((prev) => ({ ...prev, email_address: "Enter a valid email format" }));
      return;
    }
    try {
      setEmailChecking(true);
      const res = await fetch(`/api/validate-email?email=${encodeURIComponent(email)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { valid: boolean; reason?: string } = await res.json();
      const isValid = data.valid === true;
      setEmailValid(isValid);
      if (!isValid) {
        setValidationErrors((prev) => ({ ...prev, email_address: "Email is not deliverable" }));
      } else {
        setValidationErrors((prev) => ({ ...prev, email_address: "" }));
      }
    } catch (err) {
      console.error("Abstract email validation failed:", err);
    } finally {
      setEmailChecking(false);
    }
  };

  // Debounce email validation: validate 2s after user stops typing
  useEffect(() => {
    // Reset validation when field is empty
    if (!form.email_address) {
      setEmailValid(null);
      if (emailValidateTimeoutRef.current) clearTimeout(emailValidateTimeoutRef.current);
      return;
    }
    if (emailValidateTimeoutRef.current) clearTimeout(emailValidateTimeoutRef.current);
    emailValidateTimeoutRef.current = setTimeout(() => {
      validateEmailWithAbstract(form.email_address);
    }, 2000);
    return () => {
      if (emailValidateTimeoutRef.current) clearTimeout(emailValidateTimeoutRef.current);
    };
  }, [form.email_address]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
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

  // Helper function to format number with commas
  const formatNumberWithCommas = (value: string): string => {
    const numericValue = value.replace(/[^\d]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Helper function to remove commas and get numeric value
  const getNumericValue = (value: string): string => {
    return value.replace(/,/g, '');
  };

  // Search for location suggestions using Nominatim with rate limiting
  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setIsLocationSearching(false);
      return;
    }

    if (!locationRateLimiter.current.isAllowed('location_search')) {
      console.warn('Location search rate limit exceeded');
      return;
    }

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
    const sanitizedValue = sanitizeText(value, 200);
    handleChange("location", sanitizedValue);

    if (validationErrors.location) {
      setValidationErrors((prev) => ({ ...prev, location: '' }));
    }

    if (!sanitizedValue.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setIsLocationSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(sanitizedValue);
    }, 500);
  };

  // Handle location selection
  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    if (!isValidCoordinate(suggestion.lat, suggestion.lon)) {
      console.error('Invalid coordinates received');
      return;
    }

    const sanitizedDisplayName = sanitizeText(suggestion.display_name, 200);
    handleChange("location", sanitizedDisplayName);
    setShowSuggestions(false);

    if (validationErrors.location) {
      setValidationErrors((prev) => ({ ...prev, location: '' }));
    }

    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
  };

  const handleChange = (key: keyof FormState, value: string | boolean) => {
    setValidationErrors((prev) => ({ ...prev, [key]: "" }));
    if (typeof value === "boolean") {
      setForm((prev) => ({ ...prev, [key]: value }));
      return;
    }

    let sanitizedValue = value;
    switch (key) {
      case "phone_number":
        // Only allow numbers and plus sign for phone
        sanitizedValue = value.replace(/[^\d+]/g, "");
        break;
      case "monthly_budget":
        // Remove commas and allow only numbers and decimal point for budget
        const numericValue = value.replace(/,/g, "").replace(/[^\d.]/g, "");
        sanitizedValue = numericValue;
        break;
      case "age":
        // Only allow numbers for age
        sanitizedValue = value.replace(/[^\d]/g, "");
        break;
      case "email_address":
        sanitizedValue = sanitizeText(value, 200);
        // Reset API validation on edit
        setEmailValid(null);
        if (validationErrors.email_address) {
          setValidationErrors((prev) => ({ ...prev, email_address: "" }));
        }
        break;
      case "full_name":
      case "occupation":
        sanitizedValue = sanitizeText(value, 150);
        break;
      case "location":
        sanitizedValue = sanitizeText(value, 200);
        break;
      case "state":
      case "cleanliness_level":
      case "duration":
      case "noise_level":
      case "overnight_guests":
        sanitizedValue = sanitizeText(value, 150);
        break;
      case "about":
        sanitizedValue = sanitizeText(value, 2000);
        break;
      default:
        sanitizedValue = sanitizeText(value);
    }

    setForm((prev) => ({ ...prev, [key]: sanitizedValue }));
  };

  const compressImage = async (file: File): Promise<Blob> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/compress-image", { method: "POST", body: formData });
    if (!response.ok) throw new Error("Image compression failed");
    return response.blob();
  };

  const uploadImageToStorage = async (file: Blob, fileName: string): Promise<string> => {
    if (!supabase) throw new Error("Supabase is not configured");
    
    // Upload the file - the upload will fail if bucket doesn't exist
    // We don't check bucket existence first because listBuckets might require admin permissions
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("profile_image")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Check for specific error types
      if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("does not exist")) {
        throw new Error("Bucket 'profile_image' not found. Please verify the bucket name in Supabase Storage matches exactly (case-sensitive).");
      }
      if (uploadError.message?.includes("new row violates row-level security")) {
        throw new Error("Upload failed due to permissions. Please check that the bucket has INSERT policies for anonymous users.");
      }
      throw uploadError;
    }
    
    // Use the path from upload response if available, otherwise use fileName
    const filePath = uploadData?.path || fileName;
    console.log("Uploaded file path:", filePath);
    
    // Get public URL using the correct path
    const { data: urlData } = supabase.storage.from("profile_image").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;
    
    console.log("Generated public URL:", publicUrl);
    
    // Note: The bucket might not be public yet, which will cause 404 errors when accessing the URL
    // The user needs to make the bucket public in Supabase dashboard
    
    return publicUrl;
  };

  const uploadAndSetImage = async (
    files: FileList | null,
    setUrl: (url: string) => void,
    errorKey: keyof Record<string, string>
  ) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingImage(true);
    setError("");
    setValidationErrors((prev) => ({ ...prev, [errorKey]: "" }));
    try {
      const validation = await validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || "Invalid image");
      }
      const compressed = await compressImage(file);
      const fileName = generateSecureFilename(file.name);
      const url = await uploadImageToStorage(compressed, fileName);
      console.log("Setting image URL for", errorKey, url);
      setUrl(url);
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.error("Image upload error", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
      setValidationErrors((prev) => ({ ...prev, [errorKey]: errorMessage as string }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    await uploadAndSetImage(files, setProfileImageUrl, "profile_photo");
  };

  const handlePortrait1Upload = async (files: FileList | null) => {
    await uploadAndSetImage(files, setProfilePortrait1Url, "profile_protrait1");
  };

  const handlePortrait2Upload = async (files: FileList | null) => {
    await uploadAndSetImage(files, setProfilePortrait2Url, "profile_protrait2");
  };

  // Helper function to count words
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.full_name.trim()) errs.full_name = "Full name is required";
    const ageVal = sanitizeNumber(form.age, 16, 120);
    if (ageVal === null) errs.age = "Age must be between 16 and 120";
    if (!form.occupation.trim()) errs.occupation = "Occupation is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.about.trim()) {
      errs.about = "About section is required";
    } else {
      const wordCount = countWords(form.about);
      if (wordCount < 20) {
        errs.about = `Please write at least 20 words about yourself (currently ${wordCount} word${wordCount !== 1 ? 's' : ''})`;
      }
    }
    const budgetVal = sanitizeNumber(getNumericValue(form.monthly_budget), 0, 1000000000);
    if (budgetVal === null) errs.monthly_budget = "Enter a valid monthly budget";
    if (!form.duration.trim()) errs.duration = "Duration is required";
    if (!form.cleanliness_level.trim()) errs.cleanliness_level = "Cleanliness level is required";
    if (!form.overnight_guests.trim()) errs.overnight_guests = "Overnight guests preference is required";
    if (!form.noise_level.trim()) errs.noise_level = "Noise level is required";
    if (!profileImageUrl) errs.profile_photo = "Profile photo is required";
    if (form.email_address && emailValid !== true && !emailChecking) {
      errs.email_address = "Please wait for email validation";
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Check if form can be submitted (all fields filled and image uploaded)
  const canSubmit = (): boolean => {
    const aboutWordCount = countWords(form.about);
    return (
      !submitting &&
      !uploadingImage &&
      !emailChecking &&
      form.full_name.trim() !== "" &&
      form.age.trim() !== "" &&
      form.occupation.trim() !== "" &&
      form.location.trim() !== "" &&
      form.state.trim() !== "" &&
      form.about.trim() !== "" &&
      aboutWordCount >= 20 &&
      form.monthly_budget.trim() !== "" &&
      form.duration.trim() !== "" &&
      form.cleanliness_level.trim() !== "" &&
      form.overnight_guests.trim() !== "" &&
      form.noise_level.trim() !== "" &&
      profileImageUrl !== "" &&
      (emailValid === true || (form.email_address.trim() === "" && emailValid === null))
    );
  };

  const resetForm = () => {
    setForm({
      full_name: "",
      age: "",
      occupation: "",
      location: "",
      state: "",
      about: "",
      monthly_budget: "",
      duration: "",
      cleanliness_level: "",
      pet_friendly: false,
      smoking: false,
      overnight_guests: "",
      phone_number: "",
      email_address: "",
      noise_level: "",
    });
    setProfileImageUrl("");
    setProfilePortrait1Url("");
    setProfilePortrait2Url("");
    setValidationErrors({});
    setError("");
    setSuccess("");
    setEmailValid(null);
    setEmailChecking(false);
    setShowSuccessPopup(false);
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSuccessGoBack = () => {
    setShowSuccessPopup(false);
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) return;

    if (!supabase) {
      setError("Supabase is not configured");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        full_name: sanitizeText(form.full_name, 150),
        age: sanitizeNumber(form.age, 16, 120),
        occupation: sanitizeText(form.occupation, 150),
        location: sanitizeText(form.location, 200),
        state: sanitizeText(form.state, 120),
        about: sanitizeText(form.about, 2000),
        profile_photo: profileImageUrl,
        monthly_budget: sanitizeNumber(getNumericValue(form.monthly_budget), 0, 1000000000),
        duration: sanitizeText(form.duration, 120),
        cleanliness_level: sanitizeText(form.cleanliness_level, 120),
        pet_friendly: !!form.pet_friendly,
        smoking: !!form.smoking,
        overnight_guests: sanitizeText(form.overnight_guests, 120),
        phone_number: form.phone_number.replace(/[^\d+]/g, ""),
        email_address: sanitizeText(form.email_address, 220),
        noise_level: sanitizeText(form.noise_level, 120),
        profile_protrait1: profilePortrait1Url || null,
        profile_protrait2: profilePortrait2Url || null,
      };

      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to create profile");
      }

      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Create profile error", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { if (!showSuccessPopup) onClose(); }}
        >
          <motion.div
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold text-black">Create your profile</h3>
                <p className="text-sm text-gray-500">Verified profiles build trust with room owners.</p>
              </div>
              <button
                type="button"
                onClick={() => { if (!showSuccessPopup) onClose(); }}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.full_name ? "border-red-500" : "border-gray-200"}`}
                    placeholder="Sarah Chen"
                  />
                  {validationErrors.full_name && <p className="text-red-600 text-sm mt-1">{validationErrors.full_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input
                    value={form.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.age ? "border-red-500" : "border-gray-200"}`}
                    placeholder="26"
                    inputMode="numeric"
                  />
                  {validationErrors.age && <p className="text-red-600 text-sm mt-1">{validationErrors.age}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation *</label>
                  <input
                    value={form.occupation}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.occupation ? "border-red-500" : "border-gray-200"}`}
                    placeholder="UX Designer"
                  />
                  {validationErrors.occupation && <p className="text-red-600 text-sm mt-1">{validationErrors.occupation}</p>}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred location *</label>
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={form.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.location ? "border-red-500" : "border-gray-200"}`}
                    placeholder="Start typing location..."
                  />
                  {validationErrors.location && <p className="text-red-600 text-sm mt-1">{validationErrors.location}</p>}

                  {/* Location Suggestions */}
                  {showSuggestions && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.state ? "border-red-500" : "border-gray-200"}`}
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {validationErrors.state && <p className="text-red-600 text-sm mt-1">{validationErrors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget *</label>
                  <input
                    value={formatNumberWithCommas(form.monthly_budget)}
                    onChange={(e) => {
                      const numericValue = getNumericValue(e.target.value);
                      handleChange("monthly_budget", numericValue);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.monthly_budget ? "border-red-500" : "border-gray-200"}`}
                    placeholder="300,000"
                    inputMode="numeric"
                  />
                  {validationErrors.monthly_budget && <p className="text-red-600 text-sm mt-1">{validationErrors.monthly_budget}</p>}
                </div>
              </div>

              {/* About */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About you *</label>
                <textarea
                  value={form.about}
                  onChange={(e) => handleChange("about", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-3 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.about ? "border-red-500" : "border-gray-200"}`}
                  rows={3}
                  placeholder="Tell room owners about yourself, your lifestyle, and what you're looking for..."
                />
                <div className="flex items-center justify-between mt-1">
                  {validationErrors.about ? (
                    <p className="text-red-600 text-sm">{validationErrors.about}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Minimum 20 words required
                    </p>
                  )}
                  <p className={`text-xs ${countWords(form.about) >= 20 ? "text-green-600" : "text-gray-500"}`}>
                    {countWords(form.about)} / 20 words
                  </p>
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                  <select
                    value={form.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.duration ? "border-red-500" : "border-gray-200"}`}
                  >
                    <option value="">Select Duration</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="6 months">6 months</option>
                    <option value="3 months">3 months</option>
                    <option value="1 year">1 year</option>
                  </select>
                  {validationErrors.duration && <p className="text-red-600 text-sm mt-1">{validationErrors.duration}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness level *</label>
                  <select
                    value={form.cleanliness_level}
                    onChange={(e) => handleChange("cleanliness_level", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.cleanliness_level ? "border-red-500" : "border-gray-200"}`}
                  >
                    <option value="">Select Cleanliness Level</option>
                    <option value="Neat">Neat</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Very Clean">Very Clean</option>
                    <option value="Organized">Organized</option>
                  </select>
                  {validationErrors.cleanliness_level && <p className="text-red-600 text-sm mt-1">{validationErrors.cleanliness_level}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overnight guests *</label>
                  <select
                    value={form.overnight_guests}
                    onChange={(e) => handleChange("overnight_guests", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.overnight_guests ? "border-red-500" : "border-gray-200"}`}
                  >
                    <option value="">Select Preference</option>
                    <option value="Never">Never</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Often">Often</option>
                    <option value="Rarely">Rarely</option>
                  </select>
                  {validationErrors.overnight_guests && <p className="text-red-600 text-sm mt-1">{validationErrors.overnight_guests}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Noise level *</label>
                  <select
                    value={form.noise_level}
                    onChange={(e) => handleChange("noise_level", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.noise_level ? "border-red-500" : "border-gray-200"}`}
                  >
                    <option value="">Select Noise Level</option>
                    <option value="Quiet">Quiet</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Lively">Lively</option>
                    <option value="Very Quiet">Very Quiet</option>
                  </select>
                  {validationErrors.noise_level && <p className="text-red-600 text-sm mt-1">{validationErrors.noise_level}</p>}
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pet friendly</p>
                    <p className="text-xs text-gray-500">Do you have or plan to have pets?</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange("pet_friendly", !form.pet_friendly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.pet_friendly ? "bg-[#10D1C1]" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${form.pet_friendly ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Smoking</p>
                    <p className="text-xs text-gray-500">Do you smoke?</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange("smoking", !form.smoking)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.smoking ? "bg-[#10D1C1]" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${form.smoking ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent border-gray-200"
                    placeholder="+1234567890"
                    inputMode="tel"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email"
                    value={form.email_address}
                    onChange={(e) => handleChange("email_address", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 pr-9 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.email_address ? "border-red-500" : "border-gray-200"}`}
                    placeholder="your.email@example.com"
                  />
                  {/* Email validation status icon */}
                  {emailChecking && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#10D1C1] border-t-transparent rounded-full animate-spin" aria-label="Checking email"></span>
                  )}
                  {!emailChecking && emailValid === true && (
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-label="Email valid">
                      <path d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.25a1 1 0 0 1-1.43.005L3.29 9.17a1 1 0 1 1 1.42-1.41l3.06 3.05 6.49-6.54a1 1 0 0 1 1.444.02z" fill="currentColor" />
                    </svg>
                  )}
                  {validationErrors.email_address && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.email_address}</p>
                  )}
                </div>
              </div>

              {/* Profile photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile photo *</label>
                <div className={`flex items-center gap-4 rounded-xl border border-dashed ${validationErrors.profile_photo ? "border-red-400" : "border-gray-300"} p-4`}>
                  <div className="relative h-20 w-20 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                    {profileImageUrl ? (
                      <>
                        <img 
                          src={profileImageUrl} 
                          alt="" 
                          className="object-cover w-full h-full rounded-full" 
                          onError={(e) => {
                            console.error("Image failed to load from URL:", profileImageUrl);
                            console.error("Error details:", e);
                            // Show error state
                            const img = e.currentTarget;
                            img.style.display = "none";
                            // Try alternative URL format
                            const altUrl = profileImageUrl.replace('/storage/v1/object/public/', '/storage/v1/object/sign/');
                            console.log("Trying alternative URL format:", altUrl);
                          }}
                          onLoad={() => {
                            console.log("Profile image loaded successfully from:", profileImageUrl);
                          }}
                        />
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-gray-700 rounded-full z-10">
                            Uploading...
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-gray-500 text-center px-2">PNG/JPG up to 10MB</span>
                      </div>
                    )}
                    {uploadingImage && !profileImageUrl && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-gray-700 rounded-full z-10">
                        Uploading...
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.currentTarget.files)}
                      disabled={uploadingImage}
                      className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-full file:border-0 file:bg-[#FFBE06] file:px-4 file:py-2 file:text-black file:font-semibold hover:file:bg-[#f0b400] cursor-pointer"
                    />
                    {validationErrors.profile_photo && <p className="text-red-600 text-sm">{validationErrors.profile_photo}</p>}
                  </div>
                </div>
              </div>

          {/* Profile Portrait Photos (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional profile photos (optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Portrait 1 */}
              <div className="rounded-xl border border-dashed border-gray-300 p-4">
                <p className="text-xs text-gray-500 mb-2">Portrait 1</p>
                <div className="rounded-2xl overflow-hidden bg-gray-100 h-32 mb-3">
                  {profilePortrait1Url ? (
                    <img
                      src={profilePortrait1Url}
                      alt="Portrait 1"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      PNG/JPG up to 10MB
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePortrait1Upload(e.currentTarget.files)}
                  disabled={uploadingImage}
                  className="block w-full text-xs text-gray-700 file:mr-3 file:rounded-full file:border-0 file:bg-[#FFBE06] file:px-4 file:py-2 file:text-black file:font-semibold hover:file:bg-[#f0b400] cursor-pointer"
                />
                {validationErrors.profile_protrait1 && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors.profile_protrait1}</p>
                )}
              </div>

              {/* Portrait 2 */}
              <div className="rounded-xl border border-dashed border-gray-300 p-4">
                <p className="text-xs text-gray-500 mb-2">Portrait 2</p>
                <div className="rounded-2xl overflow-hidden bg-gray-100 h-32 mb-3">
                  {profilePortrait2Url ? (
                    <img
                      src={profilePortrait2Url}
                      alt="Portrait 2"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      PNG/JPG up to 10MB
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePortrait2Upload(e.currentTarget.files)}
                  disabled={uploadingImage}
                  className="block w-full text-xs text-gray-700 file:mr-3 file:rounded-full file:border-0 file:bg-[#FFBE06] file:px-4 file:py-2 file:text-black file:font-semibold hover:file:bg-[#f0b400] cursor-pointer"
                />
                {validationErrors.profile_protrait2 && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors.profile_protrait2}</p>
                )}
              </div>
            </div>
          </div>

              {/* Status messages */}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit() || submitting}
                  className={`px-6 py-2 rounded-full bg-[#10D1C1] text-black font-semibold shadow-[0px_0px_10px_0px_#660ED180] hover:bg-[#0FB8A8] transition ${
                    !canSubmit() || submitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? "Creating..." : "Create Profile"}
                </button>
              </div>
            </form>

            {/* Success Popup Overlay */}
            <AnimatePresence>
              {showSuccessPopup && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 text-center border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="mx-auto w-14 h-14 rounded-full bg-[#10D1C1]/20 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-[#10D1C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-2">Profile Created!</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      Your profile has been submitted for verification.<br />
                      <br />
                      Thanks for creating your profile on gcrooms! We&apos;ll review your profile and notify you once it&apos;s verified. Verified profiles build trust with room owners and increase your chances of finding the perfect match.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        type="button"
                        onClick={handleSuccessGoBack}
                        className="px-5 py-2 rounded-full border border-[#10D1C1] text-[#10D1C1] hover:bg-[#10D1C1]/10 transition"
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

