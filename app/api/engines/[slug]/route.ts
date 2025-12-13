import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const engine = await prisma.engine.findUnique({
      where: { slug },
      include: {
        compatibleParts: {
          include: {
            part: true,
          },
        },
      },
    })

    if (!engine) {
      return NextResponse.json({ error: 'Engine not found' }, { status: 404 })
    }

    return NextResponse.json(engine)
  } catch (error) {
    console.error('Error fetching engine:', error)
    return NextResponse.json({ error: 'Failed to fetch engine' }, { status: 500 })
  }
}

