# Storefront Setup Guide

This guide explains how to set up and test the GoKartPartPicker.com storefront.

## Prerequisites

1. **Stripe Account**: Create a free Stripe account at https://stripe.com
2. **Stripe Test Keys**: Get your test API keys from the Stripe Dashboard

## Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
```

### Getting Stripe Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)

### Setting Up Webhooks

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://your-domain.com/api/stripe/webhook`
   - For local testing, use a tool like [ngrok](https://ngrok.com) or [Stripe CLI](https://stripe.com/docs/stripe-cli)
4. Select event: `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`) to `STRIPE_WEBHOOK_SECRET`

### Local Webhook Testing

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will output a webhook signing secret. Use that for `STRIPE_WEBHOOK_SECRET` in your `.env`.

## Database Setup

Run migrations and seed:

```bash
npm run db:migrate
npm run db:seed
```

This will create 3 sample products:
1. **Predator 212 Stage 1 Checklist (PDF)** - $9.99 (Digital)
2. **Go-Kart Tool Tray STL Pack** - $14.99 (Digital)
3. **3D Printed Carb Jet Organizer** - $24.99 (Physical)

## Placeholder Assets

The seed script references placeholder files:
- `public/assets/sample/predator-212-stage-1-checklist.pdf`
- `public/assets/sample/tool-tray-stl-pack.zip`
- `public/images/products/*.png`

These are created automatically. For production, replace with actual product files.

## Manual Test Checklist

### Storefront
- [ ] Visit `/store` - see all 3 products
- [ ] Filter by Digital/Physical
- [ ] Click product - view detail page
- [ ] Add product to cart - see confirmation

### Cart
- [ ] Visit `/cart` - see added items
- [ ] Adjust quantities
- [ ] Remove items
- [ ] View order summary

### Checkout
- [ ] Click "Proceed to Checkout"
- [ ] Redirected to Stripe Checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Expiry: any future date
- [ ] CVC: any 3 digits
- [ ] Complete payment

### Order Success
- [ ] Redirected to `/order/success?session_id=...`
- [ ] See order confirmation
- [ ] Digital products show download buttons
- [ ] Physical products show fulfillment message

### Digital Downloads
- [ ] Click download button
- [ ] File downloads (or placeholder message)
- [ ] Download count increments
- [ ] Try expired/invalid token - see error

### Webhook
- [ ] Check Stripe Dashboard - payment recorded
- [ ] Check database - order status is `PAID`
- [ ] Check database - download tokens created for digital items

## Test Cards

Use these Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

## Security Notes

- All prices are validated server-side
- Download tokens expire after 7 days
- Download limit: 5 per token
- Webhook signature is verified
- Order ownership is checked for logged-in users

## Production Checklist

Before going live:

1. [ ] Switch to Stripe live keys
2. [ ] Update webhook endpoint to production URL
3. [ ] Replace placeholder product images
4. [ ] Replace placeholder digital assets
5. [ ] Test with real payment methods
6. [ ] Set up order fulfillment workflow
7. [ ] Configure shipping rates (if needed)
8. [ ] Set up email notifications
9. [ ] Review security settings
10. [ ] Test download links thoroughly


