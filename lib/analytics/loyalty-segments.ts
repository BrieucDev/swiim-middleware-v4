import { prisma } from '@/lib/prisma'

export interface Segment {
  id: string
  name: string
  customerCount: number
  averageBasket: number
  averageFrequency: number
  revenue30d: number
  loyaltyRate: number
}

export async function getCustomerSegments(): Promise<Segment[]> {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get all customers with their receipts
    const customers = await prisma.customer.findMany({
      include: {
        receipts: {
          where: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
        loyaltyAccount: true,
      },
    })

    // Calculate metrics for each customer
    const customerMetrics = customers.map(customer => {
      const receipts = customer.receipts
      const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0)
      const averageBasket = receipts.length > 0 ? totalRevenue / receipts.length : 0
      const isLoyal = customer.loyaltyAccount !== null

      return {
        customer,
        receiptCount: receipts.length,
        totalRevenue,
        averageBasket,
        isLoyal,
      }
    })

    // Define segments
    const segments: Segment[] = []

    // 1. Petits paniers récurrents
    const smallRecurring = customerMetrics.filter(
      m => m.averageBasket < 50 && m.receiptCount >= 3
    )
    segments.push({
      id: 'small-recurring',
      name: 'Petits paniers récurrents',
      customerCount: smallRecurring.length,
      averageBasket: smallRecurring.length > 0
        ? smallRecurring.reduce((sum, m) => sum + m.averageBasket, 0) / smallRecurring.length
        : 0,
      averageFrequency: smallRecurring.length > 0
        ? smallRecurring.reduce((sum, m) => sum + m.receiptCount, 0) / smallRecurring.length
        : 0,
      revenue30d: smallRecurring.reduce((sum, m) => sum + m.totalRevenue, 0),
      loyaltyRate: smallRecurring.length > 0
        ? (smallRecurring.filter(m => m.isLoyal).length / smallRecurring.length) * 100
        : 0,
    })

    // 2. Gros paniers occasionnels
    const bigOccasional = customerMetrics.filter(
      m => m.averageBasket >= 100 && m.receiptCount < 3
    )
    segments.push({
      id: 'big-occasional',
      name: 'Gros paniers occasionnels',
      customerCount: bigOccasional.length,
      averageBasket: bigOccasional.length > 0
        ? bigOccasional.reduce((sum, m) => sum + m.averageBasket, 0) / bigOccasional.length
        : 0,
      averageFrequency: bigOccasional.length > 0
        ? bigOccasional.reduce((sum, m) => sum + m.receiptCount, 0) / bigOccasional.length
        : 0,
      revenue30d: bigOccasional.reduce((sum, m) => sum + m.totalRevenue, 0),
      loyaltyRate: bigOccasional.length > 0
        ? (bigOccasional.filter(m => m.isLoyal).length / bigOccasional.length) * 100
        : 0,
    })

    // 3. Clients inactifs 40j+
    const fortyDaysAgo = new Date()
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40)
    const inactive = await prisma.customer.findMany({
      where: {
        receipts: {
          none: {
            createdAt: { gte: fortyDaysAgo },
          },
        },
      },
      include: {
        receipts: true,
        loyaltyAccount: true,
      },
    })
    const inactiveMetrics = inactive.map(customer => {
      const receipts = customer.receipts
      const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0)
      return {
        customer,
        receiptCount: receipts.length,
        totalRevenue,
        averageBasket: receipts.length > 0 ? totalRevenue / receipts.length : 0,
        isLoyal: customer.loyaltyAccount !== null,
      }
    })
    segments.push({
      id: 'inactive-40d',
      name: 'Clients inactifs 40j+',
      customerCount: inactiveMetrics.length,
      averageBasket: inactiveMetrics.length > 0
        ? inactiveMetrics.reduce((sum, m) => sum + m.averageBasket, 0) / inactiveMetrics.length
        : 0,
      averageFrequency: inactiveMetrics.length > 0
        ? inactiveMetrics.reduce((sum, m) => sum + m.receiptCount, 0) / inactiveMetrics.length
        : 0,
      revenue30d: 0,
      loyaltyRate: inactiveMetrics.length > 0
        ? (inactiveMetrics.filter(m => m.isLoyal).length / inactiveMetrics.length) * 100
        : 0,
    })

    // 4. Explorateurs multi-catégories
    const explorers = customerMetrics.filter(m => {
      if (m.receiptCount === 0) return false
      // This would require checking line items categories - simplified for now
      return m.receiptCount >= 2
    })
    segments.push({
      id: 'explorers',
      name: 'Explorateurs multi-catégories',
      customerCount: explorers.length,
      averageBasket: explorers.length > 0
        ? explorers.reduce((sum, m) => sum + m.averageBasket, 0) / explorers.length
        : 0,
      averageFrequency: explorers.length > 0
        ? explorers.reduce((sum, m) => sum + m.receiptCount, 0) / explorers.length
        : 0,
      revenue30d: explorers.reduce((sum, m) => sum + m.totalRevenue, 0),
      loyaltyRate: explorers.length > 0
        ? (explorers.filter(m => m.isLoyal).length / explorers.length) * 100
        : 0,
    })

    // 5. Nouveaux clients
    const newCustomers = customerMetrics.filter(m => m.receiptCount <= 1)
    segments.push({
      id: 'new-customers',
      name: 'Nouveaux clients',
      customerCount: newCustomers.length,
      averageBasket: newCustomers.length > 0
        ? newCustomers.reduce((sum, m) => sum + m.averageBasket, 0) / newCustomers.length
        : 0,
      averageFrequency: newCustomers.length > 0
        ? newCustomers.reduce((sum, m) => sum + m.receiptCount, 0) / newCustomers.length
        : 0,
      revenue30d: newCustomers.reduce((sum, m) => sum + m.totalRevenue, 0),
      loyaltyRate: newCustomers.length > 0
        ? (newCustomers.filter(m => m.isLoyal).length / newCustomers.length) * 100
        : 0,
    })

    // 6. Gros utilisateurs de points
    const bigPointUsers = await prisma.loyaltyAccount.findMany({
      where: {
        points: { gt: 500 },
      },
      include: {
        customer: {
          include: {
            receipts: {
              where: {
                createdAt: { gte: thirtyDaysAgo },
              },
            },
          },
        },
      },
    })
    const bigPointMetrics = bigPointUsers.map(account => {
      const receipts = account.customer.receipts
      const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0)
      return {
        receiptCount: receipts.length,
        totalRevenue,
        averageBasket: receipts.length > 0 ? totalRevenue / receipts.length : 0,
        isLoyal: true,
      }
    })
    segments.push({
      id: 'big-point-users',
      name: 'Gros utilisateurs de points',
      customerCount: bigPointMetrics.length,
      averageBasket: bigPointMetrics.length > 0
        ? bigPointMetrics.reduce((sum, m) => sum + m.averageBasket, 0) / bigPointMetrics.length
        : 0,
      averageFrequency: bigPointMetrics.length > 0
        ? bigPointMetrics.reduce((sum, m) => sum + m.receiptCount, 0) / bigPointMetrics.length
        : 0,
      revenue30d: bigPointMetrics.reduce((sum, m) => sum + m.totalRevenue, 0),
      loyaltyRate: 100,
    })

    return segments
  } catch (error) {
    console.error('Error calculating customer segments:', error)
    return []
  }
}



