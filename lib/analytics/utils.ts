import type { PrismaClient } from '@prisma/client'

let cachedPrisma: PrismaClient | null = null
let loadAttempted = false
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)

export async function loadPrisma() {
  if (!hasDatabaseUrl) {
    return null
  }

  if (cachedPrisma) {
    return cachedPrisma
  }

  if (loadAttempted) {
    return null
  }

  loadAttempted = true

  try {
    const { prisma } = await import('@/lib/prisma')
    cachedPrisma = prisma
    return cachedPrisma
  } catch (error) {
    console.warn('[Analytics] Impossible de charger Prisma, retour aux données démo.')
    console.error(error)
    return null
  }
}

