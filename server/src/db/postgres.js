import { PrismaClient } from '@prisma/client';

// Skip Prisma in development if no PostgreSQL URL is configured
let prisma = null;

if (process.env.POSTGRES_URL && process.env.POSTGRES_URL !== 'postgresql://postgres:password@localhost:5432/smartrent_products') {
  prisma = new PrismaClient();

  // optional: clean shutdown
  process.on('beforeExit', async () => {
    await prisma?.$disconnect();
  });
}

export { prisma };
