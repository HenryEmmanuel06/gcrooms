import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMail } from '@/lib/mailer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RoomDetails {
  property_title: string;
  email_address: string;
  phone_number: string;
  street: string;
  house_no: number;
  location: string;
  state: string;
  religion: string;
  age_range: string;
  full_name: string;
}

interface PaymentDetails {
  amount: number;
  reference: string;
  status: string;
  paid_at: string;
  gateway_response: string;
  currency: string;
}

interface UserDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
}

function generateRoomDetailsEmailHTML(roomDetails: RoomDetails, userEmail: string): string {
  const adminEmail = process.env.ADMIN_EMAIL || 'support@gcrooms.com';
  const subject = encodeURIComponent(`Cancellation Request - ${roomDetails.property_title}`);
  const body = encodeURIComponent(
    `Hello GCrooms Admin,\n\nI would like to cancel my request regarding the room: ${roomDetails.property_title}.\n\nMy email: ${userEmail}\n\nReason for cancellation:\n- `
  );
  const mailtoHref = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Room Details - GCrooms</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FFBE06 0%, #10D1C1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 30px; }
        .room-card { background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 20px 0; border-left: 4px solid #FFBE06; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #555; flex: 1; }
        .detail-value { color: #333; flex: 2; text-align: right; }
        .contact-section { background-color: #e8f5e8; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .contact-title { color: #10D1C1; font-size: 18px; font-weight: 600; margin-bottom: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Room Details</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your payment was successful!</p>
        </div>
        
        <div class="content">
          <p>Hi there! 👋</p>
          <p>Thank you for your payment. Here are the complete details for the room you're interested in:</p>
          
          <div class="room-card">
            <h2 style="color: #FFBE06; margin-top: 0;">${roomDetails.property_title}</h2>
            
            <div class="detail-row">
              <span class="detail-label">📍 Location:</span>
              <span class="detail-value">${roomDetails.location}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">🏛️ State:</span>
              <span class="detail-value">${roomDetails.state}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">🏠 Street:</span>
              <span class="detail-value">${roomDetails.street}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">🔢 House Number:</span>
              <span class="detail-value">${roomDetails.house_no}</span>
            </div>
          </div>
          
          <div class="contact-section">
            <div class="contact-title">👤 Room Owner Contact Details</div>
            
            <div class="detail-row">
              <span class="detail-label">👨‍💼 Full Name:</span>
              <span class="detail-value">${roomDetails.full_name}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📧 Email:</span>
              <span class="detail-value">${roomDetails.email_address}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📱 Phone:</span>
              <span class="detail-value">${roomDetails.phone_number}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">🙏 Religion:</span>
              <span class="detail-value">${roomDetails.religion}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">🎂 Age Range:</span>
              <span class="detail-value">${roomDetails.age_range}</span>
            </div>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Contact the room owner directly using the details above</li>
            <li>Schedule a viewing if you haven't already</li>
            <li>Discuss move-in arrangements and any questions you may have</li>
          </ul>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${mailtoHref}" target="_blank" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: 600;">
              Cancel & Contact Support
            </a>
            <p style="margin-top: 8px; color: #888; font-size: 12px;">This opens your email app with a pre-filled message. Please state your reason for cancellation.</p>
          </div>
          
          <p>We hope you find your perfect roommate match! 🤝</p>
        </div>
        
        <div class="footer">
          <p>Thank you for using GCrooms!</p>
          <p>If you have any questions, feel free to contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateRoomOwnerNotificationHTML(roomDetails: RoomDetails, userDetails: UserDetails, paymentDetails: PaymentDetails): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Received - GCrooms</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10D1C1 0%, #FFBE06 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 30px; }
        .notification-card { background-color: #e8f5e8; border-radius: 8px; padding: 25px; margin: 20px 0; border-left: 4px solid #10D1C1; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #555; flex: 1; }
        .detail-value { color: #333; flex: 2; text-align: right; }
        .payment-section { background-color: #f0f8ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .payment-title { color: #10D1C1; font-size: 18px; font-weight: 600; margin-bottom: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Payment Received!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Someone is interested in your room</p>
        </div>
        
        <div class="content">
          <p>Hi ${roomDetails.full_name}! 👋</p>
          <p>Great news! Someone has made a payment to connect with you regarding your room listing.</p>
          
          <div class="notification-card">
            <h2 style="color: #10D1C1; margin-top: 0;">Room: ${roomDetails.property_title}</h2>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${roomDetails.location}, ${roomDetails.state}</p>
          </div>
          
          <div class="payment-section">
            <div class="payment-title">👤 Person Who Paid</div>
            
            <div class="detail-row">
              <span class="detail-label">👨‍💼 Full Name:</span>
              <span class="detail-value">${userDetails.fullName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📧 Email:</span>
              <span class="detail-value">${userDetails.email}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📱 Phone:</span>
              <span class="detail-value">${userDetails.phoneNumber}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">💰 Amount Paid:</span>
              <span class="detail-value">${paymentDetails.currency} ${paymentDetails.amount.toLocaleString()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📅 Payment Date:</span>
              <span class="detail-value">${new Date(paymentDetails.paid_at).toLocaleString()}</span>
            </div>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>The person above is interested in your room and has paid to get your contact details</li>
            <li>They may contact you directly using your listed information</li>
            <li>Feel free to reach out to them using the contact details above</li>
            <li>Schedule a viewing or discuss the room details</li>
          </ul>
          
          <p>Thank you for listing with GCrooms! 🏠</p>
        </div>
        
        <div class="footer">
          <p>GCrooms - Connecting Roommates</p>
          <p>If you have any questions, contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminReceiptHTML(roomDetails: RoomDetails, userDetails: UserDetails, paymentDetails: PaymentDetails): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt - Admin Copy</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 700px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #333 0%, #666 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 30px; }
        .receipt-card { background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 20px 0; border: 2px solid #ddd; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #555; flex: 1; }
        .detail-value { color: #333; flex: 2; text-align: right; }
        .section { background-color: #fff; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #ddd; }
        .section-title { color: #333; font-size: 18px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #FFBE06; padding-bottom: 5px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
        .status-success { color: #28a745; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Payment Receipt - Admin Copy</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Transaction Details & Summary</p>
        </div>
        
        <div class="content">
          <div class="receipt-card">
            <h2 style="color: #333; margin-top: 0; text-align: center;">PAYMENT RECEIPT</h2>
            <p style="text-align: center; color: #666;">Reference: ${paymentDetails.reference}</p>
            <p style="text-align: center; color: #666;">Date: ${new Date(paymentDetails.paid_at).toLocaleString()}</p>
          </div>
          
          <div class="section">
            <div class="section-title">💰 Payment Information</div>
            
            <div class="detail-row">
              <span class="detail-label">Transaction Reference:</span>
              <span class="detail-value">${paymentDetails.reference}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span class="detail-value">${paymentDetails.currency} ${paymentDetails.amount.toLocaleString()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value status-success">${paymentDetails.status.toUpperCase()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Gateway Response:</span>
              <span class="detail-value">${paymentDetails.gateway_response}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Time:</span>
              <span class="detail-value">${new Date(paymentDetails.paid_at).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">👤 Customer Details</div>
            
            <div class="detail-row">
              <span class="detail-label">Full Name:</span>
              <span class="detail-value">${userDetails.fullName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${userDetails.email}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Phone Number:</span>
              <span class="detail-value">${userDetails.phoneNumber}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">🏠 Room Details</div>
            
            <div class="detail-row">
              <span class="detail-label">Property Title:</span>
              <span class="detail-value">${roomDetails.property_title}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${roomDetails.location}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">State:</span>
              <span class="detail-value">${roomDetails.state}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Room Owner:</span>
              <span class="detail-value">${roomDetails.full_name}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Owner Email:</span>
              <span class="detail-value">${roomDetails.email_address}</span>
            </div>
          </div>
          
          <p style="margin-top: 30px; padding: 15px; background-color: #e8f5e8; border-radius: 5px;">
            <strong>Admin Note:</strong> This is an automated receipt generated when a user successfully pays to connect with a room owner. Both the user and room owner have been notified via email.
          </p>
        </div>
        
        <div class="footer">
          <p>GCrooms Admin Panel - Payment Processing System</p>
          <p>Generated automatically on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { roomId, userEmail, paymentDetails, userDetails } = await request.json();

    if (!roomId || !userEmail) {
      return NextResponse.json(
        { error: 'Room ID and user email are required' },
        { status: 400 }
      );
    }

    console.log('📧 Fetching room details for email:', { roomId, userEmail });

    // Fetch room details from the database
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select(`
        property_title,
        email_address,
        phone_number,
        street,
        house_no,
        location,
        state,
        religion,
        age_range,
        full_name
      `)
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      console.error('❌ Failed to fetch room details:', roomError);
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    console.log('✅ Room details fetched successfully');

    // Generate email HTML for user
    const userEmailHTML = generateRoomDetailsEmailHTML(room as RoomDetails, userEmail);

    // Send email to user
    await sendMail({
      to: userEmail,
      subject: `Room Details: ${room.property_title} - GCrooms`,
      html: userEmailHTML,
    });

    console.log('✅ Room details email sent successfully to:', userEmail);

    // Send additional emails if payment details are provided
    if (paymentDetails && userDetails) {
      console.log('📧 Sending notification emails...');

      // Send notification to room owner
      const ownerEmailHTML = generateRoomOwnerNotificationHTML(
        room as RoomDetails, 
        userDetails, 
        paymentDetails
      );

      await sendMail({
        to: room.email_address,
        subject: `Payment Received for Your Room: ${room.property_title} - GCrooms`,
        html: ownerEmailHTML,
      });

      console.log('✅ Room owner notification sent to:', room.email_address);

      // Send receipt to admin
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const adminReceiptHTML = generateAdminReceiptHTML(
          room as RoomDetails, 
          userDetails, 
          paymentDetails
        );

        await sendMail({
          to: adminEmail,
          subject: `Payment Receipt - ${room.property_title} - ${userDetails.fullName}`,
          html: adminReceiptHTML,
        });

        console.log('✅ Admin receipt sent to:', adminEmail);
      } else {
        console.warn('⚠️ ADMIN_EMAIL not configured, skipping admin receipt');
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All notification emails sent successfully' 
    });

  } catch (error) {
    console.error('❌ Error sending room details email:', error);
    return NextResponse.json(
      { error: 'Failed to send room details email' },
      { status: 500 }
    );
  }
}
