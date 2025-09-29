import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const userEmail = searchParams.get('userEmail');

    if (!roomId || !userEmail) {
      return NextResponse.redirect(new URL('/cancellation-expired', request.url));
    }

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('property_title')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.redirect(new URL('/cancellation-expired', request.url));
    }

    // Check for recent payments - you might need to create a payments table
    // For now, I'll create a simple check using a hypothetical payments table
    // If you don't have one, you can track payment timestamps in localStorage or session
    
    // Try to find a payment record within the last 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    // First, try to check if there's a payments table
    let paymentValid = false;
    try {
      const { data: payments, error: paymentError } = await supabase
        .from('payments')
        .select('created_at, status')
        .eq('room_id', roomId)
        .eq('email', userEmail)
        .eq('status', 'success')
        .gte('created_at', fortyEightHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!paymentError && payments && payments.length > 0) {
        paymentValid = true;
      }
    } catch (paymentTableError) {
      // If payments table doesn't exist, we'll use a timestamp passed in the URL
      // This is a fallback method - you should implement proper payment tracking
      const timestamp = searchParams.get('timestamp');
      if (timestamp) {
        const paymentTime = new Date(parseInt(timestamp));
        const now = new Date();
        const hoursDiff = (now.getTime() - paymentTime.getTime()) / (1000 * 60 * 60);
        paymentValid = hoursDiff <= 48;
      }
    }

    if (!paymentValid) {
      // Cancellation period has expired or no valid payment found
      return NextResponse.redirect(new URL('/cancellation-expired', request.url));
    }

    // Still within 48 hours, redirect to mailto
    const adminEmail = process.env.ADMIN_EMAIL || 'support@gcrooms.com';
    const subject = encodeURIComponent(`Cancellation Request - ${room.property_title}`);
    const body = encodeURIComponent(
      `Hello GCrooms Admin,\n\nI would like to cancel my request regarding the room: ${room.property_title}.\n\nMy payment email: ${userEmail}\n\nReason for cancellation:\n- `
    );
    const mailtoHref = `mailto:${adminEmail}?subject=${subject}&body=${body}`;

    // Redirect to a page that will handle the mailto link
    return NextResponse.redirect(new URL(`/cancel-redirect?mailto=${encodeURIComponent(mailtoHref)}`, request.url));

  } catch (error) {
    console.error('Error checking cancellation validity:', error);
    return NextResponse.redirect(new URL('/cancellation-expired', request.url));
  }
}
