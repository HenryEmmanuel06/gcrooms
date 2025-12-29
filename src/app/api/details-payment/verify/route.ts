import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const paymentId = searchParams.get('payment_id');
    const reference = searchParams.get('reference');

    if (!paymentId || !reference) {
      return NextResponse.json(
        { error: 'Missing payment_id or reference' },
        { status: 400 }
      );
    }

    const numericId = Number(paymentId);
    if (!Number.isFinite(numericId)) {
      return NextResponse.json(
        { error: 'Invalid payment_id' },
        { status: 400 }
      );
    }

    // Look up the attempt in the new attempts table
    const { data, error } = await supabase
      .from('details_payment_attempts')
      .select('id, amount, payment_status, paystack_ref')
      .eq('id', numericId)
      .eq('paystack_ref', reference)
      .maybeSingle();

    if (error || !data) {
      console.error('Verify: payment attempt not found or error', { error, paymentId: numericId, reference });
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: data.id,
      amount: data.amount,
      status: data.payment_status,
      reference: data.paystack_ref,
    });
  } catch (error) {
    console.error('Details payment verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

