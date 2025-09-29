import Link from 'next/link';

export default function CancellationExpired() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cancellation Period Expired
          </h1>
          <p className="text-gray-600 mb-6">
            The 48-hour cancellation window for this room request has expired. 
            You can no longer cancel this request automatically.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-800 mb-3">
              If you still need to cancel or have concerns, please contact our support team directly.
            </p>
            <a
              href="mailto:support@gcrooms.com?subject=Cancellation Request - After 48hrs"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>

          <div className="pt-4 border-t">
            <Link
              href="/rooms"
              className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors"
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
