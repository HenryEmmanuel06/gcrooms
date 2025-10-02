'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function CancellationFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    roomId: '',
    userEmail: '',
    roomTitle: '',
    ownerCancel: 'false',
    payerName: '',
    payerEmail: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const roomId = searchParams.get('roomId');
    const userEmail = searchParams.get('userEmail');
    const roomTitle = searchParams.get('roomTitle');
    const ownerCancel = searchParams.get('ownerCancel');
    const payerName = searchParams.get('payerName');
    const payerEmail = searchParams.get('payerEmail');
    
    // Validate required parameters
    if (!roomId || !userEmail || !roomTitle) {
      router.replace('/');
      return;
    }
    
    setFormData({
      roomId: roomId,
      userEmail: userEmail,
      roomTitle: roomTitle,
      ownerCancel: ownerCancel || 'false',
      payerName: payerName || '',
      payerEmail: payerEmail || '',
      reason: ''
    });
    
    setIsValid(true);
    setIsValidating(false);
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      alert('Please provide a reason for cancellation.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/send-cancellation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        router.push('/cancellation-success');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to send cancellation request'}`);
      }
    } catch (error) {
      console.error('Error submitting cancellation:', error);
      alert('Failed to send cancellation request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const isOwnerCancel = formData.ownerCancel === 'true';

  return (
    <div className="bg-gray-50 flex items-center justify-center px-4 py-10 sm:py-20">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-[0px_1px_15px_0px_#0000001A] p-8">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2 text-center">
            Cancellation Request
          </h1>
          <p className="text-gray-600 text-center">
            {isOwnerCancel 
              ? "Submit a cancellation request for a user's payment on your room"
              : "Submit a cancellation request for your room payment"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Non-editable email template preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Email Preview (Non-editable)</h3>
            <div className="bg-white border rounded p-4 text-sm">
              <div className="mb-2">
                <strong>To:</strong> gcroomscompany@gmail.com
              </div>
              <div className="mb-2">
                <strong>Subject:</strong> {isOwnerCancel 
                  ? `Room Owner Cancellation Request - ${formData.roomTitle}`
                  : `Cancellation Request - ${formData.roomTitle}`
                }
              </div>
              <div className="border-t pt-2 mt-2">
                <strong>Message:</strong>
                <div className="mt-2 whitespace-pre-line text-gray-700">
                  {isOwnerCancel ? (
                    <>
                      Hello GCrooms Admin,
                      
                      I want to cancel the request the user that paid made for my room.
                      
                      Room: {formData.roomTitle}
                      
                      User that paid:
                      Full Name: {formData.payerName || 'Not provided'}
                      Email Address: {formData.payerEmail || 'Not provided'}
                      
                      My email (room owner): {formData.userEmail}
                      
                      Reason for my cancellation:
                    </>
                  ) : (
                    <>
                      Hello GCrooms Admin,
                      
                      I would like to cancel my request regarding the room: {formData.roomTitle}.
                      
                      My payment email: {formData.userEmail}
                      
                      Reason for cancellation:
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Editable reason field */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Your Reason for Cancellation *
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a detailed reason for your cancellation request..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10D1C1] focus:border-transparent"
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be added to the end of the email template above.
            </p>
          </div>

          {/* Security notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Security Notice</h4>
                <p className="text-sm text-blue-700">
                  The email subject and template cannot be modified to prevent fraudulent cancellation requests. 
                  Only your reason for cancellation can be added to the message.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.reason.trim()}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Request...
                </>
              ) : (
                'Send Cancellation Request'
              )}
            </button>
            <Link
              href="/rooms"
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors text-center"
            >
              Cancel & Go Back
            </Link>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t text-xs text-gray-500 text-center">
          <p>
            Cancellation requests are processed within 24 hours during business days.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CancellationForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-[0px_1px_15px_0px_#0000001A] p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10D1C1] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CancellationFormContent />
    </Suspense>
  );
}
