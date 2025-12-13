import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const guides = await prisma.guide.findMany({
      include: {
        engines: {
          include: {
            engine: true,
          },
        },
        parts: {
          include: {
            part: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    })

    return NextResponse.json(guides)
  } catch (error) {
    console.error('Error fetching guides:', error)
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 })
  }
}

