import type { PrismaClient } from '@prisma/client'

let cachedPrisma: PrismaClient | null = null
let loadAttempted = false

export async function loadPrisma() {
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
    console.warn('[Analytics] Prisma non disponible, utilisation des données démo.')
    console.error(error)
    return null
  }
}

