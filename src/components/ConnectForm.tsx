'use client';
import { useState } from 'react';
import { sanitizeFormData } from '@/utils/inputSanitizer';
import Link from 'next/link';

interface ConnectFormProps {
  roomId?: number;
  roomTitle?: string;
  roomPrice?: number;
  roomDuration?: string;
}

export default function ConnectForm({ roomId, roomPrice = 50000, roomDuration = 'monthly' }: ConnectFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '+234',
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailValidating, setEmailValidating] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Payment calculation variables
  // Compute dynamic fees based on actual room price
  const paymentFees = {
    // Service fee = 5% of actual
    serviceFee: Math.round(roomPrice * 0.05),
    // Verification fee = 3% of actual
    verificationFee: Math.round(roomPrice * 0.03),
    // Contact sharing (standalone fee) = 1000 + 3% of actual
    contactSharing: 1000 + Math.round(roomPrice * 0.03),
    // Convenience fee = 2% of actual
    convenienceFee: Math.round(roomPrice * 0.02)
  } as const;

  const totalFees = paymentFees.serviceFee + paymentFees.verificationFee + paymentFees.contactSharing + paymentFees.convenienceFee;
  const finalAmount = roomPrice + totalFees;

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle phone number input - only allow numbers, spaces, +, -, (, )
    if (name === 'phoneNumber') {
      const phoneValue = value.replace(/[^0-9+\-() ]/g, '');
      // Ensure +234 prefix is maintained
      if (!phoneValue.startsWith('+234')) {
        const numbersOnly = phoneValue.replace(/[^0-9]/g, '');
        setFormData(prev => ({
          ...prev,
          [name]: '+234' + numbersOnly
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: phoneValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateField = (fieldName: string, value: string): string => {
    const trimmedValue = value.trim();
    
    switch (fieldName) {
      case 'fullName':
        if (!trimmedValue) return 'Full name is required';
        if (trimmedValue.length < 2) return 'Name must be at least 2 characters long';
        if (trimmedValue.length > 50) return 'Name must be less than 50 characters';
        if (!/^[a-zA-Z\s\-'.]+$/.test(trimmedValue)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        return '';
        
      case 'phoneNumber':
        if (!trimmedValue) return 'Phone number is required';
        if (!trimmedValue.startsWith('+234')) return 'Phone number must start with +234';
        // Remove +234 prefix and non-numeric characters for validation
        const numbersOnly = trimmedValue.replace('+234', '').replace(/[^0-9]/g, '');
        if (numbersOnly.length !== 10) return 'Please enter exactly 10 digits after +234';
        // Check if it's a valid Nigerian phone number format
        const nigerianPattern = /^\+234[0-9]{10}$/;
        if (!nigerianPattern.test(trimmedValue.replace(/\s/g, ''))) return 'Please enter a valid Nigerian phone number';
        return '';
        
      case 'email':
        if (!trimmedValue) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) return 'Please enter a valid email address';
        return '';
        
      default:
        return '';
    }
  };

  const validateEmail = async (email: string): Promise<boolean> => {
    try {
      setEmailValidating(true);
      const response = await fetch(`/api/validate-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Email validation error:', error);
      return false;
    } finally {
      setEmailValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate all fields using custom validation
    const fieldErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName as keyof typeof formData]);
      if (error) {
        fieldErrors[fieldName] = error;
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    // Sanitize form data
    const sanitizedData = sanitizeFormData(formData);

    // Validate email with API
    const isEmailValid = await validateEmail(sanitizedData.email);
    if (!isEmailValid) {
      setErrors({ email: 'Please enter a valid, deliverable email address' });
      setIsSubmitting(false);
      return;
    }

    try {
      // Create connection attempt in database
      const response = await fetch('/api/connection-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          full_name: sanitizedData.fullName,
          email: sanitizedData.email,
          phone_number: sanitizedData.phoneNumber,
        }),
      });

      if (!response.ok) {
        // If response is not JSON, get text for debugging
        const text = await response.text();
        console.error('API Response:', text);
        throw new Error(`API Error: ${response.status} - ${text.substring(0, 200)}`);
      }

      const result = await response.json();

      // Store attempt ID and show payment details
      setAttemptId(result.attempt_id);
      setShowPaymentDetails(true);
      
      console.log('Connection attempt created:', result);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to send connection request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentClick = async () => {
    if (!attemptId) {
      setErrors({ submit: 'No connection attempt found. Please try again.' });
      return;
    }

    if (!termsAccepted) {
      setErrors({ submit: 'Please read and accept the terms and conditions before proceeding.' });
      return;
    }

    setIsProcessingPayment(true);
    setErrors({});

    try {
      // Initialize Paystack payment
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connection_attempt_id: attemptId,
          email: formData.email,
          amount: finalAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize payment');
      }

      console.log('Payment initialized:', result);
      
      // Redirect to Paystack checkout
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        throw new Error('No authorization URL received from Paystack');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to process payment. Please try again.' });
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="relative">
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
      {/* Payment Details Overlay */}
      {showPaymentDetails && (
        <div 
          className="absolute inset-0 z-50"
          style={{
            animation: 'slideInFromRight 0.5s ease-out forwards'
          }}
        >
          <div className="bg-white rounded-2xl p-[50px] pb-[50px] shadow-2xl w-full shadow-[0px_1px_25px_0px_#0000001A,_0px_0px_3px_0px_#00000012]">
            <div className="mb-[35px]">
              <h3 className="text-[24px] font-semibold text-black">Payment Details:</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFBE06] text-black px-[25px] py-[10px] rounded-full text-[20px] font-bold">{formatCurrency(roomPrice)}</span>
                <span className="bg-[#10D1C159] text-black px-[25px] py-[10px] rounded-full text-[20px]">{roomDuration}</span>
              </div>
              
              <div className="text-[14px] text-[#11111180] tracking-wide font-light italic py-[10px]">
                We charge 10% of the room prices as charges and each of the above sub fees have a standard percentage in the 10%
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[16px]">
                  <span className="text-[16px] text-[#333333]">Service fee:</span>
                  <span className="font-medium text-[#333333]">5%</span>
                </div>
                <div className="flex justify-between text-[16px]">
                  <span className="text-[16px] text-[#333333]">Verification fee:</span>
                  <span className="font-medium text-[#333333]">3%</span>
                </div>
                <div className="flex justify-between text-[16px]">
                  <span className="text-[16px] text-[333333]">Convenience fee:</span>
                  <span className="font-medium text-[#333333]">2%</span>
                </div>
                <div className="flex justify-between text-[16px]">
                  <span className="text-[16px] text-[333333]">Contact sharing:</span>
                  <span className="font-medium text-[#333333]">{formatCurrency(1000)}<span className="text-[#11111180] italic font-light"> (plus 3%)</span></span>
                </div>
                <div className="flex justify-between text-[20px] mt-[20px]">
                  <span className="text-black font-medium">Total amount:</span>
                  <span className="text-black font-extrabold">{formatCurrency(finalAmount)}</span>
                </div>
              </div>
              <hr className="my-3 border-black" />
              <div className="flex items-center mt-4">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="sr-only" 
                  />
                  <label 
                    htmlFor="terms" 
                    className="flex items-center cursor-pointer"
                  >
                    <div className={`w-5 h-5 border-2 rounded-sm mr-3 flex items-center justify-center transition-colors ${
                      termsAccepted 
                        ? 'bg-black border-black' 
                        : 'bg-white border-gray-400 hover:border-gray-600'
                    }`}>
                      {termsAccepted && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">I have read the terms and conditions</span>
                  </label>
                </div>
              </div>
              
              <button
                onClick={handlePaymentClick}
                disabled={isProcessingPayment}
                className="bg-[#FFBE06] disabled:bg-[#10D1C1] disabled:text-white disabled:cursor-not-allowed text-[#222222] font-medium py-[15px] px-[35px] rounded-full text-sm transition-colors duration-200 mt-4 cursor-pointer"
                style={{
                  boxShadow: '0px 0px 10px 0px #660ED180'
                }}
              >
                {isProcessingPayment ? 'Processing...' : 'Proceed To Payment'}
              </button>
              
              {errors.submit && (
                <p className="text-sm text-red-600 text-left">{errors.submit}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-2xl p-6 shadow-[0px_1px_25px_0px_#0000001A,_0px_0px_3px_0px_#00000012]">
      <h3 className="text-[24px] font-semibold text-black tracking-wide mb-6">Get Connected Now:</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Field */}
        <div>
          <div className="relative bg-[#F4F4F4] rounded-2xl py-[20px] px-[15px] border border-[#C3C3C3]">
            <label className="block text-[18px] font-medium text-black mb-3">
              My full name is:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14C14 11.7909 11.3137 10 8 10C4.68629 10 2 11.7909 2 14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className={`w-full pl-[25px] pr-4 text-[16px] placeholder-[#9CA3AF]`}
              />
            </div>
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Phone and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Number Field */}
          <div>
            <div className="relative bg-[#F4F4F4] rounded-2xl py-[20px] px-[15px] border border-[#C3C3C3]">
              <label className="block text-[18px] font-medium text-black mb-3">
                My phone number is:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5 11.2V13.2C14.5008 13.3985 14.4586 13.5951 14.3761 13.7775C14.2936 13.9599 14.1726 14.1238 14.0208 14.2583C13.869 14.3928 13.6898 14.4947 13.4938 14.5574C13.2978 14.6201 13.0898 14.6421 12.885 14.622C10.8425 14.3945 8.89501 13.6847 7.2 12.55C5.64214 11.5147 4.35862 10.1312 3.45 8.5C2.31002 6.80499 1.60022 4.85751 1.375 2.815C1.35494 2.61016 1.37697 2.40222 1.43966 2.20623C1.50235 2.01024 1.60423 1.83103 1.73873 1.67923C1.87323 1.52743 2.0371 1.40643 2.21949 1.32391C2.40188 1.24139 2.59851 1.19921 2.797 1.2H4.797C5.15856 1.19632 5.50904 1.32336 5.78022 1.55735C6.0514 1.79133 6.22321 2.11486 6.265 2.475C6.34338 3.19495 6.51953 3.90086 6.79 4.575C6.89478 4.83 6.92812 5.10827 6.88651 5.37907C6.8449 5.64987 6.72998 5.90404 6.555 6.115L5.715 6.955C6.68334 8.58404 8.11596 10.0167 9.745 10.985L10.585 10.145C10.796 9.97002 11.0501 9.8551 11.3209 9.81349C11.5917 9.77188 11.87 9.80522 12.125 9.91C12.7991 10.1805 13.5051 10.3566 14.225 10.435C14.5901 10.4773 14.9186 10.6538 15.1526 10.9298C15.3866 11.2058 15.5087 11.5608 15.5 11.925V11.2Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone"
                  className={`w-full pl-[25px] pr-4 text-[16px] placeholder-[#9CA3AF]`}
                />
              </div>
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <div className="relative bg-[#F4F4F4] rounded-2xl py-[20px] px-[15px] border border-[#C3C3C3]">
              <label className="block text-[18px] font-medium text-black mb-3">
                My email address is:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.66667 2.66669H13.3333C14.0667 2.66669 14.6667 3.26669 14.6667 4.00002V12C14.6667 12.7334 14.0667 13.3334 13.3333 13.3334H2.66667C1.93333 13.3334 1.33333 12.7334 1.33333 12V4.00002C1.33333 3.26669 1.93333 2.66669 2.66667 2.66669Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.6667 4L8 8.66667L1.33333 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full pl-[25px] pr-4 text-[16px] placeholder-[#9CA3AF]`}
                />
                {emailValidating && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#10D1C1]"></div>
                  </div>
                )}
              </div>
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || emailValidating}
            className="w-full bg-[#FFBE06] disabled:bg-[#10D1C1] disabled:text-white disabled:cursor-not-allowed text-black font-semibold py-4 px-6 rounded-full text-[16px] transition-colors duration-200 cursor-pointer"
            style={{
              boxShadow: '0px 0px 10px 0px #660ED180'
            }}
          >
            {isSubmitting ? 'Connecting...' : 'Connect with roommate'}
          </button>
          
          {errors.submit && (
            <p className="mt-2 text-sm text-red-600 text-center">{errors.submit}</p>
          )}
        </div>

        {/* Support Link */}
        <div className="text-center pt-2">
          <Link href="#contact-us"
            className="text-[#222222] hover:text-gray-800 text-[14px]"
          >
            Get help from support
          </Link>
        </div>
      </form>
    </div>
    </div>
  );
}
