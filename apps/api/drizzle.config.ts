import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();
config({ path: ".dev.vars", override: false });

const dbUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL belum di-set. Isi di .env atau .dev.vars");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  strict: true,
  verbose: true,
});
