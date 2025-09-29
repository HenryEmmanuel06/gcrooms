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

    console.log('🔍 Checking cancellation for:', { roomId, userEmail });

    if (!roomId || !userEmail) {
      console.log('❌ Missing roomId or userEmail');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('property_title')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check for recent payments - you might need to create a payments table
    // For now, I'll create a simple check using a hypothetical payments table
    // If you don't have one, you can track payment timestamps in localStorage or session
    
    // Try to find a payment record within the last 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    // Check the connection_attempts table for recent successful payments
    let paymentValid = false;
    
    // First, try to check connection_attempts table for successful payments
    try {
      const { data: attempts, error: attemptError } = await supabase
        .from('connection_attempts')
        .select('paid_at, status, created_at')
        .eq('room_id', roomId)
        .eq('email', userEmail)
        .eq('status', 'success')
        .not('paid_at', 'is', null)
        .gte('paid_at', fortyEightHoursAgo)
        .order('paid_at', { ascending: false })
        .limit(1);

      if (!attemptError && attempts && attempts.length > 0) {
        paymentValid = true;
        console.log('✅ Found valid payment in connection_attempts:', attempts[0]);
      } else {
        console.log('❌ No valid payment found in connection_attempts:', { attemptError, attempts });
      }
    } catch (connectionError) {
      console.log('❌ Error checking connection_attempts:', connectionError);
      
      // Fallback to timestamp method
      const timestamp = searchParams.get('timestamp');
      if (timestamp) {
        const paymentTime = new Date(parseInt(timestamp));
        const now = new Date();
        const hoursDiff = (now.getTime() - paymentTime.getTime()) / (1000 * 60 * 60);
        paymentValid = hoursDiff <= 48;
        console.log('🔄 Using timestamp fallback:', { hoursDiff, paymentValid });
      }
    }

    if (!paymentValid) {
      // Cancellation period has expired or no valid payment found
      console.log('❌ Payment not valid, redirecting to cancellation-expired');
      return NextResponse.redirect(new URL(`/cancellation-expired?roomId=${roomId}&userEmail=${encodeURIComponent(userEmail)}`, request.url));
    }

    console.log('✅ Payment is valid, redirecting to mailto');

    // Still within 48 hours, redirect to mailto
    const adminEmail = process.env.ADMIN_EMAIL || 'gcroomscompany@gmail.com';
    const subject = encodeURIComponent(`Cancellation Request - ${room.property_title}`);
    const body = encodeURIComponent(
      `<p>Hello GCrooms Admin,</p>` +
      `<p>I would like to cancel my request regarding the room: <strong>${room.property_title}</strong>.</p>` +
      `<p>My payment email: <strong>${userEmail}</strong></p>` +
      `<p>Reason for cancellation:</p>` +
      `<p>- </p>`
    );
    const mailtoHref = `mailto:${adminEmail}?subject=${subject}&body=${body}`;

    // Redirect to a page that will handle the mailto link
    return NextResponse.redirect(new URL(`/cancel-redirect?mailto=${encodeURIComponent(mailtoHref)}`, request.url));

  } catch (error) {
    console.error('Error checking cancellation validity:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
