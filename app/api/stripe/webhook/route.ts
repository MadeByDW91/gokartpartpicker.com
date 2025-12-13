import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  })
}

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session & {
        shipping_details?: {
          name?: string | null
          address?: Stripe.Address | null
        } | null
      }

      // Find order by Stripe session ID
      const order = await prisma.order.findUnique({
        where: { stripeCheckoutSessionId: session.id },
        include: { items: { include: { product: true } } },
      })

      if (!order) {
        console.error('Order not found for session:', session.id)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Update order status to PAID
      const shippingDetails = session.shipping_details
      let shippingAddress: any = null
      if (shippingDetails?.address) {
        shippingAddress = JSON.parse(JSON.stringify(shippingDetails.address))
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          email: session.customer_email || session.customer_details?.email || order.email,
          stripePaymentIntentId: session.payment_intent as string | null,
          shippingName: session.shipping_details?.name || null,
          shippingAddress,
        },
      })

      // Create download tokens for digital products
      const digitalItems = order.items.filter((item) => item.typeSnapshot === 'DIGITAL')
      if (digitalItems.length > 0) {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

        for (const item of digitalItems) {
          const token = randomBytes(32).toString('hex')
          await prisma.digitalDownloadToken.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              token,
              expiresAt,
              maxDownloads: 5,
            },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

