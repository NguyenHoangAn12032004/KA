import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to preserve the value across module reloads
  const globalWithPrisma = global as typeof globalThis & {
    prisma?: PrismaClient;
  };

  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = globalWithPrisma.prisma;
}

// Handle connection events
prisma.$connect()
  .then(() => {
    logger.info('📊 Connected to PostgreSQL database');
  })
  .catch((error) => {
    logger.error('❌ Failed to connect to database:', error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('📊 Disconnected from database');
});

export { prisma };
