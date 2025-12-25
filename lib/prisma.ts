import { PrismaClient } from '@prisma/client';
import { logger } from './services/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Enhanced Prisma Client with query logging
 * Logs slow queries for performance monitoring
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? [
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
          { level: 'query', emit: 'event' },
        ]
      : [
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ],
  });

// Log slow queries
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: { query: string; duration: number; params: string }) => {
    if (e.duration > 1000) {
      logger.slowQuery(e.query, e.duration, {
        params: e.params,
      });
    }
  });

  prisma.$on('error' as never, (e: { message: string; target?: string }) => {
    logger.error('Prisma error', {
      message: e.message,
      target: e.target,
    });
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

