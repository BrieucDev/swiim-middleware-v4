import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = ['Livres', 'Hi-Tech', 'Gaming', 'Vinyles', 'Accessoires', 'Musique', 'Cinéma']

const firstNames = [
  'Jean', 'Marie', 'Pierre', 'Sophie', 'Antoine', 'Camille', 'Lucas', 'Emma',
  'Thomas', 'Julie', 'Nicolas', 'Sarah', 'Alexandre', 'Laura', 'Maxime', 'Pauline',
  'Vincent', 'Claire', 'Julien', 'Marion', 'David', 'Amélie', 'Olivier', 'Lucie'
]

const lastNames = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand',
  'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David',
  'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Lefevre'
]

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.receiptLineItem.deleteMany()
  await prisma.receipt.deleteMany()
  await prisma.loyaltyCampaign.deleteMany()
  await prisma.loyaltyAccount.deleteMany()
  await prisma.loyaltyTier.deleteMany()
  await prisma.loyaltyProgram.deleteMany()
  await prisma.posTerminal.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.store.deleteMany()

  // Create loyalty program
  const program = await prisma.loyaltyProgram.create({
    data: {
      name: 'Club FNAC x Swiim',
      description: 'Programme de fidélité exclusif FNAC',
      pointsPerEuro: 1,
      conversionRate: 100,
      conversionValue: 5,
      bonusCategories: {
        'Livres': 2,
        'Vinyles': 2,
        'Cinéma': 1.5,
      },
      pointsExpiryDays: 540, // 18 months
    },
  })

  // Create loyalty tiers
  const bronze = await prisma.loyaltyTier.create({
    data: {
      programId: program.id,
      name: 'Bronze',
      minSpend: 0,
      maxSpend: 200,
      sortOrder: 1,
      benefits: {
        points: '1€ = 1 point',
        conversion: '100 points = 5€',
      },
    },
  })

  const argent = await prisma.loyaltyTier.create({
    data: {
      programId: program.id,
      name: 'Argent',
      minSpend: 200,
      maxSpend: 500,
      sortOrder: 2,
      benefits: {
        points: '1€ = 1 point',
        conversion: '100 points = 5€',
        bonus: 'Bonus +10% sur certaines catégories',
      },
    },
  })

  const or = await prisma.loyaltyTier.create({
    data: {
      programId: program.id,
      name: 'Or',
      minSpend: 500,
      maxSpend: null,
      sortOrder: 3,
      benefits: {
        points: '1€ = 1 point',
        conversion: '100 points = 5€',
        bonus: 'Bonus +20% sur certaines catégories',
        avantage: 'Invitations événements exclusifs',
      },
    },
  })

  // Create stores
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        name: 'FNAC Bastille',
        city: 'Paris',
        address: '4 Place de la Bastille, 75011 Paris',
      },
    }),
    prisma.store.create({
      data: {
        name: 'FNAC La Défense',
        city: 'Puteaux',
        address: 'CNIT, La Défense, 92000 Puteaux',
      },
    }),
    prisma.store.create({
      data: {
        name: 'FNAC Ternes',
        city: 'Paris',
        address: '26-30 Avenue des Ternes, 75017 Paris',
      },
    }),
    prisma.store.create({
      data: {
        name: 'FNAC Lyon Part-Dieu',
        city: 'Lyon',
        address: '85 Rue de la République, 69002 Lyon',
      },
    }),
  ])

  // Create POS terminals (2-3 per store)
  const terminals: any[] = []
  for (const store of stores) {
    const count = randomInt(2, 3)
    for (let i = 1; i <= count; i++) {
      const terminal = await prisma.posTerminal.create({
        data: {
          name: `TPE ${store.name} - ${i}`,
          identifier: `TPE-${store.name.replace(/\s+/g, '-').toUpperCase()}-${i}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          storeId: store.id,
          status: randomChoice(['ACTIF', 'ACTIF', 'ACTIF', 'INACTIF']), // Mostly active
          lastSeenAt: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
        },
      })
      terminals.push(terminal)
    }
  }

  // Create customers
  const customers: any[] = []
  for (let i = 0; i < 28; i++) {
    const firstName = randomChoice(firstNames)
    const lastName = randomChoice(lastNames)
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@swiim.client`,
      },
    })
    customers.push(customer)
  }

  // Create loyalty accounts (20 customers)
  const loyaltyAccounts: any[] = []
  for (let i = 0; i < 20; i++) {
    const customer = customers[i]
    let tier = bronze
    const totalSpend = randomFloat(50, 800)
    if (totalSpend >= 500) tier = or
    else if (totalSpend >= 200) tier = argent

    const account = await prisma.loyaltyAccount.create({
      data: {
        customerId: customer.id,
        programId: program.id,
        tierId: tier.id,
        points: randomInt(0, Math.floor(totalSpend * 1.5)),
        totalSpend,
        lastActivity: randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date()),
      },
    })
    loyaltyAccounts.push(account)
  }

  // Create receipts (70 receipts over last 45 days)
  const now = new Date()
  const startDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)

  for (let i = 0; i < 75; i++) {
    const store = randomChoice(stores)
    const terminal = randomChoice(terminals.filter(t => t.storeId === store.id))
    const customer = Math.random() < 0.6 ? randomChoice(customers) : null
    const status = randomChoice(['EMIS', 'EMIS', 'EMIS', 'RECLAME', 'RECLAME', 'REMBOURSE', 'ANNULE'])

    const receiptDate = randomDate(startDate, now)
    const numItems = randomInt(3, 6)
    const lineItems: any[] = []

    let subtotal = 0
    for (let j = 0; j < numItems; j++) {
      const quantity = randomInt(1, 3)
      const unitPrice = randomFloat(10, 150)
      lineItems.push({
        category: randomChoice(categories),
        productName: `${randomChoice(['Produit', 'Article', 'Item'])} ${randomInt(1, 999)}`,
        quantity,
        unitPrice,
      })
      subtotal += quantity * unitPrice
    }

    const receipt = await prisma.receipt.create({
      data: {
        posId: terminal.id,
        storeId: store.id,
        customerId: customer?.id,
        status,
        totalAmount: subtotal,
        currency: 'EUR',
        createdAt: receiptDate,
        updatedAt: receiptDate,
        lineItems: {
          create: lineItems.map(item => ({
            category: item.category,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    })

    // Update loyalty account if customer exists
    if (customer && status === 'RECLAME') {
      const account = loyaltyAccounts.find(a => a.customerId === customer.id)
      if (account) {
        const pointsEarned = Math.floor(subtotal * (account.tierId === or.id ? 1.2 : account.tierId === argent.id ? 1.1 : 1))
        await prisma.loyaltyAccount.update({
          where: { id: account.id },
          data: {
            points: { increment: pointsEarned },
            totalSpend: { increment: subtotal },
            lastActivity: receiptDate,
          },
        })
      }
    }
  }

  // Create campaigns
  const campaigns = [
    {
      name: 'Relance Inactifs 40j+',
      description: 'Offre spéciale pour relancer les clients inactifs depuis plus de 40 jours',
      targetSegment: 'INACTIFS_40J',
      channel: 'EMAIL',
      offerType: 'BONUS_POINTS',
      offerPayload: { bonusPoints: 50 },
      status: 'TERMINEE',
      estimatedImpact: { clients: 8, caEstime: 1200 },
      stats: { sent: 8, opened: 5, clicked: 3, conversions: 2, extraRevenue: 450 },
    },
    {
      name: 'Bonus Gros Paniers',
      description: 'Double points pour les paniers supérieurs à 100€',
      targetSegment: 'GROS_PANIERS',
      channel: 'PUSH',
      offerType: 'BONUS_POINTS',
      offerPayload: { multiplier: 2, minAmount: 100 },
      status: 'PROGRAMMEE',
      estimatedImpact: { clients: 15, caEstime: 2500 },
      stats: { sent: 0, opened: 0, clicked: 0, conversions: 0, extraRevenue: 0 },
    },
    {
      name: 'Promo Livres',
      description: '20% de bonus points sur les livres',
      targetSegment: 'EXPLORATEURS',
      channel: 'INAPP',
      offerType: 'BONUS_POINTS',
      offerPayload: { category: 'Livres', bonus: 20 },
      status: 'TERMINEE',
      estimatedImpact: { clients: 12, caEstime: 1800 },
      stats: { sent: 12, opened: 9, clicked: 6, conversions: 4, extraRevenue: 680 },
    },
    {
      name: 'Conversion Points',
      description: 'Offre limitée : 80 points = 5€ au lieu de 100',
      targetSegment: 'POINTS_ELEVES',
      channel: 'EMAIL',
      offerType: 'REMISE',
      offerPayload: { discountRate: 80 },
      status: 'BROUILLON',
      estimatedImpact: { clients: 10, caEstime: 1500 },
      stats: { sent: 0, opened: 0, clicked: 0, conversions: 0, extraRevenue: 0 },
    },
  ]

  for (const campaignData of campaigns) {
    await prisma.loyaltyCampaign.create({
      data: {
        programId: program.id,
        ...campaignData,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

