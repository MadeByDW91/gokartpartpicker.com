import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const session = await auth()

    // Find download token
    const downloadToken = await prisma.digitalDownloadToken.findUnique({
      where: { token },
      include: {
        order: true,
        product: true,
      },
    })

    if (!downloadToken) {
      return NextResponse.json({ error: 'Invalid download token' }, { status: 404 })
    }

    // Check expiry
    if (new Date() > downloadToken.expiresAt) {
      return NextResponse.json({ error: 'Download link has expired' }, { status: 410 })
    }

    // Check download limit
    if (downloadToken.downloadCount >= downloadToken.maxDownloads) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 403 })
    }

    // Verify ownership if user is logged in
    if (session?.user?.id && downloadToken.order.userId && downloadToken.order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check order is paid
    if (downloadToken.order.status !== 'PAID') {
      return NextResponse.json({ error: 'Order not paid' }, { status: 403 })
    }

    // Increment download count
    await prisma.digitalDownloadToken.update({
      where: { id: downloadToken.id },
      data: { downloadCount: { increment: 1 } },
    })

    // Serve file
    const assetPath = downloadToken.product.digitalAssetPath
    if (!assetPath) {
      return NextResponse.json({ error: 'Product file not found' }, { status: 404 })
    }

    // Construct file path (assuming files are in public/assets/sample/)
    const filePath = join(process.cwd(), 'public', assetPath)

    if (!existsSync(filePath)) {
      // If file doesn't exist, return a placeholder message
      return NextResponse.json(
        { error: 'File not found. This is a placeholder product.' },
        { status: 404 }
      )
    }

    const fileBuffer = await readFile(filePath)
    const fileName = assetPath.split('/').pop() || 'download'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
}


