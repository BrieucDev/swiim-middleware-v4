import { NextRequest, NextResponse } from 'next/server'
import { simulateLoyaltyImpact } from '@/lib/analytics/loyalty'

export async function POST(request: NextRequest) {
  try {
    const params = await request.json()
    const results = await simulateLoyaltyImpact(params)

    if (!results) {
      return NextResponse.json({ error: 'No program found' }, { status: 404 })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error simulating impact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

