import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { room_id, full_name, email, phone_number } = await request.json();

    // Validate required fields
    if (!room_id || !full_name || !email || !phone_number) {
      return NextResponse.json(
        { error: 'Missing required fields: room_id, full_name, email, phone_number' },
        { status: 400 }
      );
    }

    // Insert new connection attempt
    const { data, error } = await supabase
      .from('connection_attempts')
      .insert({
        room_id,
        full_name,
        email,
        phone_number,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create connection attempt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attempt_id: data.id,
      message: 'Connection attempt created successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
