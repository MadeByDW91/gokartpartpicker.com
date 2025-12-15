import { prisma } from './prisma'

export interface AxleInput {
  type: 'LIVE' | 'DEAD'
  diameter: number // in inches
  length: number // in inches
  keywayWidth: number // in inches
  keywayHeight?: number // in inches, optional
  threadedEnds?: boolean
  threadSize?: string
  notes?: string
  units?: 'in' | 'mm' // For display purposes only
}

export interface CompatibilityResult {
  axlePart: {
    id: string
    slug: string
    name: string
    description: string | null
    category: string
    specs: any
    affiliateUrl: string | null
  }
  status: 'FITS' | 'FITS_WITH_NOTES' | 'NOT_COMPATIBLE'
  notes: string | null
  matchReason: string
}

export interface GroupedResults {
  [category: string]: CompatibilityResult[]
}

// Tolerance for diameter matching (in inches)
const DIAMETER_TOLERANCE = 0.01

/**
 * Get compatible parts for an axle configuration
 */
export async function getAxleCompatibility(
  axleInput: AxleInput
): Promise<GroupedResults> {
  // Fetch all active axle parts
  const allParts = await prisma.axlePart.findMany({
    where: { isActive: true },
    include: {
      compatibilityRules: {
        where: {
          axleType: axleInput.type,
        },
      },
    },
  })

  const results: CompatibilityResult[] = []

  for (const part of allParts) {
    // Find matching compatibility rule
    const matchingRule = part.compatibilityRules.find((rule) => {
      // Check diameter range
      if (rule.minAxleDiameter && axleInput.diameter < rule.minAxleDiameter) {
        return false
      }
      if (rule.maxAxleDiameter && axleInput.diameter > rule.maxAxleDiameter) {
        return false
      }

      // Check keyway width if specified
      if (rule.keywayWidth !== null && rule.keywayWidth !== undefined) {
        const keywayDiff = Math.abs(rule.keywayWidth - axleInput.keywayWidth)
        if (keywayDiff > DIAMETER_TOLERANCE) {
          // Keyway mismatch - might still fit with notes
          return false
        }
      }

      return true
    })

    if (matchingRule) {
      // Direct match found
      results.push({
        axlePart: {
          id: part.id,
          slug: part.slug,
          name: part.name,
          description: part.description,
          category: part.category,
          specs: part.specs,
          affiliateUrl: part.affiliateUrl,
        },
        status: matchingRule.status,
        notes: matchingRule.notes,
        matchReason: generateMatchReason(axleInput, part, matchingRule),
      })
    } else {
      // Check if part specs match (for parts without explicit rules)
      const specs = part.specs as any
      const boreDiameter = specs?.boreDiameter

      if (boreDiameter) {
        const diameterDiff = Math.abs(boreDiameter - axleInput.diameter)
        if (diameterDiff <= DIAMETER_TOLERANCE) {
          // Perfect fit
          results.push({
            axlePart: {
              id: part.id,
              slug: part.slug,
              name: part.name,
              description: part.description,
              category: part.category,
              specs: part.specs,
              affiliateUrl: part.affiliateUrl,
            },
            status: 'FITS',
            notes: null,
            matchReason: `Bore diameter (${boreDiameter}") matches axle diameter (${axleInput.diameter}")`,
          })
        } else if (diameterDiff <= 0.05) {
          // Close fit - might need shimming
          results.push({
            axlePart: {
              id: part.id,
              slug: part.slug,
              name: part.name,
              description: part.description,
              category: part.category,
              specs: part.specs,
              affiliateUrl: part.affiliateUrl,
            },
            status: 'FITS_WITH_NOTES',
            notes: `Bore diameter (${boreDiameter}") is close to axle diameter (${axleInput.diameter}"). May require shimming or bushing.`,
            matchReason: `Bore diameter close match (${boreDiameter}" vs ${axleInput.diameter}")`,
          })
        } else {
          // Not compatible
          results.push({
            axlePart: {
              id: part.id,
              slug: part.slug,
              name: part.name,
              description: part.description,
              category: part.category,
              specs: part.specs,
              affiliateUrl: part.affiliateUrl,
            },
            status: 'NOT_COMPATIBLE',
            notes: `Bore diameter (${boreDiameter}") does not match axle diameter (${axleInput.diameter}")`,
            matchReason: `Bore diameter mismatch (${boreDiameter}" vs ${axleInput.diameter}")`,
          })
        }
      } else {
        // No bore diameter specified - check keyway if available
        const keywayWidth = specs?.keywayWidth
        if (keywayWidth) {
          const keywayDiff = Math.abs(keywayWidth - axleInput.keywayWidth)
          if (keywayDiff <= DIAMETER_TOLERANCE) {
            results.push({
              axlePart: {
                id: part.id,
                slug: part.slug,
                name: part.name,
                description: part.description,
                category: part.category,
                specs: part.specs,
                affiliateUrl: part.affiliateUrl,
              },
              status: 'FITS_WITH_NOTES',
              notes: 'Keyway matches, but verify bore diameter compatibility.',
              matchReason: `Keyway width matches (${keywayWidth}")`,
            })
          } else {
            results.push({
              axlePart: {
                id: part.id,
                slug: part.slug,
                name: part.name,
                description: part.description,
                category: part.category,
                specs: part.specs,
                affiliateUrl: part.affiliateUrl,
              },
              status: 'NOT_COMPATIBLE',
              notes: `Keyway width (${keywayWidth}") does not match (${axleInput.keywayWidth}")`,
              matchReason: `Keyway width mismatch (${keywayWidth}" vs ${axleInput.keywayWidth}")`,
            })
          }
        }
      }
    }
  }

  // Group by category
  const grouped: GroupedResults = {}
  for (const result of results) {
    const category = result.axlePart.category
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(result)
  }

  return grouped
}

function generateMatchReason(
  axleInput: AxleInput,
  part: any,
  rule: any
): string {
  const reasons: string[] = []

  if (rule.minAxleDiameter && rule.maxAxleDiameter) {
    reasons.push(
      `Axle diameter (${axleInput.diameter}") within range (${rule.minAxleDiameter}" - ${rule.maxAxleDiameter}")`
    )
  } else if (rule.minAxleDiameter) {
    reasons.push(`Axle diameter (${axleInput.diameter}") >= ${rule.minAxleDiameter}"`)
  } else if (rule.maxAxleDiameter) {
    reasons.push(`Axle diameter (${axleInput.diameter}") <= ${rule.maxAxleDiameter}"`)
  }

  if (rule.keywayWidth !== null && rule.keywayWidth !== undefined) {
    reasons.push(`Keyway width matches (${rule.keywayWidth}")`)
  }

  return reasons.join('. ') || 'Compatible based on specifications'
}

