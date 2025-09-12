import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface InitializePaymentRequest {
  connection_attempt_id: string;
  email: string;
  amount: number;
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack configuration missing' },
        { status: 500 }
      );
    }

    const body: InitializePaymentRequest = await request.json();
    const { connection_attempt_id, email, amount } = body;

    // Validate required fields
    if (!connection_attempt_id || !email || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: connection_attempt_id, email, amount' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Verify connection attempt exists and is pending
    const { data: connectionAttempt, error: fetchError } = await supabase
      .from('connection_attempts')
      .select('id, status, email')
      .eq('id', connection_attempt_id)
      .single();

    if (fetchError || !connectionAttempt) {
      return NextResponse.json(
        { error: 'Connection attempt not found' },
        { status: 404 }
      );
    }

    if (connectionAttempt.status !== 'pending') {
      return NextResponse.json(
        { error: 'Connection attempt is not in pending status' },
        { status: 400 }
      );
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: amount * 100, // Paystack expects amount in kobo (multiply by 100)
        reference: connection_attempt_id, // Use connection attempt ID as reference
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: {
          connection_attempt_id: connection_attempt_id,
          custom_fields: [
            {
              display_name: "Connection Attempt ID",
              variable_name: "connection_attempt_id",
              value: connection_attempt_id
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

    // Update connection attempt with payment details
    const { error: updateError } = await supabase
      .from('connection_attempts')
      .update({
        amount: amount,
        payment_email: email,
        status: 'payment_initiated'
      })
      .eq('id', connection_attempt_id);

    if (updateError) {
      console.error('Failed to update connection attempt:', updateError);
      // Continue anyway since Paystack transaction was created
    }

    console.log('Payment initialized successfully:', {
      reference: connection_attempt_id,
      amount: amount,
      email: email
    });

    return NextResponse.json({
      success: true,
      data: paystackData.data,
      reference: connection_attempt_id,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
