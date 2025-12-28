import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendMail } from "@/lib/mailer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const cleanText = (value: unknown, max = 200) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
};

const cleanNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const required = [
      "full_name",
      "age",
      "occupation",
      "location",
      "state",
      "about",
      "profile_photo",
      "monthly_budget",
      "duration",
      "cleanliness_level",
      "overnight_guests",
      "noise_level",
    ];

    const missing = required.filter(
      (field) => !body[field] && body[field] !== false
    );
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const age = cleanNumber(body.age);
    const monthlyBudget = cleanNumber(body.monthly_budget);

    if (age === null || age < 16 || age > 120) {
      return NextResponse.json(
        { error: "Age must be between 16 and 120" },
        { status: 400 }
      );
    }

    if (monthlyBudget === null || monthlyBudget < 0) {
      return NextResponse.json(
        { error: "Monthly budget must be a positive number" },
        { status: 400 }
      );
    }

    const payload = {
      full_name: cleanText(body.full_name, 150),
      age,
      occupation: cleanText(body.occupation, 150),
      location: cleanText(body.location, 200),
      state: cleanText(body.state, 120),
      about: cleanText(body.about, 2000),
      profile_photo: cleanText(body.profile_photo, 500),
      monthly_budget: monthlyBudget,
      duration: cleanText(body.duration, 120),
      cleanliness_level: cleanText(body.cleanliness_level, 120),
      pet_friendly: Boolean(body.pet_friendly),
      smoking: Boolean(body.smoking),
      overnight_guests: cleanText(body.overnight_guests, 120),
      phone_number: typeof body.phone_number === "string" ? (body.phone_number.replace(/[^\d+]/g, "").slice(0, 20) || null) : null,
      email_address: cleanText(body.email_address, 220) || null,
      noise_level: cleanText(body.noise_level, 120),
      is_verified: "unverified",
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("Profile insert error", error);
      
      // Check for RLS policy errors
      if (error.message?.includes("row-level security") || error.message?.includes("RLS")) {
        return NextResponse.json(
          { 
            error: "Permission denied. Please check that RLS policies are properly configured for profile creation.",
            details: error.message 
          },
          { status: 403 }
        );
      }
      
      // Check for other common errors
      if (error.code === "42501" || error.code === "PGRST301") {
        return NextResponse.json(
          { 
            error: "Database permission error. Please ensure RLS policies allow profile creation.",
            details: error.message 
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to create profile",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 500 }
      );
    }

    // Send emails after successful profile creation
    try {
      const profileOwnerEmail = payload.email_address;
      const adminEmail = process.env.ADMIN_EMAIL;

      // Email to profile owner - Profile under review
      if (profileOwnerEmail) {
        const ownerEmailHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Profile Under Review - GCrooms</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #10D1C1; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">GCrooms</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
              <h2 style="color: #333; margin-top: 0;">Hello ${payload.full_name},</h2>
              <p>Thank you for creating your profile on GCrooms!</p>
              <p>Your profile has been successfully submitted and is currently <strong>under review</strong> by our team.</p>
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0;"><strong>What happens next?</strong></p>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                  <li>Our team will review your profile details</li>
                  <li>You'll receive an email notification once your profile is verified</li>
                  <li>Once verified, your profile will be visible to potential roommates</li>
                </ul>
              </div>
              <p>We appreciate your patience during the review process. This typically takes 24-48 hours.</p>
              <p>If you have any questions or need to update your profile, please don't hesitate to contact us.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Best regards,<br>
                The GCrooms Team
              </p>
            </div>
          </body>
          </html>
        `;

        await sendMail({
          to: profileOwnerEmail,
          subject: "Your Profile is Under Review - GCrooms",
          html: ownerEmailHTML,
        });

        console.log(`✅ Profile review email sent to: ${profileOwnerEmail}`);
      }

      // Email to admin - New profile created notification
      if (adminEmail) {
        const adminEmailHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Profile Created - GCrooms</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #10D1C1; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">GCrooms - New Profile Created</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
              <h2 style="color: #333; margin-top: 0;">A new profile has been created and requires review.</h2>
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
                <h3 style="color: #10D1C1; margin-top: 0; border-bottom: 2px solid #10D1C1; padding-bottom: 10px;">Profile Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 180px;">Full Name:</td>
                    <td style="padding: 8px 0;">${payload.full_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Age:</td>
                    <td style="padding: 8px 0;">${payload.age}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Occupation:</td>
                    <td style="padding: 8px 0;">${payload.occupation}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                    <td style="padding: 8px 0;">${payload.location}, ${payload.state}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                    <td style="padding: 8px 0;">${payload.email_address || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                    <td style="padding: 8px 0;">${payload.phone_number || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Monthly Budget:</td>
                    <td style="padding: 8px 0;">₦${payload.monthly_budget.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
                    <td style="padding: 8px 0;">${payload.duration}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Cleanliness Level:</td>
                    <td style="padding: 8px 0;">${payload.cleanliness_level}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Noise Level:</td>
                    <td style="padding: 8px 0;">${payload.noise_level}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Overnight Guests:</td>
                    <td style="padding: 8px 0;">${payload.overnight_guests}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Pet Friendly:</td>
                    <td style="padding: 8px 0;">${payload.pet_friendly ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Smoking:</td>
                    <td style="padding: 8px 0;">${payload.smoking ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">About:</td>
                    <td style="padding: 8px 0;">${payload.about}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                    <td style="padding: 8px 0;"><strong style="color: #ff9800;">${payload.is_verified}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Profile ID:</td>
                    <td style="padding: 8px 0;">${data.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Created At:</td>
                    <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0;"><strong>Action Required:</strong> Please review this profile and update its verification status in the admin panel.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendMail({
          to: adminEmail,
          subject: `New Profile Created: ${payload.full_name} - GCrooms`,
          html: adminEmailHTML,
        });

        console.log(`✅ Admin notification email sent to: ${adminEmail}`);
      }
    } catch (emailError) {
      // Log email errors but don't fail the profile creation
      console.error("Error sending profile creation emails:", emailError);
      // Continue to return success response even if emails fail
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err) {
    console.error("Profile creation error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

