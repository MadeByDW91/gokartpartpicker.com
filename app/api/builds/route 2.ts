import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const MAX_BUILDS = 10

const createBuildSchema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().optional(),
  data: z.record(z.string(), z.any()), // JSON object
})

// GET /api/builds - List user's builds
export async function GET() {
  try {
    const user = await requireAuth()

    const builds = await prisma.savedBuild.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        description: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(builds)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching builds:', error)
    return NextResponse.json({ error: 'Failed to fetch builds' }, { status: 500 })
  }
}

// POST /api/builds - Create new build
export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const validated = createBuildSchema.parse(body)

    // Check build limit
    const buildCount = await prisma.savedBuild.count({
      where: { userId: user.id },
    })

    if (buildCount >= MAX_BUILDS) {
      return NextResponse.json(
        {
          error: `Build limit reached (${MAX_BUILDS}). Delete a build to create a new one.`,
          limit: MAX_BUILDS,
          current: buildCount,
        },
        { status: 403 }
      )
    }

    const build = await prisma.savedBuild.create({
      data: {
        userId: user.id,
        name: validated.name,
        description: validated.description,
        data: validated.data,
      },
    })

    return NextResponse.json(build, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }
    console.error('Error creating build:', error)
    return NextResponse.json({ error: 'Failed to create build' }, { status: 500 })
  }
}

