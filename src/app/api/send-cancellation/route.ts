import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, userEmail, roomTitle, ownerCancel, payerName, payerEmail, reason } = body;

    // Validate required fields
    if (!roomId || !userEmail || !roomTitle || !reason) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate reason is not empty
    if (!reason.trim()) {
      return NextResponse.json(
        { message: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'gcroomscompany@gmail.com';
    const isOwnerCancel = ownerCancel === 'true';

    // Create email subject (non-editable)
    const subject = isOwnerCancel 
      ? `Room Owner Cancellation Request - ${roomTitle}`
      : `Cancellation Request - ${roomTitle}`;

    // Create email body (template is non-editable, only reason is user input)
    let emailBody;
    if (isOwnerCancel) {
      emailBody = `Hello GCrooms Admin,

I want to cancel the request the user that paid made for my room.

Room: ${roomTitle}

User that paid:
Full Name: ${payerName || 'Not provided'}
Email Address: ${payerEmail || 'Not provided'}

My email (room owner): ${userEmail}

Reason for my cancellation:
${reason.trim()}

---
This email was sent through the GCrooms cancellation system to prevent fraudulent requests.
Room ID: ${roomId}
Timestamp: ${new Date().toISOString()}`;
    } else {
      emailBody = `Hello GCrooms Admin,

I would like to cancel my request regarding the room: ${roomTitle}.

My payment email: ${userEmail}

Reason for cancellation:
${reason.trim()}

---
This email was sent through the GCrooms cancellation system to prevent fraudulent requests.
Room ID: ${roomId}
Timestamp: ${new Date().toISOString()}`;
    }

    // Configure nodemailer transporter
    // You'll need to set up email credentials in your environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: subject,
      text: emailBody,
      replyTo: userEmail, // Allow admin to reply directly to the user
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`✅ Cancellation email sent for room ${roomId} by ${userEmail}`);

    return NextResponse.json(
      { message: 'Cancellation request sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending cancellation email:', error);
    
    // Don't expose internal error details to the client
    return NextResponse.json(
      { message: 'Failed to send cancellation request. Please try again later.' },
      { status: 500 }
    );
  }
}
