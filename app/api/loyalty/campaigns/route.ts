import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { programId, name, description, targetSegment, channel, offerType, offerPayload, status } = body

    if (!programId || !name || !targetSegment || !channel || !offerType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate estimated impact (simplified heuristic)
    const accounts = await prisma.loyaltyAccount.findMany({
      where: { programId },
    })
    const estimatedClients = Math.floor(accounts.length * 0.3) // 30% of members
    const estimatedCA = 1500 // Base estimate

    const campaign = await prisma.loyaltyCampaign.create({
      data: {
        programId,
        name,
        description: description || null,
        targetSegment,
        channel,
        offerType,
        offerPayload: offerPayload || {},
        status: status || 'BROUILLON',
        estimatedImpact: {
          clients: estimatedClients,
          caEstime: estimatedCA,
        },
        stats: {
          sent: 0,
          opened: 0,
          clicked: 0,
          conversions: 0,
          extraRevenue: 0,
        },
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

