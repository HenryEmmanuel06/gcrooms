import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Resolve the correct base URL for redirects in both local and production
function getBaseUrl(request: NextRequest): string {
  // Priority 1: explicit site URL from env (e.g. https://gcrooms.com)
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // Priority 2: use x-forwarded headers set by proxies (Vercel/NGINX)
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Fallback: derive from the incoming request URL
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');

    // Use reference or trxref (Paystack sends both)
    const transactionRef = reference || trxref;

    if (!transactionRef) {
      return NextResponse.redirect(
        new URL('/payment/failed?error=missing_reference', request.url)
      );
    }

    // Validate environment variables
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error('Paystack secret key not configured');
      return NextResponse.redirect(
        new URL('/payment/failed?error=configuration_error', request.url)
      );
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${transactionRef}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!verifyResponse.ok) {
      console.error('Paystack verification failed:', verifyResponse.status);
      return NextResponse.redirect(
        new URL('/payment/failed?error=verification_failed', request.url)
      );
    }

    const verificationData = await verifyResponse.json();

    if (!verificationData.status) {
      console.error('Paystack verification unsuccessful:', verificationData.message);
      return NextResponse.redirect(
        new URL('/payment/failed?error=verification_unsuccessful', request.url)
      );
    }

    const transaction = verificationData.data;
    const connectionAttemptId = transaction.reference;

    console.log('🔍 Transaction details:', {
      id: transaction.id,
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      customer: transaction.customer,
      gateway_response: transaction.gateway_response,
      paid_at: transaction.paid_at,
      currency: transaction.currency
    });

    // First check if record exists and get current columns
    const { data: existingRecord, error: selectError } = await supabase
      .from('connection_attempts')
      .select('*')
      .eq('id', connectionAttemptId)
      .single();

    if (selectError || !existingRecord) {
      console.error('❌ Record not found:', { connectionAttemptId, selectError });
      const baseUrl = 'http://localhost:3001';
      return NextResponse.redirect(
        new URL('/payment/failed?error=record_not_found', baseUrl)
      );
    }

    console.log('✅ Found existing record:', existingRecord);

    // Update with all payment fields now that we know they exist
    const updateData: Record<string, unknown> = {
      transaction_id: transaction.id,
      transaction_status: transaction.status,
      amount: transaction.amount / 100, // Convert from kobo to naira
      payment_email: transaction.customer?.email || existingRecord.email,
      paystack_ref: transaction.reference,
      payment_status: transaction.status,
      gateway_response: transaction.gateway_response || 'Successful',
      paid_at: transaction.paid_at || new Date().toISOString(),
      currency: transaction.currency || 'NGN',
      status: transaction.status === 'success' ? 'success' : 'failed'
    };

    console.log('📝 Complete update data:', updateData);

    console.log('📝 Updating database with:', updateData);

    const { data: updatedAttempt, error: updateError } = await supabase
      .from('connection_attempts')
      .update(updateData)
      .eq('id', connectionAttemptId)
      .select('*')
      .single();

    if (updateError) {
      console.error('❌ Database update failed:', updateError);
      console.error('❌ Update error details:', JSON.stringify(updateError, null, 2));
      console.error('❌ Update error code:', updateError.code);
      console.error('❌ Update error message:', updateError.message);
      console.error('❌ Connection attempt ID:', connectionAttemptId);
      console.error('❌ Update data being sent:', JSON.stringify(updateData, null, 2));
      
      // Check if the record exists first
      const { data: existingRecord, error: selectError } = await supabase
        .from('connection_attempts')
        .select('*')
        .eq('id', connectionAttemptId)
        .single();
      
      console.error('❌ Existing record check:', { existingRecord, selectError });
      
      // Dynamic base URL
      const baseUrl = getBaseUrl(request);
      return NextResponse.redirect(
        new URL(`/payment/failed?error=database_update_failed&details=${encodeURIComponent(updateError.message)}`, baseUrl)
      );
    }

    console.log('✅ Database updated successfully:', updatedAttempt);
    console.log('✅ Payment callback processed successfully:', {
      reference: connectionAttemptId,
      status: transaction.status,
      amount: transaction.amount / 100
    });

    // Dynamic base URL
    const baseUrl = getBaseUrl(request);

    console.log(`🔄 Redirecting based on status: ${transaction.status}`);

    // Redirect based on payment status
    if (transaction.status === 'success') {
      console.log('✅ Redirecting to success page');
      return NextResponse.redirect(
        new URL(`/payment/success?reference=${connectionAttemptId}&amount=${transaction.amount / 100}`, baseUrl)
      );
    } else {
      console.log(`❌ Redirecting to failed page - Status: ${transaction.status}`);
      return NextResponse.redirect(
        new URL(`/payment/failed?reference=${connectionAttemptId}&status=${transaction.status}&reason=${encodeURIComponent(transaction.gateway_response || 'Transaction failed')}`, baseUrl)
      );
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    const baseUrl = getBaseUrl(request);
    return NextResponse.redirect(
      new URL('/payment/failed?error=internal_error', baseUrl)
    );
  }
}

// Handle POST requests as well (some payment gateways use POST for callbacks)
export async function POST(request: NextRequest) {
  return GET(request);
}
