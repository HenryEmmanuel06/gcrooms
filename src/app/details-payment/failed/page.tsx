'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function DetailsPaymentFailedContent() {
  const searchParams = useSearchParams();

  const error = searchParams.get('error') || undefined;
  const details = searchParams.get('details') || undefined;
  const reference = searchParams.get('reference') || undefined;
  const status = searchParams.get('status') || undefined;
  const source = searchParams.get('source') || undefined;

  useEffect(() => {
    // Log detailed error info to the browser console to help debug
    console.error('[DetailsPaymentFailed] Payment error', {
      error,
      details,
      reference,
      status,
      source,
    });

    if (details) {
      console.error('[DetailsPaymentFailed] Raw details:', decodeURIComponent(details));
    }
  }, [error, details, reference, status, source]);

  const getErrorMessage = () => {
    if (error === 'database_update_failed') {
      return 'Payment was processed but we encountered an issue updating our records. Please contact support with your reference.';
    }
    if (error === 'record_not_found') {
      return 'Payment record not found. Please contact support.';
    }
    if (error === 'invalid_payment_id') {
      return 'Invalid payment information. Please try again.';
    }
    if (status === 'failed') {
      return 'Payment was not successful. Please try again.';
    }
    return 'Payment failed. Please try again or contact support if the problem persists.';
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center p-4 mt-[80px] h-[100vh]" style={{
        maxHeight: "900px",
      }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600">{getErrorMessage()}</p>
          </div>

          {reference && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-500 mb-1">Transaction Reference</div>
              <div className="font-mono text-sm text-gray-900 break-all">{reference}</div>
            </div>
          )}

          {details && process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
              <div className="text-sm text-gray-600 font-semibold mb-1">Error Details (Dev):</div>
              <div className="text-xs text-gray-700 font-mono break-all">{details}</div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/profiles" 
                className="flex-1 text-[14px] bg-[#660ED1] text-white py-3 px-6 rounded-full font-medium hover:bg-[#5a0cb8] transition-colors"
              >
                Try Again
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

export default function DetailsPaymentFailedPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <div className="flex items-center justify-center p-4 mt-[80px] h-[100vh]" style={{ maxHeight: "900px" }}>
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    }>
      <DetailsPaymentFailedContent />
    </Suspense>
  );
}

