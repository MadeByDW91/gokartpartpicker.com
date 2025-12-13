import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sortVendorOffers } from '@/lib/vendorSort'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const part = await prisma.part.findUnique({
      where: { slug: params.slug },
      include: {
        vendorOffers: {
          include: {
            vendor: true,
          },
        },
        compatibleEngines: {
          include: {
            engine: true,
          },
        },
      },
    })

    if (!part) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 })
    }

    // Sort vendor offers (Amazon first, then by price)
    const sortedOffers = sortVendorOffers(part.vendorOffers)

    return NextResponse.json({
      ...part,
      vendorOffers: sortedOffers,
    })
  } catch (error) {
    console.error('Error fetching part:', error)
    return NextResponse.json({ error: 'Failed to fetch part' }, { status: 500 })
  }
}

