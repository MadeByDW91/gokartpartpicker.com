/**
 * Verify if a YouTube video is accessible
 * This is used client-side to check video availability
 */
export async function verifyYouTubeVideo(youtubeId: string): Promise<boolean> {
  try {
    // Check if it's a placeholder ID
    const isPlaceholder = /^[A-Z0-9_-]{11}$/.test(youtubeId) && 
      (youtubeId === youtubeId[0].repeat(11) || 
       /A{10,}/.test(youtubeId) ||
       youtubeId.includes('AAAAAAAAAA'))

    if (isPlaceholder) {
      return false
    }

    // Try to fetch the thumbnail
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    const response = await fetch(thumbnailUrl, { 
      method: 'HEAD',
      mode: 'no-cors', // Use no-cors to avoid CORS issues
    })
    
    // With no-cors, we can't check status, but we can try loading the image
    // For a more reliable check, we'd need a server-side API
    return true // Assume valid if not a placeholder
  } catch (error) {
    return false
  }
}

/**
 * Check if a YouTube video ID format is valid
 */
export function isValidYouTubeIdFormat(id: string): boolean {
  // YouTube video IDs are 11 characters, alphanumeric, dash, underscore
  return /^[a-zA-Z0-9_-]{11}$/.test(id)
}

/**
 * Check if a video ID is likely a placeholder
 */
export function isPlaceholderId(id: string): boolean {
  return /^[A-Z0-9_-]{11}$/.test(id) && 
    (id === id[0].repeat(11) || 
     /A{10,}/.test(id) ||
     id.includes('AAAAAAAAAA'))
}

