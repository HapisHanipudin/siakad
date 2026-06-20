import pg from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables dynamically based on file locations
const devVarsPath = path.resolve(__dirname, "../../.dev.vars");
dotenv.config(); // Load process .env
if (fs.existsSync(devVarsPath)) {
  dotenv.config({ path: devVarsPath }); // Load .dev.vars (wrangler settings)
}

async function main() {
  const connectionString =
    process.env.DATABASE_URL ??
    process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    console.error("❌ Error: DATABASE_URL atau NEON_DATABASE_URL tidak ditemukan!");
    process.exit(1);
  }

  console.log("🔌 Menghubungkan ke database...");
  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  await client.connect();
  console.log("✅ Koneksi database berhasil!");

  try {
    // Resolve path ke file query/ddl_postgres.sql
    const sqlPath = path.resolve(__dirname, "../../../../query/ddl_postgres.sql");
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`File SQL tidak ditemukan di path: ${sqlPath}`);
    }

    console.log(`📖 Membaca file SQL dari: ${sqlPath}...`);
    const sql = fs.readFileSync(sqlPath, "utf-8");

    console.log("⚙️ Menjalankan migrasi schema dan seeding data dummy...");
    // Run the DDL/DML multi-query string
    await client.query(sql);

    console.log("🎉 Migrasi dan seeding selesai dengan sukses!");
  } catch (error) {
    console.error("❌ Gagal menjalankan migrasi:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
