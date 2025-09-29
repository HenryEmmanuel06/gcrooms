'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CancelRedirect() {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Opening Email Client
          </h1>
          <p className="text-gray-600 mb-6">
            We're opening your default email client to send a cancellation request to our support team.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Email Not Opening?</h3>
            <p className="text-sm text-yellow-800 mb-3">
              If your email client didn't open automatically, you can click the button below or copy the email address.
            </p>
            {mailtoLink && (
              <a
                href={mailtoLink}
                className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
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
              className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors"
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
