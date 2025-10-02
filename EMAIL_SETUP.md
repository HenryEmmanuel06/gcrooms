# Email Configuration for Cancellation System

## Overview
The cancellation system now uses server-side email sending to prevent users from forging cancellation requests. This ensures that the email subject and body template cannot be tampered with.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=gcroomscompany@gmail.com
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `EMAIL_PASS`

## Security Features

- ✅ **Non-editable email templates**: Subject and body template are generated server-side
- ✅ **User input validation**: Only the cancellation reason can be modified by users
- ✅ **Timestamp logging**: All requests are logged with timestamps for audit trails
- ✅ **Request validation**: All cancellation requests go through the same validation as before
- ✅ **Fraud prevention**: Users cannot modify core email content to forge requests

## How It Works

1. User clicks cancellation link (validated within 48 hours)
2. System redirects to `/cancellation-form` with encrypted parameters
3. Form shows non-editable email preview + editable reason field
4. On submission, server sends email with fixed template + user's reason
5. User sees success page with next steps

## Testing

To test the email functionality:

1. Set up environment variables
2. Trigger a cancellation request
3. Check that emails are received at the admin address
4. Verify that email content matches the expected template

## Fallback

If email sending fails, users will see an error message and can be directed to contact support directly at the admin email address.
