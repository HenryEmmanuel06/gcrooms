import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { attempt_id, amount } = await request.json();

    // Validate required fields
    if (!attempt_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: attempt_id, amount' },
        { status: 400 }
      );
    }

    // Generate fake paystack reference for now
    const paystack_ref = `ps_${uuidv4().replace(/-/g, '').substring(0, 16)}`;

    // Update connection attempt with payment details
    const { data, error } = await supabase
      .from('connection_attempts')
      .update({
        amount,
        paystack_ref,
        status: 'processing'
      })
      .eq('id', attempt_id)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update connection attempt' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Connection attempt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      paystack_ref,
      attempt_id: data.id,
      amount: data.amount,
      status: data.status,
      message: 'Payment initiated successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
