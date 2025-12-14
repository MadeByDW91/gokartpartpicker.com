import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlaceholderId } from '@/lib/videoVerification'

/**
 * API endpoint to verify YouTube video availability
 * GET /api/videos/verify?youtubeId=VIDEO_ID
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const youtubeId = searchParams.get('youtubeId')

  if (!youtubeId) {
    return NextResponse.json(
      { error: 'youtubeId parameter is required' },
      { status: 400 }
    )
  }

  // Check if it's a placeholder
  if (isPlaceholderId(youtubeId)) {
    return NextResponse.json({
      valid: false,
      reason: 'placeholder_id',
      message: 'This is a placeholder video ID',
    })
  }

  // Verify video by checking thumbnail
  try {
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    const response = await fetch(thumbnailUrl, { 
      method: 'HEAD',
      cache: 'no-store',
    })

    const isValid = response.ok && response.headers.get('content-type')?.startsWith('image/')

    return NextResponse.json({
      valid: isValid,
      youtubeId,
      thumbnailUrl: isValid ? thumbnailUrl : null,
      message: isValid ? 'Video is accessible' : 'Video not found or unavailable',
    })
  } catch (error) {
    return NextResponse.json({
      valid: false,
      youtubeId,
      error: 'Failed to verify video',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Verify all videos in database and return results
 * GET /api/videos/verify/all
 */
export async function POST(request: Request) {
  try {
    const videos = await prisma.video.findMany({
      select: {
        id: true,
        youtubeId: true,
        title: true,
      },
    })

    const results = await Promise.all(
      videos.map(async (video) => {
        const isPlaceholder = isPlaceholderId(video.youtubeId)
        
        if (isPlaceholder) {
          return {
            id: video.id,
            youtubeId: video.youtubeId,
            title: video.title,
            valid: false,
            reason: 'placeholder',
          }
        }

        try {
          const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
          const response = await fetch(thumbnailUrl, { 
            method: 'HEAD',
            cache: 'no-store',
          })
          const isValid = response.ok && response.headers.get('content-type')?.startsWith('image/')

          return {
            id: video.id,
            youtubeId: video.youtubeId,
            title: video.title,
            valid: isValid,
            reason: isValid ? 'valid' : 'not_found',
          }
        } catch (error) {
          return {
            id: video.id,
            youtubeId: video.youtubeId,
            title: video.title,
            valid: false,
            reason: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })
    )

    const validCount = results.filter(r => r.valid).length
    const invalidCount = results.filter(r => !r.valid).length

    return NextResponse.json({
      total: videos.length,
      valid: validCount,
      invalid: invalidCount,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify videos', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

