import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Serverless: limitar pool a 1 conexión para evitar saturar PgBouncer
  // en cold starts concurrentes. Sin esto Prisma crea ~5 conexiones por instancia.
  const url = process.env.DATABASE_URL
  const needsLimit = url && !url.includes('connection_limit')
  return new PrismaClient({
    datasources: needsLimit ? { db: { url: `${url}&connection_limit=1` } } : undefined,
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
