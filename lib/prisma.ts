import { PrismaClient } from '@prisma/client'

function normalizeDatabaseUrl(rawUrl?: string) {
  if (!rawUrl) {
    throw new Error('DATABASE_URL environment variable is not configured.');
  }
  if (!rawUrl.startsWith('postgresql://') && !rawUrl.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must start with postgresql:// or postgres://');
  }
  if (!rawUrl.includes('sslmode=')) {
    const separator = rawUrl.includes('?') ? '&' : '?';
    rawUrl = `${rawUrl}${separator}sslmode=require`;
  }
  return rawUrl;
}

const DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);
process.env.DATABASE_URL = DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration optimized for serverless environments
const prismaClientOptions: {
  log?: Array<'query' | 'info' | 'warn' | 'error'>
} = {
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  // Ensure Prisma uses the normalized URL
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} else {
  // In production, ensure we reuse the same instance
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma
  }
}

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

