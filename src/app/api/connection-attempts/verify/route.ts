import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'missing_reference' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('connection_attempts')
      .select('id, amount, status, payment_status, paystack_ref, created_at, paid_at, currency')
      .eq('id', reference)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    // Normalize status: prefer "status" column; fallback to payment_status
    const normalizedStatus = (data.status || data.payment_status || '').toLowerCase();

    return NextResponse.json({
      reference: data.id,
      status: normalizedStatus,
      amount: data.amount ?? null,
      currency: data.currency ?? 'NGN',
      paid_at: data.paid_at ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
