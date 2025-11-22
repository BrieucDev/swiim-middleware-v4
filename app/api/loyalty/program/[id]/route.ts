import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { pointsPerEuro, conversionRate, conversionValue, pointsExpiryDays } = body

    const program = await prisma.loyaltyProgram.update({
      where: { id: params.id },
      data: {
        pointsPerEuro,
        conversionRate,
        conversionValue,
        pointsExpiryDays: pointsExpiryDays || null,
      },
    })

    return NextResponse.json(program)
  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

