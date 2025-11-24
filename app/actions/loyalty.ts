'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function retryQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 100
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn()
    } catch (error: any) {
      const isPreparedStatementError = error?.message?.includes('prepared statement') && 
                                       error?.message?.includes('already exists')
      
      if (isPreparedStatementError && i < maxRetries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

export async function initializeLoyaltyProgram() {
  try {
    // First, test database connection
    try {
      await prisma.$connect()
      console.log('[Initialize] Database connection successful')
    } catch (connError) {
      console.error('[Initialize] Database connection failed:', connError)
      return {
        success: false,
        error: 'Impossible de se connecter à la base de données. Vérifiez votre configuration DATABASE_URL.',
        details: connError instanceof Error ? connError.message : String(connError)
      }
    }

    // Check if tables exist by trying a simple query
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('[Initialize] Database tables accessible')
    } catch (tableError: any) {
      console.error('[Initialize] Table access error:', tableError)
      const errorMsg = tableError?.message || String(tableError)
      
      if (errorMsg.includes('does not exist') || errorMsg.includes('relation') || errorMsg.includes('table')) {
        return {
          success: false,
          error: 'Les tables de fidélité n\'existent pas dans la base de données.',
          details: 'Veuillez exécuter le script create-tables.sql dans Supabase SQL Editor pour créer les tables nécessaires.'
        }
      }
    }

    // Check if program already exists with retry
    let existing
    try {
      existing = await retryQuery(async () => {
        return await prisma.loyaltyProgram.findFirst()
      }, 2, 200) // Only 2 retries with 200ms delay
    } catch (findError: any) {
      console.error('[Initialize] Error finding existing program:', findError)
      const errorMsg = findError?.message || String(findError)
      
      if (errorMsg.includes('prepared statement')) {
        // This is a transient error, suggest retry
        return {
          success: false,
          error: 'Erreur temporaire de connexion. Veuillez réessayer dans quelques instants.',
          details: 'Cette erreur se produit parfois dans les environnements serverless. Réessayez dans 5-10 secondes.'
        }
      }
      
      return {
        success: false,
        error: `Erreur lors de la vérification: ${errorMsg}`,
        details: findError instanceof Error ? findError.stack : undefined
      }
    }
    
    if (existing) {
      return { success: true, message: 'Programme déjà existant', programId: existing.id }
    }

    console.log('[Initialize] Creating new loyalty program...')

    // Use transaction to ensure atomicity and avoid prepared statement conflicts
    const result = await prisma.$transaction(async (tx) => {
      // Create default program
      const program = await tx.loyaltyProgram.create({
        data: {
          name: 'Programme de fidélité Swiim',
          description: 'Programme de fidélité par défaut',
          pointsPerEuro: 1,
          conversionRate: 100,
          conversionValue: 5,
          bonusCategories: {
            'Livres': 2,
            'Vinyles': 2,
          },
          pointsExpiryDays: 365,
        },
      })

      // Create default tiers
      await tx.loyaltyTier.createMany({
        data: [
          {
            programId: program.id,
            name: 'Bronze',
            minSpend: 0,
            maxSpend: 100,
            benefits: {
              'Points standard': '1 point par euro',
            },
            sortOrder: 1,
          },
          {
            programId: program.id,
            name: 'Argent',
            minSpend: 100,
            maxSpend: 500,
            benefits: {
              'Points bonus': '1.5 points par euro',
              'Remise': '5% sur les achats',
            },
            sortOrder: 2,
          },
          {
            programId: program.id,
            name: 'Or',
            minSpend: 500,
            maxSpend: null,
            benefits: {
              'Points premium': '2 points par euro',
              'Remise': '10% sur les achats',
              'Livraison gratuite': 'Toujours',
            },
            sortOrder: 3,
          },
        ],
      })

      return program
    }, {
      maxWait: 10000, // 10 seconds
      timeout: 20000, // 20 seconds
    })

    revalidatePath('/fidelite')
    console.log('[Initialize] Program created successfully:', result.id)
    return { success: true, message: 'Programme initialisé avec succès', programId: result.id }
  } catch (error) {
    console.error('[Initialize] Error initializing loyalty program:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('[Initialize] Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : undefined
    })
    
    // Check if it's a prepared statement error
    const isPreparedStatementError = errorMessage.includes('prepared statement') && 
                                     (errorMessage.includes('already exists') || errorMessage.includes('s0'))
    
    if (isPreparedStatementError) {
      return { 
        success: false, 
        error: 'Erreur temporaire de connexion. Veuillez réessayer dans 10-15 secondes.',
        details: 'Cette erreur se produit parfois dans les environnements serverless. Attendez quelques secondes et réessayez.'
      }
    }
    
    // Check if it's a table/relation error
    if (errorMessage.includes('does not exist') || errorMessage.includes('relation') || errorMessage.includes('table')) {
      return {
        success: false,
        error: 'Les tables de fidélité n\'existent pas dans la base de données.',
        details: 'Veuillez exécuter le script create-tables.sql dans Supabase SQL Editor pour créer les tables nécessaires (LoyaltyProgram, LoyaltyTier, LoyaltyAccount, LoyaltyCampaign).'
      }
    }
    
    // Check if it's a connection error
    if (errorMessage.includes('Can\'t reach database') || errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      return {
        success: false,
        error: 'Impossible de se connecter à la base de données.',
        details: 'Vérifiez que votre DATABASE_URL est correctement configuré dans Vercel (Settings → Environment Variables).'
      }
    }
    
    return { 
      success: false, 
      error: `Échec de l'initialisation: ${errorMessage}`,
      details: errorStack
    }
  } finally {
    // Always disconnect in serverless
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      // Ignore disconnect errors
      console.warn('[Initialize] Error disconnecting:', disconnectError)
    }
  }
}

