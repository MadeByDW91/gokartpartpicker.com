import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const engine = await prisma.engine.findUnique({
      where: { slug: params.slug },
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

