import Link from 'next/link';

export default function CancellationSuccess() {
  return (
    <div className="bg-gray-50 flex items-center justify-center px-4 py-10 sm:py-20">
      <div className="max-w-md w-full bg-white rounded-lg shadow-[0px_1px_15px_0px_#0000001A] p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Request Submitted Successfully
          </h1>
          <p className="text-gray-600 mb-6">
            Your cancellation request has been sent to our support team. We&apos;ll process your request and get back to you within 24 hours.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Our team will review your cancellation request</li>
              <li>• You&apos;ll receive a confirmation email within 24 hours</li>
              <li>• If approved, refunds are processed within 3-5 business days</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Need to contact us directly?</strong>
            </p>
            <p className="text-sm text-gray-600">
              Email: gcroomscompany@gmail.com
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/rooms"
              className="inline-block bg-[#10D1C1] text-white px-6 py-3 rounded-md font-medium hover:bg-[#0bb8aa] transition-colors"
            >
              Back to Rooms
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-gray-500">
          <p>
            Your request has been logged with timestamp {new Date().toLocaleString()} for security purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
