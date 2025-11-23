

export const stats = {
  totalReceipts: 12543,
  totalRevenue: 452310.50,
  claimedRate: 68.5,
  activeCustomers: 8432,
  averageBasket: 36.06,
  averageFrequency: 2.4,
  identificationRate: 72.4,
  loyaltyMembers: 5420,
  pointsInCirculation: 1250400,
  engagementRate: 45.2,
  loyaltyRevenue: 185000,
}

export const receiptsByDay = [
  { date: '15 Nov', count: 345, revenue: 12450 },
  { date: '16 Nov', count: 389, revenue: 14230 },
  { date: '17 Nov', count: 412, revenue: 15670 },
  { date: '18 Nov', count: 298, revenue: 10890 },
  { date: '19 Nov', count: 315, revenue: 11450 },
  { date: '20 Nov', count: 356, revenue: 13210 },
  { date: '21 Nov', count: 402, revenue: 14890 },
]

export const stores = [
  { id: '1', name: 'Paris Bastille', city: 'Paris', address: '4 Place de la Bastille, 75011 Paris' },
  { id: '2', name: 'Lyon Part-Dieu', city: 'Lyon', address: 'Centre Commercial Part-Dieu, 69003 Lyon' },
  { id: '3', name: 'Bordeaux Centre', city: 'Bordeaux', address: '15 Rue Sainte-Catherine, 33000 Bordeaux' },
  { id: '4', name: 'Nantes Commerce', city: 'Nantes', address: '2 Rue de la Marne, 44000 Nantes' },
]

export const terminals = [
  { id: '1', name: 'Caisse 1', identifier: 'POS-001', storeId: '1', status: 'ACTIF', lastSeen: new Date() },
  { id: '2', name: 'Caisse 2', identifier: 'POS-002', storeId: '1', status: 'ACTIF', lastSeen: new Date() },
  { id: '3', name: 'Caisse 1', identifier: 'POS-003', storeId: '2', status: 'ACTIF', lastSeen: new Date() },
  { id: '4', name: 'Caisse 1', identifier: 'POS-004', storeId: '3', status: 'INACTIF', lastSeen: new Date(Date.now() - 86400000) },
  { id: '5', name: 'Caisse 1', identifier: 'POS-005', storeId: '4', status: 'ACTIF', lastSeen: new Date() },
]

export const storePerformance = [
  { name: 'Paris Bastille', count: 4250, revenue: 154230, claimedRate: 72.5 },
  { name: 'Lyon Part-Dieu', count: 3890, revenue: 138450, claimedRate: 65.8 },
  { name: 'Bordeaux Centre', count: 2450, revenue: 89450, claimedRate: 69.2 },
  { name: 'Nantes Commerce', count: 1953, revenue: 70180, claimedRate: 66.5 },
]

export const segments = [
  { name: 'Champions', size: 450, avgBasket: 85.40, frequency: 7, revenue: 125000 },
  { name: 'Fidèles', size: 1250, avgBasket: 54.20, frequency: 14, revenue: 185000 },
  { name: 'Occasionnels', size: 3500, avgBasket: 32.50, frequency: 45, revenue: 95000 },
  { name: 'À risque', size: 850, avgBasket: 28.40, frequency: 0, revenue: 25000 },
]

export const categoryAnalytics = [
  { name: 'Fruits & Légumes', revenue: 85400, avgBasket: 12.50, tickets: 6800, daysBetween: 4, newRate: 12.5, loyaltyRate: 85.4 },
  { name: 'Épicerie', revenue: 124500, avgBasket: 24.80, tickets: 5020, daysBetween: 10, newRate: 15.2, loyaltyRate: 78.5 },
  { name: 'Frais', revenue: 98200, avgBasket: 18.40, tickets: 5340, daysBetween: 7, newRate: 14.8, loyaltyRate: 81.2 },
  { name: 'Boissons', revenue: 45600, avgBasket: 15.20, tickets: 3000, daysBetween: 12, newRate: 18.5, loyaltyRate: 72.4 },
  { name: 'Hygiène', revenue: 32400, avgBasket: 28.50, tickets: 1140, daysBetween: 25, newRate: 22.4, loyaltyRate: 65.8 },
]

