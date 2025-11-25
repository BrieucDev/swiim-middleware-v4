export interface CohortData {
  cohort: string // e.g., "Semaine 45"
  newCustomers: number
  revenueWeek0: number
  revenueWeek4: number
  revenueWeek8: number
  retentionWeek4: number // %
  retentionWeek8: number // %
}

/**
 * Get cohort analysis data (deterministic demo data)
 */
export function getCohortData(): CohortData[] {
  // Generate deterministic demo data for last 12 weeks
  const cohorts: CohortData[] = []
  const base = 100

  for (let week = 0; week < 12; week++) {
    const weekNum = 45 - (11 - week) // Starting from week 45, going back
    const seed = week * 7 + base

    const newCustomers = 50 + (seed % 30)
    const revenueWeek0 = newCustomers * (35 + (seed % 10))
    const revenueWeek4 = revenueWeek0 * (0.65 + (seed % 10) * 0.02) // 65-75% retention
    const revenueWeek8 = revenueWeek0 * (0.45 + (seed % 10) * 0.02) // 45-55% retention

    const retentionWeek4 = 65 + (seed % 10)
    const retentionWeek8 = 45 + (seed % 10)

    cohorts.push({
      cohort: `Semaine ${weekNum}`,
      newCustomers,
      revenueWeek0: Math.round(revenueWeek0),
      revenueWeek4: Math.round(revenueWeek4),
      revenueWeek8: Math.round(revenueWeek8),
      retentionWeek4,
      retentionWeek8,
    })
  }

  return cohorts.reverse() // Most recent first
}

