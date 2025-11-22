import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, storeId } = await request.json()

    if (!name || !storeId) {
      return NextResponse.json({ error: 'Name and storeId are required' }, { status: 400 })
    }

    // Generate unique identifier
    const identifier = `TPE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const terminal = await prisma.posTerminal.create({
      data: {
        name,
        identifier,
        storeId,
        status: 'ACTIF',
        lastSeenAt: new Date(),
      },
    })

    return NextResponse.json(terminal, { status: 201 })
  } catch (error) {
    console.error('Error creating terminal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

