import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  })
}

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
})

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()
    const { items } = checkoutSchema.parse(body)

    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Fetch products and validate prices server-side
    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products are invalid or inactive' }, { status: 400 })
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    let totalCents = 0
    const hasPhysicalItems = products.some((p) => p.type === 'PHYSICAL')

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) continue

      // Use server-side price, never trust client
      lineItems.push({
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: (product.images as string[] | null) || undefined,
          },
          unit_amount: product.priceCents,
        },
        quantity: item.quantity,
      })

      totalCents += product.priceCents * item.quantity
    }

    // Create order record (PENDING status)
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id || null,
        email: session?.user?.email || 'guest@example.com', // Will be updated from Stripe
        status: 'PENDING',
        totalCents,
        currency: 'USD',
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!
            return {
              productId: product.id,
              nameSnapshot: product.name,
              typeSnapshot: product.type,
              unitPriceCentsSnapshot: product.priceCents,
              quantity: item.quantity,
            }
          }),
        },
      },
    })

    // Create Stripe Checkout session
    const stripe = getStripe()
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/cancel`,
      customer_email: session?.user?.email || undefined,
      shipping_address_collection: hasPhysicalItems ? { allowed_countries: ['US'] } : undefined,
      metadata: {
        orderId: order.id,
      },
    })

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: checkoutSession.id },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

