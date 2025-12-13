/**
 * Build Link Encoder/Decoder
 * 
 * Encodes build state into shareable URL parameters.
 * Format: /build?b=<base64url-encoded-json>
 * 
 * Schema:
 * {
 *   v: number,        // version
 *   e: string | null, // engine slug
 *   p: string[],      // part slugs
 *   o?: Record<string, string> // partId -> vendorOfferId mapping (optional)
 * }
 */

export interface EncodedBuild {
  v: number
  e: string | null
  p: string[]
  o?: Record<string, string>
}

const CURRENT_VERSION = 1

/**
 * Encode build state to base64url string
 */
export function encodeBuild(engine: { slug: string } | null, parts: Array<{ slug: string; id: string; selectedOffer?: { id: string } | null }>): string {
  const encoded: EncodedBuild = {
    v: CURRENT_VERSION,
    e: engine?.slug || null,
    p: parts.map((p) => p.slug),
  }

  // Include offer mappings if any parts have selected offers
  const offerMap: Record<string, string> = {}
  for (const part of parts) {
    if (part.selectedOffer?.id) {
      offerMap[part.id] = part.selectedOffer.id
    }
  }
  if (Object.keys(offerMap).length > 0) {
    encoded.o = offerMap
  }

  try {
    const json = JSON.stringify(encoded)
    // Convert to base64url (URL-safe base64)
    return btoa(json)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  } catch (error) {
    console.error('Failed to encode build:', error)
    throw new Error('Failed to encode build')
  }
}

/**
 * Decode base64url string to build state
 */
export function decodeBuild(encoded: string): EncodedBuild | null {
  try {
    // Convert from base64url to base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '='
    }
    const json = atob(base64)
    const decoded: EncodedBuild = JSON.parse(json)

    // Validate version
    if (!decoded.v || decoded.v > CURRENT_VERSION) {
      console.warn(`Unsupported build version: ${decoded.v}`)
      return null
    }

    return decoded
  } catch (error) {
    console.error('Failed to decode build:', error)
    return null
  }
}

/**
 * Generate shareable build URL
 */
export function generateBuildUrl(engine: { slug: string } | null, parts: Array<{ slug: string; id: string; selectedOffer?: { id: string } | null }>): string {
  const encoded = encodeBuild(engine, parts)
  if (typeof window === 'undefined') {
    return `/build?b=${encoded}`
  }
  return `${window.location.origin}/build?b=${encoded}`
}

