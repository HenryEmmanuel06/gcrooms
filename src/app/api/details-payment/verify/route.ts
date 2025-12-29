import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    const reference = searchParams.get('reference');

    if (!paymentId && !reference) {
      return NextResponse.json({ error: 'missing_payment_id_or_reference' }, { status: 400 });
    }

    let query = supabase
      .from('details_payment')
      .select('id, amount, payment_status, paystack_ref, created_at, paid_at, currency');

    if (paymentId) {
      query = query.eq('id', paymentId);
    } else if (reference) {
      query = query.eq('paystack_ref', reference);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    // Normalize status: use payment_status
    const normalizedStatus = (data.payment_status || '').toLowerCase();

    return NextResponse.json({
      payment_id: data.id,
      reference: data.paystack_ref || reference,
      status: normalizedStatus,
      amount: data.amount ?? null,
      currency: data.currency ?? 'NGN',
      paid_at: data.paid_at ?? null,
    });
  } catch (e) {
    console.error('Verify error:', e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

