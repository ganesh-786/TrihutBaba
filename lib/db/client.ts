import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
  drizzleDb?: PostgresJsDatabase<typeof schema>;
};

function makeDb(): PostgresJsDatabase<typeof schema> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is required at runtime"
    );
  }
  if (!globalForDb.pgClient) {
    globalForDb.pgClient = postgres(connectionString, { max: 1, prepare: false });
  }
  return drizzle(globalForDb.pgClient, { schema });
}

/**
 * Lazy proxy: creates the actual Drizzle client only on first method access,
 * not at module load. This lets `next build` evaluate routes without requiring
 * a live DATABASE_URL.
 */
export const db: PostgresJsDatabase<typeof schema> = new Proxy(
  {} as PostgresJsDatabase<typeof schema>,
  {
    get(_target, prop) {
      if (!globalForDb.drizzleDb) globalForDb.drizzleDb = makeDb();
      const value = (
        globalForDb.drizzleDb as unknown as Record<string | symbol, unknown>
      )[prop];
      return typeof value === "function"
        ? (value as (...args: unknown[]) => unknown).bind(globalForDb.drizzleDb)
        : value;
    },
  }
);

export type Database = typeof db;
