import { auth } from './auth'
import { prisma } from './prisma'

/**
 * Get the current user session on the server
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

/**
 * Get the current user ID, or throw if not authenticated
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user
}

/**
 * Get the current user from database
 */
export async function getCurrentUserFromDb() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  return await prisma.user.findUnique({
    where: { id: session.user.id },
  })
}

