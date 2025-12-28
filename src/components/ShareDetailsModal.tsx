"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sanitizeText } from "@/utils/security";

interface ShareDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  profileId: number;
}

type FormState = {
  your_name: string;
  greeting_message: string;
  about_apartment: string;
  phone: string;
  whatsapp: string;
  location: string;
  additional_info: string;
};

export default function ShareDetailsModal({ isOpen, onClose, profileName, profileId }: ShareDetailsModalProps) {
  const [form, setForm] = useState<FormState>({
    your_name: "",
    greeting_message: "",
    about_apartment: "",
    phone: "",
    whatsapp: "",
    location: "",
    additional_info: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

  const handleChange = (key: keyof FormState, value: string) => {
    setValidationErrors((prev) => ({ ...prev, [key]: "" }));
    let sanitizedValue = value;
    
    switch (key) {
      case "phone":
      case "whatsapp":
        // Only allow numbers and plus sign for phone
        sanitizedValue = value.replace(/[^\d+]/g, "");
        break;
      case "your_name":
        sanitizedValue = sanitizeText(value, 150);
        break;
      case "greeting_message":
      case "about_apartment":
      case "additional_info":
        sanitizedValue = sanitizeText(value, 2000);
        break;
      case "location":
        sanitizedValue = sanitizeText(value, 200);
        break;
      default:
        sanitizedValue = sanitizeText(value);
    }

    setForm((prev) => ({ ...prev, [key]: sanitizedValue }));
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.your_name.trim()) errs.your_name = "Your name is required";
    if (!form.greeting_message.trim()) errs.greeting_message = "Greeting message is required";
    if (!form.about_apartment.trim()) errs.about_apartment = "About your apartment is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.whatsapp.trim()) errs.whatsapp = "WhatsApp number is required";
    if (!form.location.trim()) errs.location = "Your location is required";

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setForm({
      your_name: "",
      greeting_message: "",
      about_apartment: "",
      phone: "",
      whatsapp: "",
      location: "",
      additional_info: "",
    });
    setValidationErrors({});
    setError("");
    setSuccess("");
    setShowSuccessPopup(false);
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

    setSubmitting(true);
    try {
      const payload = {
        profile_id: profileId,
        your_name: sanitizeText(form.your_name, 150),
        greeting_message: sanitizeText(form.greeting_message, 2000),
        about_apartment: sanitizeText(form.about_apartment, 2000),
        phone: form.phone.replace(/[^\d+]/g, ""),
        whatsapp: form.whatsapp.replace(/[^\d+]/g, ""),
        location: sanitizeText(form.location, 200),
        additional_info: sanitizeText(form.additional_info, 2000) || null,
      };

      const response = await fetch("/api/send-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        const errorData = errText ? JSON.parse(errText) : { error: "Failed to save details" };
        throw new Error(errorData.error || "Failed to save details");
      }

      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Share details error", err);
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
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold text-black">Share Your Details</h3>
                <p className="text-sm text-gray-500">Let {profileName} know you're interested! Share your apartment details and contact info.</p>
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
              {/* Your Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={form.your_name}
                  onChange={(e) => handleChange("your_name", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.your_name ? "border-red-500" : "border-gray-200"}`}
                  placeholder="Enter your full name"
                />
                {validationErrors.your_name && <p className="text-red-600 text-sm mt-1">{validationErrors.your_name}</p>}
              </div>

              {/* Greeting Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Greeting Message *</label>
                <textarea
                  value={form.greeting_message}
                  onChange={(e) => handleChange("greeting_message", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-3 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.greeting_message ? "border-red-500" : "border-gray-200"}`}
                  rows={3}
                  placeholder="Hi! I saw your profile and think you'd be a great fit..."
                />
                {validationErrors.greeting_message && <p className="text-red-600 text-sm mt-1">{validationErrors.greeting_message}</p>}
              </div>

              {/* About Your Apartment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About Your Apartment *</label>
                <textarea
                  value={form.about_apartment}
                  onChange={(e) => handleChange("about_apartment", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-3 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.about_apartment ? "border-red-500" : "border-gray-200"}`}
                  rows={4}
                  placeholder="Describe your apartment: size, amenities, room available, location details, etc."
                />
                {validationErrors.about_apartment && <p className="text-red-600 text-sm mt-1">{validationErrors.about_apartment}</p>}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={`w-full rounded-lg border pl-10 pr-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.phone ? "border-red-500" : "border-gray-200"}`}
                      placeholder="+234 801 234 5678"
                    />
                  </div>
                  {validationErrors.phone && <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.652a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                      className={`w-full rounded-lg border pl-10 pr-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.whatsapp ? "border-red-500" : "border-gray-200"}`}
                      placeholder="+234 802 345 6789"
                    />
                  </div>
                  {validationErrors.whatsapp && <p className="text-red-600 text-sm mt-1">{validationErrors.whatsapp}</p>}
                </div>
              </div>

              {/* Your Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Location *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent ${validationErrors.location ? "border-red-500" : "border-gray-200"}`}
                  placeholder="Ikeja, Lagos State (e.g., Victoria Island, Lagos)"
                />
                {validationErrors.location && <p className="text-red-600 text-sm mt-1">{validationErrors.location}</p>}
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                <textarea
                  value={form.additional_info}
                  onChange={(e) => handleChange("additional_info", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-black focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent"
                  rows={3}
                  placeholder="Any other details you'd like to share (rent price, move-in date, house rules, etc.)"
                />
              </div>

              {/* Required fields note */}
              <p className="text-xs text-gray-500">* Required fields. Your details will be shared directly with {profileName}.</p>

              {/* Status messages */}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              {/* Submit Button */}
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
                  disabled={submitting}
                  className={`px-6 py-2 rounded-full bg-[#10D1C1] text-black font-semibold shadow-[0px_0px_10px_0px_#660ED180] hover:bg-[#0FB8A8] transition flex items-center gap-2 ${
                    submitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {submitting ? "Sharing..." : "Share My Details"}
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
                    <h3 className="text-xl font-semibold text-black mb-2">Details Shared!</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      Your details have been successfully shared with {profileName}. They will contact you soon!
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        type="button"
                        onClick={handleSuccessGoBack}
                        className="px-5 py-2 rounded-full border border-[#10D1C1] text-[#10D1C1] hover:bg-[#10D1C1]/10 transition"
                      >
                        Close
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

