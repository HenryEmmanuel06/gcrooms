'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CancellationExpired() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Check if user came from the proper cancellation flow
    // The check-cancellation API should pass some parameters when redirecting here
    const roomId = searchParams.get('roomId');
    const userEmail = searchParams.get('userEmail');
    
    // If no proper parameters, redirect to home (user accessed directly)
    if (!roomId && !userEmail) {
      // Check if there's a referrer from our own domain
      const referrer = document.referrer;
      const currentDomain = window.location.origin;
      
      // If no referrer or referrer is not from our domain, redirect to home
      if (!referrer || !referrer.startsWith(currentDomain)) {
        router.replace('/');
        return;
      }
    }
    
    // Valid access - show content
    setIsValid(true);
    setIsValidating(false);
  }, [router, searchParams]);

  // Show preloader while validating
  if (isValidating || !isValid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-[0px_1px_15px_0px_#0000001A] p-8 text-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10D1C1] mb-4"></div>
            <p className="text-gray-600">Validating request...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white flex items-center justify-center px-4 py-30">
      <div className="max-w-md w-full bg-white rounded-lg shadow-[0px_1px_15px_0px_#0000001A] p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Cancellation Period Expired
          </h1>
          <p className="text-gray-600 mb-6">
            The 48-hour cancellation window for this room request has expired. 
            You can no longer cancel this request automatically.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#10D1C1]/10 border border-[#10D1C1]/30 rounded-lg p-4">
            <h3 className="font-semibold text-[#10D1C1] mb-2">Need Help?</h3>
            <p className="text-sm text-gray-700 mb-3">
              If you still need to cancel or have concerns, please contact our support team directly.
            </p>
            <a
              href="mailto:support@gcrooms.com?subject=Cancellation Request - After 48hrs"
              className="inline-block bg-[#10D1C1] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0bb8aa] transition-colors"
            >
              Contact Support
            </a>
          </div>

          <div className="pt-4 border-t">
            <Link
              href="/rooms"
              className="inline-block bg-[#FFBE06] text-black px-6 py-2 rounded-md font-medium hover:bg-[#e6a905] transition-colors"
            >
              Browse Other Rooms
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-gray-500">
          <p>
            Cancellation requests are only accepted within 48 hours of payment to ensure fair treatment for all parties.
          </p>
        </div>
      </div>
    </div>
  );
}
