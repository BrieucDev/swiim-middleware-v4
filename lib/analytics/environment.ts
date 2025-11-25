export interface EnvironmentalImpact {
  digitalTickets12Months: number
  paperSavedKg: number
  co2AvoidedKg: number
  treesEquivalent: number
  paperSavedByStore: Array<{ storeName: string; kg: number }>
  projection12Months: {
    scenario: string
    digitalRateIncrease: number
    additionalPaperSaved: number
    additionalCo2Avoided: number
  }
}

/**
 * Get environmental impact metrics (deterministic demo data)
 */
export function getEnvironmentalImpact(): EnvironmentalImpact {
  // Deterministic calculations based on realistic assumptions
  const digitalTickets12Months = 15234
  const paperPerTicket = 0.003 // kg per ticket (3g)
  const co2PerKgPaper = 0.8 // kg CO2 per kg of paper
  const treesPerKgPaper = 0.1 // trees per kg of paper saved

  const paperSavedKg = digitalTickets12Months * paperPerTicket
  const co2AvoidedKg = paperSavedKg * co2PerKgPaper
  const treesEquivalent = paperSavedKg * treesPerKgPaper

  const paperSavedByStore = [
    { storeName: 'Paris Bastille', kg: 12.75 },
    { storeName: 'Lyon Part-Dieu', kg: 11.67 },
    { storeName: 'Bordeaux Centre', kg: 7.35 },
    { storeName: 'Nantes Commerce', kg: 5.86 },
  ]

  const projection12Months = {
    scenario: 'Si le taux de tickets numériques passe à 95%',
    digitalRateIncrease: 10, // 10% increase
    additionalPaperSaved: paperSavedKg * 0.1,
    additionalCo2Avoided: co2AvoidedKg * 0.1,
  }

  return {
    digitalTickets12Months,
    paperSavedKg: Math.round(paperSavedKg * 100) / 100,
    co2AvoidedKg: Math.round(co2AvoidedKg * 100) / 100,
    treesEquivalent: Math.round(treesEquivalent * 100) / 100,
    paperSavedByStore,
    projection12Months: {
      ...projection12Months,
      additionalPaperSaved: Math.round(projection12Months.additionalPaperSaved * 100) / 100,
      additionalCo2Avoided: Math.round(projection12Months.additionalCo2Avoided * 100) / 100,
    },
  }
}

