import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const engineId = searchParams.get('engineId')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (engineId) {
      where.compatibleEngines = {
        some: {
          engineId: engineId,
        },
      }
    }

    const parts = await prisma.part.findMany({
      where,
      include: {
        vendorOffers: {
          include: {
            vendor: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(parts)
  } catch (error) {
    console.error('Error fetching parts:', error)
    return NextResponse.json({ error: 'Failed to fetch parts' }, { status: 500 })
  }
}

