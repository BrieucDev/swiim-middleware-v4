import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function getLoyaltyStats() {
  try {
    const program = await prisma.loyaltyProgram.findFirst({
      include: {
        accounts: {
          include: {
            tier: true,
            customer: true,
          },
        },
        tiers: true,
        campaigns: true,
      },
    })

    if (!program) {
      return null
    }

    const accounts = program.accounts
    const totalPoints = accounts.reduce((sum, a) => sum + a.points, 0)
    const totalSpend = accounts.reduce((sum, a) => sum + a.totalSpend, 0)

    // Points used (estimated: points decreased over time)
    // In a real system, you'd track this. For now, estimate based on activity
    const pointsUsed = Math.floor(totalPoints * 0.3) // Rough estimate

    // Engagement: accounts with activity in last 60 days
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const engagedAccounts = accounts.filter(
      a => a.lastActivity && a.lastActivity >= sixtyDaysAgo
    ).length
    const engagementRate = accounts.length > 0 ? (engagedAccounts / accounts.length) * 100 : 0

    // Revenue from loyal customers (simplified: sum of their receipts)
    const customerIds = accounts.map(a => a.customerId)
    const receipts = await prisma.receipt.findMany({
      where: {
        customerId: { in: customerIds },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })
    const loyaltyRevenue = receipts.reduce((sum, r) => sum.plus(r.totalAmount), new Decimal(0))

    // Tier distribution
    const tierDistribution = program.tiers.map(tier => ({
      tier: tier.name,
      count: accounts.filter(a => a.tierId === tier.id).length,
      minSpend: tier.minSpend,
      maxSpend: tier.maxSpend,
    }))

    return {
      program,
      totalMembers: accounts.length,
      totalPoints,
      pointsUsed,
      pointsInCirculation: totalPoints - pointsUsed,
      engagementRate,
      loyaltyRevenue: loyaltyRevenue.toNumber(),
      tierDistribution,
    }
  } catch (error) {
    console.error('Error fetching loyalty stats:', error)
    return null
  }
}

export async function simulateLoyaltyImpact(params: {
  pointsPerEuroIncrease?: number
  bonusCategory?: { category: string; bonus: number }
}) {
  try {
    const stats = await getLoyaltyStats()
    if (!stats) {
      return null
    }

    // Get all loyalty accounts with receipts
    const accounts = stats.program.accounts
    const customerIds = accounts.map(a => a.customerId)

    const receipts = await prisma.receipt.findMany({
      where: {
        customerId: { in: customerIds },
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        lineItems: true,
      },
    })

    let additionalRevenue = new Decimal(0)
    let additionalPoints = 0
    let customersAffected = 0

    if (params.pointsPerEuroIncrease) {
      // Simulate: more points = more engagement = more spending
      const multiplier = 1 + params.pointsPerEuroIncrease / 100
      const totalReceiptAmount = receipts.reduce((sum, r) => sum.plus(r.totalAmount), new Decimal(0))
      const avgReceipt = receipts.length > 0
        ? totalReceiptAmount.div(receipts.length)
        : new Decimal(0)

      const estimatedExtraSpend = avgReceipt.mul(0.1).mul(multiplier) // 10% increase in spend
      additionalRevenue = estimatedExtraSpend.mul(accounts.length).mul(0.3) // 30% adoption

      additionalPoints = additionalRevenue.toNumber() * (stats.program.pointsPerEuro * (1 + params.pointsPerEuroIncrease / 100))
      customersAffected = Math.floor(accounts.length * 0.3)
    }

    if (params.bonusCategory) {
      // Count receipts with items in that category
      const categoryReceipts = receipts.filter(r =>
        r.lineItems.some(li => li.category === params.bonusCategory!.category)
      )
      const categoryRevenue = categoryReceipts.reduce((sum, r) => sum.plus(r.totalAmount), new Decimal(0))
      const bonusMultiplier = params.bonusCategory.bonus / 100

      additionalRevenue = categoryRevenue.mul(bonusMultiplier).mul(0.2) // 20% boost
      additionalPoints = additionalRevenue.toNumber() * stats.program.pointsPerEuro * (params.bonusCategory.bonus / 100)
      customersAffected = new Set(categoryReceipts.map(r => r.customerId)).size
    }

    const additionalEngagement = customersAffected / accounts.length * 10 // +10% engagement

    return {
      additionalRevenue: additionalRevenue.toNumber(),
      customersAffected,
      additionalPoints: Math.floor(additionalPoints),
      engagementImpact: additionalEngagement,
    }
  } catch (error) {
    console.error('Error simulating loyalty impact:', error)
    return null
  }
}