export async function updateProgramRules(programId: string, rules: {
  pointsPerEuro?: number
  conversionRate?: number
  conversionValue?: number
  bonusCategories?: Record<string, number>
  pointsExpiryDays?: number
  welcomeBonus?: number
  birthdayBonus?: number
  reactivationBonus?: { points: number; inactivityDays: number }
}) {
  try {
    await prisma.loyaltyProgram.update({
      where: { id: programId },
      data: {
        pointsPerEuro: rules.pointsPerEuro,
        conversionRate: rules.conversionRate,
        conversionValue: rules.conversionValue,
        bonusCategories: rules.bonusCategories ? JSON.parse(JSON.stringify(rules.bonusCategories)) : undefined,
        pointsExpiryDays: rules.pointsExpiryDays,
      },
    })
    revalidatePath('/fidelite')
    return { success: true }
  } catch (error) {
    console.error('Error updating program rules:', error)
    return { error: 'Failed to update program rules' }
  }
}

export async function updateTiers(programId: string, tiers: Array<{
  id: string
  name: string
  minSpend: number
  maxSpend?: number
  benefits?: any
}>) {
  try {
    // Delete existing tiers and recreate
    await prisma.loyaltyTier.deleteMany({
      where: { programId },
    })

    await prisma.loyaltyTier.createMany({
      data: tiers.map((tier, index) => ({
        programId,
        name: tier.name,
        minSpend: tier.minSpend,
        maxSpend: tier.maxSpend,
        benefits: tier.benefits ? JSON.parse(JSON.stringify(tier.benefits)) : undefined,
        sortOrder: index,
      })),
    })

    revalidatePath('/fidelite')
    return { success: true }
  } catch (error) {
    console.error('Error updating tiers:', error)
    return { error: 'Failed to update tiers' }
  }
}

export async function createCampaign(programId: string, campaign: {
  name: string
  description?: string
  targetSegment: string
  channel: string
  offerType: string
  offerPayload?: any
  status: string
  estimatedImpact?: any
}) {
  try {
    await prisma.loyaltyCampaign.create({
      data: {
        programId,
        name: campaign.name,
        description: campaign.description,
        targetSegment: campaign.targetSegment,
        channel: campaign.channel,
        offerType: campaign.offerType,
        offerPayload: campaign.offerPayload ? JSON.parse(JSON.stringify(campaign.offerPayload)) : undefined,
        status: campaign.status,
        estimatedImpact: campaign.estimatedImpact ? JSON.parse(JSON.stringify(campaign.estimatedImpact)) : undefined,
        stats: { sent: 0, opened: 0, clicked: 0, conversions: 0, extraRevenue: 0 },
      },
    })
    revalidatePath('/fidelite')
    return { success: true }
  } catch (error) {
    console.error('Error creating campaign:', error)
    return { error: 'Failed to create campaign' }
  }
}

export async function simulateProgramChange(params: {
  pointsPerEuroChange?: number
  bonusCategory?: string
  tierThresholdChange?: number
}) {
  try {
    // Simple heuristic-based simulation
    const accounts = await prisma.loyaltyAccount.count()
    const totalPoints = await prisma.loyaltyAccount.aggregate({
      _sum: { points: true },
    })
    const totalSpend = await prisma.loyaltyAccount.aggregate({
      _sum: { totalSpend: true },
    })

    const baseRevenue = Number(totalSpend._sum.totalSpend) || 10000
    const basePoints = Number(totalPoints._sum.points) || 50000

    // Calculate impact
    const pointsMultiplier = 1 + (params.pointsPerEuroChange || 0) / 100
    const estimatedNewPoints = basePoints * pointsMultiplier
    const estimatedCost = estimatedNewPoints - basePoints

    // Estimate revenue impact (simple heuristic: +1% engagement = +0.5% revenue)
    const engagementBoost = params.bonusCategory ? 5 : (params.pointsPerEuroChange || 0) * 0.1
    const revenueImpact = baseRevenue * (engagementBoost / 100) * 0.5

    return {
      impactCa: Math.round(revenueImpact),
      clientsTouches: Math.round(accounts * 0.3),
      coutPoints: Math.round(estimatedCost),
      impactEngagement: engagementBoost,
      commentaire: `Cette configuration pourrait générer +${(revenueImpact / baseRevenue * 100).toFixed(1)}% de CA sur 30 jours, en touchant ~${Math.round(accounts * 0.3)} clients, pour un coût estimé de ${Math.round(estimatedCost).toLocaleString('fr-FR')} points.`,
    }
  } catch (error) {
    console.error('Error simulating program change:', error)
    return {
      impactCa: 0,
      clientsTouches: 0,
      coutPoints: 0,
      impactEngagement: 0,
      commentaire: 'Erreur lors de la simulation',
    }
  }
}
