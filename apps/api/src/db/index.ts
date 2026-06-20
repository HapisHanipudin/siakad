import pg from "pg";
import type { Env } from "../env";
import * as schema from "./schema";

export function createDb(env: Env) {
  const connectionString =
    env.HYPERDRIVE?.connectionString ??
    env.DATABASE_URL ??
    env.NEON_DATABASE_URL;

  if (!connectionString) {
    throw new Error("Database connection string tidak tersedia");
  }

  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  return client;
}

export { schema };

