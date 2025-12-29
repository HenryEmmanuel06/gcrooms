import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const send_details_id = searchParams.get('send_details_id');
    const profile_id = searchParams.get('profile_id');

    if (!send_details_id || !profile_id) {
      return NextResponse.json(
        { error: 'Missing required parameters: send_details_id, profile_id' },
        { status: 400 }
      );
    }

    // Verify send_details exists
    const { data: sendDetails, error: detailsError } = await supabase
      .from('send_details')
      .select('id, profile_id')
      .eq('id', send_details_id)
      .single();

    if (detailsError || !sendDetails) {
      return NextResponse.json(
        { error: 'Details not found' },
        { status: 404 }
      );
    }

    // Verify profile exists and get email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email_address, full_name')
      .eq('id', profile_id)
      .single();

    if (profileError || !profile || !profile.email_address) {
      return NextResponse.json(
        { error: 'Profile not found or email not available' },
        { status: 404 }
      );
    }

    // Always create a fresh payment attempt for each mail button click.
    // We do NOT reuse old attempts; abandoned attempts stay as-is.
    const paymentUuid = uuidv4();
    const paymentReference = `details_${send_details_id}_${Date.now()}`;

    // Initialize Paystack payment
    const amount = 1000; // Fixed amount of 1000 naira

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack configuration missing' },
        { status: 500 }
      );
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: profile.email_address,
        amount: amount * 100, // Paystack expects amount in kobo
        reference: paymentReference,
        callback_url: 'https://gcrooms.vercel.app/api/details-payment/callback',
        metadata: {
          send_details_id: send_details_id,
          profile_id: profile_id,
          payment_uuid: paymentUuid, // Add UUID to metadata
          payment_type: 'details_access',
          custom_fields: [
            {
              display_name: "Send Details ID",
              variable_name: "send_details_id",
              value: send_details_id
            },
            {
              display_name: "Profile ID",
              variable_name: "profile_id",
              value: profile_id
            },
            {
              display_name: "Payment UUID",
              variable_name: "payment_uuid",
              value: paymentUuid
            }
          ]
        }
      }),
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.text();
      console.error('Paystack initialization failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || 'Payment initialization failed' },
        { status: 500 }
      );
    }

    // Create a simple payment attempt row for this click
    const { error: paymentError } = await supabase
      .from('details_payment_attempts')
      .insert({
        profile_id: Number(profile_id),
        send_details_id: Number(send_details_id),
        amount: amount,
        currency: 'NGN',
        payment_email: profile.email_address,
        paystack_ref: paymentReference,
        payment_uuid: paymentUuid,
        payment_status: 'pending',
      });

    if (paymentError) {
      console.error('Failed to create payment attempt record:', paymentError);
      // We still redirect the user to Paystack; record-keeping failure should not block payment UI
    } else {
      console.log('✅ Created new payment attempt record with UUID:', paymentUuid);
    }

    console.log('Details payment initialized successfully:', {
      reference: paymentReference,
      payment_uuid: paymentUuid,
      amount: amount,
      email: profile.email_address
    });

    // Redirect to Paystack checkout
    if (paystackData.data?.authorization_url) {
      return NextResponse.redirect(paystackData.data.authorization_url);
    }

    return NextResponse.json(
      { error: 'No authorization URL received' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Details payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

