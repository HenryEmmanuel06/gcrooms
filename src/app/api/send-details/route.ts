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
      "profile_id",
      "your_name",
      "greeting_message",
      "about_apartment",
      "phone",
      "whatsapp",
      "location",
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

    // Validate profile_id is a number
    const profileId = Number(body.profile_id);
    if (!Number.isFinite(profileId) || profileId <= 0) {
      return NextResponse.json(
        { error: "Invalid profile ID" },
        { status: 400 }
      );
    }

    // Verify profile exists and get details for email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email_address")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const payload = {
      profile_id: profileId,
      your_name: cleanText(body.your_name, 150),
      greeting_message: cleanText(body.greeting_message, 2000),
      about_apartment: cleanText(body.about_apartment, 2000),
      phone: typeof body.phone === "string" ? body.phone.replace(/[^\d+]/g, "").slice(0, 20) : "",
      whatsapp: typeof body.whatsapp === "string" ? body.whatsapp.replace(/[^\d+]/g, "").slice(0, 20) : "",
      location: cleanText(body.location, 200),
      additional_info: body.additional_info ? cleanText(body.additional_info, 2000) : null,
    };

    const { data, error } = await supabase
      .from("send_details")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("Send details insert error", error);
      
      // Check for RLS policy errors
      if (error.message?.includes("row-level security") || error.message?.includes("RLS")) {
        return NextResponse.json(
          { 
            error: "Permission denied. Please check that RLS policies are properly configured for send_details table.",
            details: error.message 
          },
          { status: 403 }
        );
      }
      
      // Check for other common errors
      if (error.code === "42501" || error.code === "PGRST301") {
        return NextResponse.json(
          { 
            error: "Database permission error. Please ensure RLS policies allow send_details creation.",
            details: error.message 
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to save details",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 500 }
      );
    }


    // Send email to profile owner with limited information and payment button
    if (profile.email_address) {
      try {
        const paymentUrl = `https://gcrooms.vercel.app/api/details-payment/initialize?send_details_id=${data.id}&profile_id=${profileId}`;

        const emailHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Someone is Interested in Your Profile - GCrooms</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #10D1C1; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">GCrooms</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
              <h2 style="color: #333; margin-top: 0;">Hello ${profile.full_name},</h2>
              <p style="font-size: 18px; font-weight: 600; color: #10D1C1; margin: 20px 0;">🎉 Someone is interested in your profile!</p>
              <p>Someone has shared their details with you and is interested in connecting.</p>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
                <h3 style="color: #10D1C1; margin-top: 0; border-bottom: 2px solid #10D1C1; padding-bottom: 10px;">Shared Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
                    <td style="padding: 8px 0;">${payload.your_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Greeting:</td>
                    <td style="padding: 8px 0;">${payload.greeting_message}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Apartment Description:</td>
                    <td style="padding: 8px 0;">${payload.about_apartment}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0;"><strong>Want to see their contact details?</strong></p>
                <p style="margin: 10px 0 0 0;">Pay ₦1,000 to unlock their phone number and WhatsApp contact information.</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${paymentUrl}" style="display: inline-block; background-color: #10D1C1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0px 0px 10px 0px #660ED180;">
                  Pay ₦1,000 to View Contact Details
                </a>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                After successful payment, you'll receive their contact information and a payment receipt via email.
              </p>

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
          to: profile.email_address,
          subject: "Someone is Interested in Your Profile - GCrooms",
          html: emailHTML,
        });

        console.log(`✅ Interest notification email sent to profile owner: ${profile.email_address}`);
      } catch (emailError) {
        console.error("Error sending interest notification email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Send details error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

