import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Simple query to check connection
        // We'll try to count stores as it's a core table
        const storeCount = await prisma.store.count()

        return NextResponse.json({
            ok: true,
            message: 'Database connection successful',
            storeCount
        }, { status: 200 })
    } catch (error) {
        console.error('Database health check failed:', error)
        return NextResponse.json({
            ok: false,
            message: 'Database connection failed',
            error: String(error)
        }, { status: 500 })
    }
}
