'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function CancelRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mailtoLink, setMailtoLink] = useState<string>('');

  useEffect(() => {
    const mailto = searchParams.get('mailto');
    if (mailto) {
      setMailtoLink(decodeURIComponent(mailto));
      // Automatically trigger the mailto link
      window.location.href = decodeURIComponent(mailto);
    }
  }, [searchParams]);

  return (
    <div className="bg-white flex items-center justify-center px-4 py-30">
      <div className="max-w-md w-full bg-white rounded-lg shadow-[0px_1px_15px_0px_#0000001A] p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-[#10D1C1]/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#10D1C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Opening Email Client
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;re opening your default email client to send a cancellation request to our support team.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#FFBE06]/10 border border-[#FFBE06]/30 rounded-lg p-4">
            <h3 className="font-semibold text-[#FFBE06] mb-2">Email Not Opening?</h3>
            <p className="text-sm text-gray-700 mb-3">
              If your email client didn&apos;t open automatically, you can click the button below or copy the email address.
            </p>
            {mailtoLink && (
              <a
                href={mailtoLink}
                className="inline-block bg-[#FFBE06] text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[#e6a905] transition-colors"
              >
                Open Email Client
              </a>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Support Email:</strong> support@gcrooms.com
            </p>
            <p className="text-xs text-gray-600">
              Please include your payment email and reason for cancellation in your message.
            </p>
          </div>

          <div className="pt-4 border-t">
            <Link
              href="/rooms"
              className="inline-block bg-[#10D1C1] text-white px-6 py-2 rounded-md font-medium hover:bg-[#0bb8aa] transition-colors"
            >
              Back to Rooms
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-gray-500">
          <p>
            Cancellation requests are processed within 24 hours during business days.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CancelRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-lg shadow-[0px_1px_15px_0px_#0000001A] p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10D1C1] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CancelRedirectContent />
    </Suspense>
  );
}
