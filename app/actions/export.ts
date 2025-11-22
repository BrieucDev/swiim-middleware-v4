'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function exportAnalyticsCSV() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    const userId = session.user.id;

    try {
        // Fetch receipts for the user's stores
        const receipts = await prisma.receipt.findMany({
            where: {
                store: {
                    userId: userId,
                },
            },
            include: {
                store: true,
                customer: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Convert to CSV
        const header = ['Date', 'Store', 'Amount', 'Currency', 'Status', 'Customer Email'].join(',');
        const rows = receipts.map(r => {
            const date = r.createdAt.toISOString();
            const store = r.store.name.replace(/,/g, ''); // Escape commas
            const amount = r.totalAmount.toString();
            const currency = r.currency;
            const status = r.status;
            const customer = r.customer?.email || 'Anonymous';
            return [date, store, amount, currency, status, customer].join(',');
        });

        const csv = [header, ...rows].join('\n');
        return { csv };
    } catch (error) {
        console.error('Export failed:', error);
        return { error: 'Failed to export data' };
    }
}
