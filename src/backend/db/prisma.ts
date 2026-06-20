import { PrismaClient } from '@prisma/client';

function buildDatabaseUrl(): string {
  // Priorità 1: DATABASE_URL esplicita (locale o già composta)
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // Priorità 2: variabili PG* standard (Azure PostgreSQL Flexible Server)
  const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT = '5432' } = process.env;
  if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE) {
    return `postgresql://${PGUSER}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
  }

  throw new Error(
    'Database non configurato. Imposta DATABASE_URL oppure PGHOST, PGUSER, PGPASSWORD, PGDATABASE.'
  );
}

const prisma = new PrismaClient({
  datasources: { db: { url: buildDatabaseUrl() } },
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export default prisma;
