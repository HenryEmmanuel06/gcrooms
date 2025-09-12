import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

type PaystackChargeData = {
  reference: string;
  id: string | number;
  amount: number; // in kobo
  customer: { email: string };
  status: string;
  gateway_response?: string;
  paid_at?: string;
  currency?: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack configuration missing' },
        { status: 500 }
      );
    }

    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      console.error('Missing Paystack signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify Paystack signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse the webhook payload
    const event = JSON.parse(body);
    
    console.log('Paystack webhook received:', {
      event: event.event,
      reference: event.data?.reference
    });

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;
      
      case 'transfer.success':
      case 'transfer.failed':
        // Handle transfer events if needed
        console.log(`Transfer event: ${event.event}`);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleChargeSuccess(data: PaystackChargeData) {
  try {
    const connectionAttemptId = data.reference;
    const transactionId = data.id;
    const amount = data.amount / 100; // Convert from kobo to naira
    const customerEmail = data.customer.email;
    const status = data.status;

    console.log('Processing successful charge:', {
      reference: connectionAttemptId,
      transaction_id: transactionId,
      amount: amount,
      status: status
    });

    // Update connection attempt in database with all required fields
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('connection_attempts')
      .update({
        transaction_id: transactionId,
        transaction_status: status,
        amount: amount,
        payment_email: customerEmail,
        paystack_ref: data.reference,
        payment_status: status,
        gateway_response: data.gateway_response || 'Successful',
        paid_at: data.paid_at || new Date().toISOString(),
        currency: data.currency || 'NGN',
        status: 'payment_completed'
      })
      .eq('id', connectionAttemptId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Failed to update connection attempt on success:', updateError);
      return;
    }

    console.log('Connection attempt updated successfully:', updatedAttempt.id);

    // Here you could add additional logic like:
    // - Send confirmation email
    // - Notify room owner
    // - Create notification records
    
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

async function handleChargeFailed(data: PaystackChargeData) {
  try {
    const connectionAttemptId = data.reference;
    const transactionId = data.id;
    const amount = data.amount / 100; // Convert from kobo to naira
    const customerEmail = data.customer.email;
    const status = data.status;

    console.log('Processing failed charge:', {
      reference: connectionAttemptId,
      transaction_id: transactionId,
      amount: amount,
      status: status
    });

    // Update connection attempt in database with all required fields
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('connection_attempts')
      .update({
        transaction_id: transactionId,
        transaction_status: status,
        amount: amount,
        payment_email: customerEmail,
        paystack_ref: data.reference,
        payment_status: status,
        gateway_response: data.gateway_response || 'Failed',
        paid_at: data.paid_at || new Date().toISOString(),
        currency: data.currency || 'NGN',
        status: 'payment_failed'
      })
      .eq('id', connectionAttemptId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Failed to update connection attempt on failure:', updateError);
      return;
    }

    console.log('Connection attempt marked as failed:', updatedAttempt.id);

    // Here you could add additional logic like:
    // - Send failure notification email
    // - Log failed payment attempt
    // - Trigger retry mechanism
    
  } catch (error) {
    console.error('Error handling charge failure:', error);
  }
}
