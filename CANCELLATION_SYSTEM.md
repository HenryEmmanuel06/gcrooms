# 48-Hour Cancellation System

## Overview
The GCrooms platform now includes a 48-hour cancellation window for users who have paid to access room owner contact details. This system ensures fair treatment for all parties while providing users with a reasonable cancellation period.

## How It Works

### 1. Email Template Update
- The room details email now includes a "Cancel & Contact Support" button
- This button is only active for 48 hours after payment
- The button links to a validation route instead of directly to mailto

### 2. Cancellation Validation Route
**Endpoint:** `/api/check-cancellation`

**Parameters:**
- `roomId`: The ID of the room
- `userEmail`: The email of the user who made the payment
- `timestamp`: Fallback timestamp for when payment was made

**Logic:**
1. Checks if a valid payment exists in the payments table (preferred method)
2. Falls back to timestamp validation if payments table doesn't exist
3. Redirects to appropriate page based on validation result

### 3. User Journey

#### Within 48 Hours:
1. User clicks "Cancel & Contact Support" button in email
2. System validates the cancellation window
3. User is redirected to `/cancel-redirect` page
4. Email client opens with pre-filled cancellation request
5. User can send cancellation request to admin

#### After 48 Hours:
1. User clicks "Cancel & Contact Support" button in email
2. System detects expired cancellation window
3. User is redirected to `/cancellation-expired` page
4. Page explains the policy and provides alternative contact methods

## Database Schema

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  user_email TEXT NOT NULL,
  user_full_name TEXT,
  user_phone TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payment_reference TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Files

### API Routes
- `/src/app/api/check-cancellation/route.ts` - Validates cancellation eligibility
- `/src/app/api/send-room-details/route.ts` - Updated to include payment tracking

### Pages
- `/src/app/cancellation-expired/page.tsx` - Shown when 48 hours have passed
- `/src/app/cancel-redirect/page.tsx` - Handles mailto redirect for valid cancellations

### Database Migration
- `/migrations/create_payments_table.sql` - Creates the payments tracking table

## Environment Variables

Make sure these are set in your `.env` file:

```env
ADMIN_EMAIL=support@gcrooms.com
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Setup Instructions

1. **Run the database migration:**
   ```sql
   -- Execute the SQL in /migrations/create_payments_table.sql
   -- in your Supabase SQL editor
   ```

2. **Update your payment processing:**
   - Ensure payment records are saved when users successfully pay
   - The `savePaymentRecord()` function is automatically called in the send-room-details route

3. **Configure environment variables:**
   - Set `ADMIN_EMAIL` to your support email
   - Set `NEXT_PUBLIC_BASE_URL` to your domain

## Testing

### Test Valid Cancellation:
1. Make a payment for room access
2. Check the email for the cancel button
3. Click the button immediately
4. Verify it opens email client with pre-filled message

### Test Expired Cancellation:
1. Manually modify the timestamp in the cancellation URL to be older than 48 hours
2. Click the modified link
3. Verify it shows the expiration page

## Fallback Method

If you don't have a payments table yet, the system uses a timestamp-based fallback:
- The email includes a `timestamp` parameter in the cancellation URL
- The validation route calculates the time difference
- This ensures the system works even without the payments table

## Security Considerations

- All cancellation links are time-limited
- User email validation prevents unauthorized cancellations
- Payment records are tracked for audit purposes
- RLS policies protect payment data access

## Future Enhancements

1. **Admin Dashboard:** Create an interface to view and manage cancellation requests
2. **Automated Refunds:** Integrate with payment gateway for automatic refund processing
3. **Email Notifications:** Notify admins when cancellation requests are submitted
4. **Analytics:** Track cancellation rates and reasons for business insights
