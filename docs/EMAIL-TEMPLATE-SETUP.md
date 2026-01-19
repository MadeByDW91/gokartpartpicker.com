# Email Verification Template Setup

This document explains how to set up professional email verification emails for GoKart Part Picker using Supabase.

## Quick Setup

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Confirm signup** template
4. Copy the HTML template from `supabase/email-templates/confirm-signup.html`
5. Paste it into the Supabase email template editor
6. Save the template

## Email Template Location

The email template is located at:
- `supabase/email-templates/confirm-signup.html`

## Available Variables

Supabase provides these variables in email templates:

- `{{ .ConfirmationURL }}` - The verification link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Verification token (if needed)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL

## Testing

1. Register a new account
2. Check your email inbox
3. Verify the email looks professional and matches your brand
4. Click the verification link to confirm it works

## Customization

To customize the email:
1. Edit `supabase/email-templates/confirm-signup.html`
2. Update colors, text, or branding as needed
3. Copy the updated HTML to Supabase dashboard

## Troubleshooting

**Emails not sending:**
- Check Supabase project settings → Authentication → Email
- Verify SMTP settings if using custom SMTP
- Check spam folder

**Email looks broken:**
- Ensure all HTML is properly formatted
- Test with different email clients (Gmail, Outlook, etc.)
- Use inline CSS for better compatibility
