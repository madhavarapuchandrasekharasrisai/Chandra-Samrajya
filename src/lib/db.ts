import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

const globalForDrizzle = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
};

const connectionString =
  process.env.DATABASE_URL ??
  process.env.DIRECT_URL ??
  'postgresql://postgres.placeholder:placeholder@localhost:5432/postgres';

const postgresClient =
  globalForDrizzle.postgresClient ??
  postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.postgresClient = postgresClient;
}

export const db = drizzle(postgresClient, { schema });
export type DbClient = typeof db;
export * as schema from '../db/schema';