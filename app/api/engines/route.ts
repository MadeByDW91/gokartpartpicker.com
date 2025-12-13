import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const engines = await prisma.engine.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(engines)
  } catch (error) {
    console.error('Error fetching engines:', error)
    return NextResponse.json({ error: 'Failed to fetch engines' }, { status: 500 })
  }
}