export const customers = [
  { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@email.com', tier: 'Or', receipts: 45, lastVisit: new Date('2023-11-20'), totalSpend: 3450.50, points: 520 },
  { id: '2', firstName: 'Marie', lastName: 'Martin', email: 'marie.martin@email.com', tier: 'Argent', receipts: 28, lastVisit: new Date('2023-11-18'), totalSpend: 1250.20, points: 340 },
  { id: '3', firstName: 'Pierre', lastName: 'Durand', email: 'pierre.durand@email.com', tier: 'Bronze', receipts: 12, lastVisit: new Date('2023-11-15'), totalSpend: 450.80, points: 120 },
  { id: '4', firstName: 'Sophie', lastName: 'Lefebvre', email: 'sophie.lefebvre@email.com', tier: null, receipts: 3, lastVisit: new Date('2023-11-10'), totalSpend: 85.40, points: 45 },
  { id: '5', firstName: 'Lucas', lastName: 'Moreau', email: 'lucas.moreau@email.com', tier: 'Argent', receipts: 32, lastVisit: new Date('2023-11-21'), totalSpend: 1850.60, points: 410 },
]

export const loyaltyProgram = {
  name: 'Biocoop Fidélité',
  pointsPerEuro: 1,
  conversionRate: 500,
  conversionValue: 5,
  bonusCategories: { 'Fruits & Légumes': 2, 'Vrac': 2 },
  pointsExpiryDays: 365,
}

export const loyaltyTiers = [
  { name: 'Bronze', minSpend: 0, maxSpend: 150, members: 2500, benefits: ['1€ = 1 point'] },
  { name: 'Argent', minSpend: 150, maxSpend: 500, members: 1800, benefits: ['1€ = 1.2 points', 'Offres exclusives'] },
  { name: 'Or', minSpend: 500, maxSpend: null, members: 1120, benefits: ['1€ = 1.5 points', 'Livraison offerte', 'Cadeau anniversaire'] },
]

export const campaigns = [
  { name: 'Rentrée Bio', segment: 'Tous', channel: 'EMAIL', status: 'TERMINEE', openRate: 45.2, conversion: 12.5, revenue: 15400 },
  { name: 'Relance Inactifs', segment: 'À risque', channel: 'PUSH', status: 'PROGRAMMEE', openRate: 0, conversion: 0, revenue: 0 },
  { name: 'Noël Gourmand', segment: 'Fidèles', channel: 'EMAIL', status: 'BROUILLON', openRate: 0, conversion: 0, revenue: 0 },
]

export const generateReceipts = () => {
  return Array.from({ length: 20 }).map((_, i) => {
    const items = Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map(() => ({
      name: `Produit Bio ${Math.floor(Math.random() * 100)}`,
      category: ['Fruits & Légumes', 'Épicerie', 'Frais', 'Boissons'][Math.floor(Math.random() * 4)],
      quantity: Math.floor(Math.random() * 3) + 1,
      price: Math.random() * 10 + 2,
    }))

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const hasCustomer = Math.random() > 0.3
    const customerId = hasCustomer ? (Math.floor(Math.random() * 5) + 1).toString() : null

    return {
      id: `REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      storeId: (i % 4 + 1).toString(),
      store: stores[i % 4].name,
      pos: `POS-00${(i % 5) + 1}`,
      customerId,
      customer: hasCustomer ? `Client ${customerId}` : null,
      customerEmail: hasCustomer ? `client${customerId}@email.com` : null,
      totalAmount,
      status: Math.random() > 0.9 ? 'ANNULE' : Math.random() > 0.8 ? 'REMBOURSE' : Math.random() > 0.7 ? 'RECLAME' : 'EMIS',
      date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
      lineItems: items,
    }
  })
}
