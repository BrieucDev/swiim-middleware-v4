'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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
