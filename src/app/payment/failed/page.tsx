import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getBaseUrlFromHeaders(): Promise<string> {
  const h = await headers();
  const xfProto = h.get('x-forwarded-proto') || 'https';
  const xfHost = h.get('x-forwarded-host');
  if (xfHost) return `${xfProto}://${xfHost}`;
  const host = h.get('host');
  const proto = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${proto}://${host}`;
}

export default async function PaymentFailedPage({ searchParams }: { searchParams: { reference?: string, error?: string } }) {
  const reference = searchParams?.reference;
  const errorParam = searchParams?.error;

  if (!reference) {
    // if no reference at all, just render generic failed
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center p-4 pt-[120px]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-gray-600">Payment reference is missing. Please try again.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const base = await getBaseUrlFromHeaders();
  const res = await fetch(`${base}/api/connection-attempts/verify?reference=${encodeURIComponent(reference)}`, { cache: 'no-store' });
  if (!res.ok) {
    // not found - keep failed page
  } else {
    const data = await res.json();
    // If backend says success, do not allow showing failed; redirect to success
    if (data.status === 'success') {
      redirect(`/payment/success?reference=${encodeURIComponent(reference)}`);
    }
  }

  const errorMessage = (() => {
    switch (errorParam) {
      case 'missing_reference':
        return 'Payment reference is missing. Please try again.';
      case 'configuration_error':
        return 'Payment system configuration error. Please contact support.';
      case 'verification_failed':
        return 'Payment verification failed. Please try again.';
      case 'verification_unsuccessful':
        return 'Payment could not be verified. Please contact support if money was debited.';
      case 'database_update_failed':
        return 'Payment processed but record update failed. Please contact support.';
      case 'internal_error':
        return 'An internal error occurred. Please try again.';
      default:
        return 'Payment was not successful. Please try again.';
    }
  })();

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center p-4 pt-[120px]">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600">{errorMessage}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 mb-1">Transaction Reference</div>
            <div className="font-mono text-sm text-gray-900 break-all">{reference}</div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Don't worry! No money has been charged to your account. You can try again or contact support if you need assistance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/rooms" 
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Browse Rooms
              </Link>
              <Link 
                href="/" 
                className="flex-1 bg-[#660ED1] text-white py-3 px-6 rounded-full font-medium hover:bg-[#5a0cb8] transition-colors text-center"
              >
                Go Home
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:gcroomscompany@gmail.com" className="text-[#660ED1] hover:underline">
              gcroomscompany@gmail.com
              </a>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Please include the transaction reference when contacting support.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
