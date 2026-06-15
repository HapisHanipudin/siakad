import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();
config({ path: ".dev.vars", override: false });

if (!process.env.NEON_DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL belum di-set. Isi di .env atau .dev.vars");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
