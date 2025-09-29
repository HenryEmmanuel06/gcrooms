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

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const reference = params?.reference;
  if (!reference) {
    redirect('/payment/failed?error=missing_reference');
  }

  const base = await getBaseUrlFromHeaders();
  const res = await fetch(`${base}/api/connection-attempts/verify?reference=${encodeURIComponent(reference!)}`, { cache: 'no-store' });

  if (!res.ok) {
    redirect('/payment/failed?error=not_found');
  }
  const data = await res.json();

  // Only allow rendering if verified status is success
  if (data.status !== 'success') {
    redirect(`/payment/failed?reference=${encodeURIComponent(reference!)}&status=${encodeURIComponent(data.status || 'failed')}`);
  }

  const amount = typeof data.amount === 'number' ? data.amount : null;

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center p-4 mt-[80px] h-[100vh]" style={{
        maxHeight: "900px",
      }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your connection request has been processed successfully.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 mb-1">Transaction Reference</div>
            <div className="font-mono text-sm text-gray-900 break-all">{reference}</div>
            {amount !== null && (
              <>
                <div className="text-sm text-gray-500 mb-1 mt-3">Amount Paid</div>
                <div className="text-lg font-semibold text-gray-900">₦{Number(amount).toLocaleString()}</div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              You will receive a confirmation email shortly. The room owner will be notified of your interest.You can cancel within 48hrs of payment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/rooms" 
                className="flex-1 text-[14px] bg-[#660ED1] text-white py-3 px-6 rounded-full font-medium hover:bg-[#5a0cb8] transition-colors"
              >
                Browse More Rooms
              </Link>
              <Link 
                href="/" 
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-200 transition-colors text-[14px]"
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
          </div>
        </div>
      </div>
    </>
  );
}
