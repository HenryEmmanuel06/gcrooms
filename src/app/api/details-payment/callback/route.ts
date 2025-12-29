import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMail } from '@/lib/mailer';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

function getBaseUrl(request: NextRequest): string {
  // Always use production URL for redirects
  return 'https://gcrooms.vercel.app';
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      const baseUrl = getBaseUrl(request);
      return NextResponse.redirect(
        new URL('/details-payment/failed?error=server_config', baseUrl)
      );
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      const baseUrl = getBaseUrl(request);
      return NextResponse.redirect(
        new URL('/details-payment/failed?error=missing_reference', baseUrl)
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error('Paystack secret key not configured');
      const baseUrl = getBaseUrl(request);
      return NextResponse.redirect(
        new URL('/details-payment/failed?error=configuration_error', baseUrl)
      );
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!verifyResponse.ok) {
      console.error('Paystack verification failed:', verifyResponse.status);
      const baseUrl = getBaseUrl(request);
      return NextResponse.redirect(
        new URL('/details-payment/failed?error=verification_failed', baseUrl)
      );
    }

    const verificationData = await verifyResponse.json();

    if (!verificationData.status) {
      console.error('Paystack verification unsuccessful:', verificationData.message);
      const baseUrl = getBaseUrl(request);
      return NextResponse.redirect(
        new URL('/details-payment/failed?error=verification_unsuccessful', baseUrl)
      );
    }

    const transaction = verificationData.data;
    const sendDetailsId = transaction.metadata?.send_details_id;
    const profileId = transaction.metadata?.profile_id;

    if (!sendDetailsId || !profileId) {
      console.error('Missing metadata in transaction');
      const baseUrl = getBaseUrl(request);
      return NextResponse.redirect(
        new URL('/details-payment/failed?error=missing_metadata', baseUrl)
      );
    }

    // First check if record exists - try by paystack_ref first
    let existingPayment;

    const { data: paymentByRef, error: refError } = await supabase
      .from('details_payment')
      .select('*')
      .eq('paystack_ref', reference)
      .single();

    if (paymentByRef && !refError) {
      existingPayment = paymentByRef;
    } else {
      // If not found by reference, try to find by profile_id and send_details_id
      console.log('Payment not found by reference, trying to find by profile_id and send_details_id');
      const { data: paymentByIds, error: idsError } = await supabase
        .from('details_payment')
        .select('*')
        .eq('profile_id', profileId)
        .eq('send_details_id', sendDetailsId)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (paymentByIds && !idsError) {
        existingPayment = paymentByIds;
        // Update the paystack_ref to match the actual reference first
        await supabase
          .from('details_payment')
          .update({ paystack_ref: reference })
          .eq('id', paymentByIds.id);
      } else {
        console.error('❌ Payment record not found:', { reference, profileId, sendDetailsId, refError, idsError });
        const baseUrl = getBaseUrl(request);
        return NextResponse.redirect(
          new URL('/details-payment/failed?error=record_not_found', baseUrl)
        );
      }
    }

    if (!existingPayment) {
      console.error('❌ No payment record found after all attempts');
      const baseUrl = getBaseUrl(request);
      return NextResponse.redirect(
        new URL('/details-payment/failed?error=record_not_found', baseUrl)
      );
    }

    console.log('✅ Found existing payment record:', existingPayment);
    console.log('🔍 Transaction details:', {
      id: transaction.id,
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      customer: transaction.customer,
      gateway_response: transaction.gateway_response,
      paid_at: transaction.paid_at,
      currency: transaction.currency
    });

    // Prepare update data - same pattern as connection-attempts
    const updateData: Record<string, unknown> = {
      transaction_id: transaction.id,
      transaction_status: transaction.status,
      amount: transaction.amount / 100, // Convert from kobo to naira
      payment_email: transaction.customer?.email || existingPayment.payment_email,
      paystack_ref: transaction.reference,
      payment_status: transaction.status,
      gateway_response: transaction.gateway_response || 'Successful',
      paid_at: transaction.paid_at || new Date().toISOString(),
      currency: transaction.currency || 'NGN',
      updated_at: new Date().toISOString(),
    };

    console.log('📝 Complete update data:', updateData);
    console.log('📝 Updating database with payment ID:', existingPayment.id);
    console.log('📝 Payment ID type:', typeof existingPayment.id);

    // Ensure ID is a number
    const paymentId = typeof existingPayment.id === 'number' ? existingPayment.id : Number(existingPayment.id);
    
    if (!Number.isFinite(paymentId)) {
      console.error('❌ Invalid payment ID:', existingPayment.id);
      const baseUrl = getBaseUrl(request);
      return NextResponse.redirect(
        new URL('/details-payment/failed?error=invalid_payment_id', baseUrl)
      );
    }

    // Update using the same pattern as connection-attempts
    // First update without select to avoid single() error if no rows match
    const { error: updateError } = await supabase
      .from('details_payment')
      .update(updateData)
      .eq('id', paymentId);

    if (updateError) {
      console.error('❌ Database update failed:', updateError);
      console.error('❌ Update error details:', JSON.stringify(updateError, null, 2));
      console.error('❌ Update error code:', updateError.code);
      console.error('❌ Update error message:', updateError.message);
      console.error('❌ Payment ID:', paymentId);
      console.error('❌ Update data being sent:', JSON.stringify(updateData, null, 2));
      
      // Check if the record exists
      const { data: existingRecord, error: selectError } = await supabase
        .from('details_payment')
        .select('*')
        .eq('id', paymentId)
        .single();
      
      console.error('❌ Existing record check:', { existingRecord, selectError });
      
      const baseUrl = getBaseUrl(request);
      return NextResponse.redirect(
        new URL(`/details-payment/failed?error=database_update_failed&details=${encodeURIComponent(updateError.message)}`, baseUrl)
      );
    }

    // After successful update, fetch the updated record
    const { data: updatedPayment, error: fetchError } = await supabase
      .from('details_payment')
      .select('*')
      .eq('id', paymentId)
      .single();

    // Use updatedPayment if available, otherwise use existingPayment
    const finalPayment = updatedPayment || existingPayment;

    if (fetchError && !updatedPayment) {
      console.error('❌ Failed to fetch updated payment:', fetchError);
      // Still continue - the update succeeded, we just can't fetch it
      // Use existingPayment as fallback
      if (transaction.status !== 'success') {
        const baseUrl = getBaseUrl(request);
        return NextResponse.redirect(
          new URL('/details-payment/failed?error=fetch_updated_record_failed', baseUrl)
        );
      }
      console.log('⚠️ Update succeeded but fetch failed, using existing payment data');
    }

    console.log('✅ Database updated successfully:', finalPayment);
    console.log('✅ Payment callback processed successfully:', {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount / 100
    });

    // If payment successful, send contact details and receipt
    if (transaction.status === 'success' && finalPayment) {
      try {
        // Get send_details
        const { data: sendDetails, error: detailsError } = await supabase
          .from('send_details')
          .select('*')
          .eq('id', sendDetailsId)
          .single();

        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email_address, full_name')
          .eq('id', profileId)
          .single();

        if (!detailsError && !profileError && sendDetails && profile && profile.email_address) {
          // Send contact details email
          const contactEmailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Contact Details - GCrooms</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #10D1C1; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0;">GCrooms</h1>
              </div>
              <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
                <h2 style="color: #333; margin-top: 0;">Payment Successful! 🎉</h2>
                <p>Thank you for your payment. Here are the contact details:</p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
                  <h3 style="color: #10D1C1; margin-top: 0; border-bottom: 2px solid #10D1C1; padding-bottom: 10px;">Contact Information</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
                      <td style="padding: 8px 0;">${sendDetails.your_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                      <td style="padding: 8px 0;"><a href="tel:${sendDetails.phone}" style="color: #10D1C1; text-decoration: none;">${sendDetails.phone}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold;">WhatsApp:</td>
                      <td style="padding: 8px 0;"><a href="https://wa.me/${sendDetails.whatsapp.replace(/[^\d]/g, '')}" style="color: #10D1C1; text-decoration: none;">${sendDetails.whatsapp}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                      <td style="padding: 8px 0;">${sendDetails.location}</td>
                    </tr>
                  </table>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                  You can now contact them directly using the information above.
                </p>
              </div>
            </body>
            </html>
          `;

          await sendMail({
            to: profile.email_address,
            subject: "Contact Details - GCrooms",
            html: contactEmailHTML,
          });

          // Send payment receipt
          const receiptEmailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Payment Receipt - GCrooms</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #10D1C1; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0;">GCrooms - Payment Receipt</h1>
              </div>
              <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
                <h2 style="color: #333; margin-top: 0; text-align: center;">PAYMENT RECEIPT</h2>
                <p style="text-align: center; color: #666;">Reference: ${transaction.reference}</p>
                <p style="text-align: center; color: #666;">Date: ${new Date(transaction.paid_at || Date.now()).toLocaleString()}</p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
                  <h3 style="color: #10D1C1; margin-top: 0;">Payment Information</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
                      <td style="padding: 8px 0;">₦${(transaction.amount / 100).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                      <td style="padding: 8px 0; color: #28a745; font-weight: 600;">${transaction.status.toUpperCase()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
                      <td style="padding: 8px 0;">${transaction.id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold;">Reference:</td>
                      <td style="padding: 8px 0;">${transaction.reference}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
                      <td style="padding: 8px 0;">${transaction.authorization?.channel || 'Online Payment'}</td>
                    </tr>
                  </table>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 20px; text-align: center;">
                  Thank you for using GCrooms!
                </p>
              </div>
            </body>
            </html>
          `;

          await sendMail({
            to: profile.email_address,
            subject: "Payment Receipt - GCrooms",
            html: receiptEmailHTML,
          });

          console.log('✅ Contact details and receipt sent to profile owner');
        }
      } catch (emailError) {
        console.error('Error sending contact details email:', emailError);
        // Don't fail the payment process if email fails
      }
    }

    const baseUrl = getBaseUrl(request);

    if (transaction.status === 'success') {
      return NextResponse.redirect(
        new URL(`/details-payment/success?payment_id=${finalPayment.id}&reference=${reference}`, baseUrl)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/details-payment/failed?reference=${reference}&status=${transaction.status}`, baseUrl)
      );
    }

  } catch (error) {
    console.error('Details payment callback error:', error);
    const baseUrl = getBaseUrl(request);
    return NextResponse.redirect(
      new URL('/details-payment/failed?error=internal_error', baseUrl)
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

