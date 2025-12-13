import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sortVendorOffers } from '@/lib/vendorSort'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const guide = await prisma.guide.findUnique({
      where: { slug },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        engines: {
          include: {
            engine: true,
          },
        },
        parts: {
          include: {
            part: {
              include: {
                vendorOffers: {
                  include: {
                    vendor: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
    }

    // Sort vendor offers for each part
    const guideWithSortedOffers = {
      ...guide,
      parts: guide.parts.map((gp) => ({
        ...gp,
        part: {
          ...gp.part,
          vendorOffers: sortVendorOffers(gp.part.vendorOffers),
        },
      })),
    }

    return NextResponse.json(guideWithSortedOffers)
  } catch (error) {
    console.error('Error fetching guide:', error)
    return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 })
  }
}

