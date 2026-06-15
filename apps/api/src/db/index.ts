import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { Env } from "../env";
import * as schema from "./schema";

export function createDb(env: Env) {
  const connectionString =
    env.HYPERDRIVE?.connectionString ?? env.NEON_DATABASE_URL;
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export { schema };
