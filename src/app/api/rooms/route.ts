import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMail } from '@/lib/mailer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CreateRoomRequest {
  property_title: string;
  location: string;
  state: string;
  price: number;
  bathrooms: number;
  bedrooms: number;
  room_size: number;
  furniture?: string;
  furnishing?: string[];
  duration?: string;
  house_no?: number;
  street?: string;
  wifi_zone: boolean;
  description: string;
  room_features: string;
  building_type: string;
  latitude: number;
  longitude: number;
  room_img_1?: string;
  room_img_2?: string;
  room_img_3?: string;
  room_img_4?: string;
  room_img_5?: string;
  profile_image?: string;
  full_name?: string;
  gender?: string;
  phone_number?: string;
  email_address?: string;
  religion?: string;
  status?: string;
  age_range?: string;
  pet?: string;
  about_self?: string;
  dislikes?: string;
  likes?: string;
  potrait_img_1?: string;
  potrait_img_2?: string;
}

interface Room {
  id: number;
  property_title: string;
  location: string;
  state: string;
  price: number;
  bathrooms: number;
  bedrooms: number;
  room_size: number;
  furniture?: string;
  furnishing?: string[];
  duration?: string;
  house_no?: number;
  street?: string;
  wifi_zone: boolean;
  description: string;
  room_features: string;
  building_type: string;
  latitude: number;
  longitude: number;
  created_at: string;
  room_img_1?: string;
  room_img_2?: string;
  room_img_3?: string;
  room_img_4?: string;
  room_img_5?: string;
  profile_image?: string;
  full_name?: string;
  gender?: string;
  phone_number?: string;
  email_address?: string;
  religion?: string;
  status?: string;
  age_range?: string;
  pet?: string;
  about_self?: string;
  dislikes?: string;
  likes?: string;
  potrait_img_1?: string;
  potrait_img_2?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Admin email not configured' },
        { status: 500 }
      );
    }

    const body: CreateRoomRequest = await request.json();

    // Validate required fields
    const requiredFields = ['property_title', 'location', 'state', 'price', 'bathrooms', 'bedrooms', 'room_size', 'description', 'room_features', 'building_type', 'latitude', 'longitude'];
    const missingFields = requiredFields.filter(field => !body[field as keyof CreateRoomRequest]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (body.email_address) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email_address)) {
        return NextResponse.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        );
      }
    }

    // Validate price is positive number
    if (typeof body.price !== 'number' || body.price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const roomData = {
      property_title: body.property_title.trim(),
      location: body.location.trim(),
      state: body.state.trim(),
      price: body.price,
      bathrooms: body.bathrooms,
      bedrooms: body.bedrooms,
      room_size: body.room_size,
      furniture: body.furniture?.trim() || null,
      furnishing: body.furnishing || null,
      duration: body.duration?.trim() || null,
      house_no: body.house_no || null,
      street: body.street?.trim() || null,
      wifi_zone: body.wifi_zone || false,
      description: body.description.trim(),
      room_features: body.room_features.trim(),
      building_type: body.building_type.trim(),
      latitude: body.latitude,
      longitude: body.longitude,
      room_img_1: body.room_img_1 || null,
      room_img_2: body.room_img_2 || null,
      room_img_3: body.room_img_3 || null,
      room_img_4: body.room_img_4 || null,
      room_img_5: body.room_img_5 || null,
      profile_image: body.profile_image || null,
      full_name: body.full_name?.trim() || null,
      gender: body.gender?.trim() || null,
      phone_number: body.phone_number?.trim() || null,
      email_address: body.email_address?.trim().toLowerCase() || null,
      religion: body.religion?.trim() || null,
      status: body.status?.trim() || null,
      age_range: body.age_range?.trim() || null,
      pet: body.pet?.trim() || null,
      about_self: body.about_self?.trim() || null,
      dislikes: body.dislikes?.trim() || null,
      likes: body.likes?.trim() || null,
      potrait_img_1: body.potrait_img_1 || null,
      potrait_img_2: body.potrait_img_2 || null,
    };

    // Insert room into database
    const { data: room, error: dbError } = await supabase
      .from('rooms')
      .insert(roomData)
      .select('*')
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to create room listing' },
        { status: 500 }
      );
    }

    const createdRoom = room as Room;

    // Prepare email content
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Room Listing Submitted</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #660ED1;">Room Details</h3>
          <p><strong>Title:</strong> ${createdRoom.property_title}</p>
          <p><strong>Description:</strong> ${createdRoom.description}</p>
          <p><strong>Price:</strong> ₦${createdRoom.price.toLocaleString()}</p>
          <p><strong>Location:</strong> ${createdRoom.location}, ${createdRoom.state}</p>
          <p><strong>Bedrooms:</strong> ${createdRoom.bedrooms}</p>
          <p><strong>Bathrooms:</strong> ${createdRoom.bathrooms}</p>
          <p><strong>Room Size:</strong> ${createdRoom.room_size} sqm</p>
          <p><strong>Building Type:</strong> ${createdRoom.building_type}</p>
          <p><strong>Contact Email:</strong> ${createdRoom.email_address || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${createdRoom.phone_number || 'Not provided'}</p>
          <p><strong>Room ID:</strong> ${createdRoom.id}</p>
          <p><strong>Submitted:</strong> ${new Date(createdRoom.created_at).toLocaleString()}</p>
        </div>
        <p>Please review this listing and take appropriate action.</p>
      </div>
    `;

    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #660ED1;">Thanks for listing "${createdRoom.property_title}"</h2>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #660ED1;">
          <p>Hi ${createdRoom.full_name || 'there'}!</p>
          <p>Thank you for submitting your room listing <strong>"${createdRoom.property_title}"</strong> to GCrooms.</p>
          <p>Your room is currently under review by our team and would be published immediately once approved. You will be notified with a status update within the next 24hrs.</p>
          <div style="margin: 20px 0;">
            <h4 style="color: #333;">Your Listing Details:</h4>
            <p><strong>Title:</strong> ${createdRoom.property_title}</p>
            <p><strong>Location:</strong> ${createdRoom.location}, ${createdRoom.state}</p>
            <p><strong>Price:</strong> ₦${createdRoom.price.toLocaleString()}</p>
            <p><strong>Reference ID:</strong> #${createdRoom.id}</p>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The GCrooms Team</p>
        </div>
      </div>
    `;

    // Send emails using Promise.allSettled
    const emailPromises = [
      sendMail({
        to: process.env.ADMIN_EMAIL!,
        subject: `New Room Listing: ${createdRoom.property_title}`,
        html: adminEmailHtml,
      }),
    ];

    // Only send user email if email address is provided
    if (createdRoom.email_address) {
      emailPromises.push(
        sendMail({
          to: createdRoom.email_address,
          subject: `Thanks for listing "${createdRoom.property_title}" - Under Review`,
          html: userEmailHtml,
        })
      );
    }

    const emailResults = await Promise.allSettled(emailPromises);

    // Return success response with room data
    return NextResponse.json({
      success: true,
      room: createdRoom,
      message: 'Room listing created successfully',
      emailStatus: {
        adminEmail: emailResults[0].status === 'fulfilled' ? 'sent' : 'failed',
        userEmail: emailResults[1].status === 'fulfilled' ? 'sent' : 'failed',
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
