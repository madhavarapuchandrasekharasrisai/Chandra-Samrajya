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
  postgres(connectionString, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

// Always cache client on globalThis to reuse connections across warm serverless lambdas
globalForDrizzle.postgresClient = postgresClient;

export const db = drizzle(postgresClient, { schema });
export type DbClient = typeof db;
export * as schema from '../db/schema';
