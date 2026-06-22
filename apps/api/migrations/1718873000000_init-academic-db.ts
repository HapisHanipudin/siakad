import { MigrationBuilder } from "node-pg-migrate";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = (pgm: MigrationBuilder): void => {
  const sqlPath = path.resolve(__dirname, "../../../query/ddl_postgres.sql");
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`File SQL tidak ditemukan di path: ${sqlPath}`);
  }
  const sql = fs.readFileSync(sqlPath, "utf-8");
  pgm.sql(sql);
};

export const down = (pgm: MigrationBuilder): void => {
  pgm.sql(`
    DROP TABLE IF EXISTS log_aktivitas CASCADE;
    DROP TABLE IF EXISTS pembayaran CASCADE;
    DROP TABLE IF EXISTS tagihan CASCADE;
    DROP TABLE IF EXISTS presensi CASCADE;
    DROP TABLE IF EXISTS pertemuan CASCADE;
    DROP TABLE IF EXISTS detail_krs CASCADE;
    DROP TABLE IF EXISTS krs CASCADE;
    DROP TABLE IF EXISTS kalender_akademik CASCADE;
    DROP TABLE IF EXISTS pengumuman CASCADE;
    DROP TABLE IF EXISTS kelas CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS mahasiswa CASCADE;
    DROP TABLE IF EXISTS kelompok CASCADE;
    DROP TABLE IF EXISTS dosen CASCADE;
    DROP TABLE IF EXISTS kurikulum_mata_kuliah CASCADE;
    DROP TABLE IF EXISTS kurikulum CASCADE;
    DROP TABLE IF EXISTS rombel CASCADE;
    DROP TABLE IF EXISTS prasyarat_mata_kuliah CASCADE;
    DROP TABLE IF EXISTS mata_kuliah CASCADE;
    DROP TABLE IF EXISTS ruangan CASCADE;
    DROP TABLE IF EXISTS gedung CASCADE;
    DROP TABLE IF EXISTS program_studi CASCADE;
    DROP TABLE IF EXISTS tahun_ajaran CASCADE;
    DROP TABLE IF EXISTS fakultas CASCADE;
  `);
};
