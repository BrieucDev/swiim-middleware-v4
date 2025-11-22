'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const categories = ['Livres', 'Hi-Tech', 'Gaming', 'Vinyles', 'Accessoires', 'Musique', 'Cinéma'];
const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Antoine', 'Camille', 'Lucas', 'Emma'];
const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand'];

function randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export async function generateDemoData() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    const userId = session.user.id;

    try {
        // 1. Create a Store if none exists
        let store = await prisma.store.findFirst({ where: { userId } });
        if (!store) {
            store = await prisma.store.create({
                data: {
                    name: 'Magasin Démo',
                    city: 'Paris',
                    address: '123 Rue de la Démo',
                    userId,
                },
            });
        }

        // 2. Create POS Terminal
        const terminal = await prisma.posTerminal.create({
            data: {
                name: 'TPE Démo 1',
                identifier: `DEMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                storeId: store.id,
                status: 'ACTIF',
            },
        });

        // 3. Create Customers
        const customers = [];
        for (let i = 0; i < 10; i++) {
            const firstName = randomChoice(firstNames);
            const lastName = randomChoice(lastNames);
            const customer = await prisma.customer.create({
                data: {
                    firstName,
                    lastName,
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Math.random().toString(36).substring(2, 5)}@demo.com`,
                },
            });
            customers.push(customer);
        }

        // 4. Create Receipts
        const now = new Date();
        const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        for (let i = 0; i < 50; i++) {
            const customer = Math.random() < 0.7 ? randomChoice(customers) : null;
            const receiptDate = randomDate(startDate, now);
            const numItems = randomInt(1, 5);
            let subtotal = 0;
            const lineItems = [];

            for (let j = 0; j < numItems; j++) {
                const quantity = randomInt(1, 2);
                const unitPrice = randomFloat(10, 100);
                lineItems.push({
                    category: randomChoice(categories),
                    productName: `Produit Démo ${randomInt(1, 100)}`,
                    quantity,
                    unitPrice,
                });
                subtotal += quantity * unitPrice;
            }

            await prisma.receipt.create({
                data: {
                    posId: terminal.id,
                    storeId: store.id,
                    customerId: customer?.id,
                    status: 'EMIS',
                    totalAmount: subtotal,
                    currency: 'EUR',
                    createdAt: receiptDate,
                    lineItems: {
                        create: lineItems,
                    },
                },
            });
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Demo data generation failed:', error);
        return { error: 'Failed to generate demo data' };
    }
}
