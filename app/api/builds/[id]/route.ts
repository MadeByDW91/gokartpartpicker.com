import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateBuildSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  description: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
})

// GET /api/builds/[id] - Get build by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const build = await prisma.savedBuild.findUnique({
      where: { id },
    })

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    // Check ownership
    if (build.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(build)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching build:', error)
    return NextResponse.json({ error: 'Failed to fetch build' }, { status: 500 })
  }
}

// PUT /api/builds/[id] - Update build
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const validated = updateBuildSchema.parse(body)

    // Check ownership
    const existingBuild = await prisma.savedBuild.findUnique({
      where: { id },
    })

    if (!existingBuild) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    if (existingBuild.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const build = await prisma.savedBuild.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.data && { data: validated.data }),
      },
    })

    return NextResponse.json(build)
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
    console.error('Error updating build:', error)
    return NextResponse.json({ error: 'Failed to update build' }, { status: 500 })
  }
}

// DELETE /api/builds/[id] - Delete build
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Check ownership
    const existingBuild = await prisma.savedBuild.findUnique({
      where: { id },
    })

    if (!existingBuild) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    if (existingBuild.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.savedBuild.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Build deleted successfully' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting build:', error)
    return NextResponse.json({ error: 'Failed to delete build' }, { status: 500 })
  }
}

