import { MigrationBuilder } from 'node-pg-migrate';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Load and execute procedures
  const procPath = path.resolve(__dirname, "../../../query/task04_procedure_udf_cursor.sql");
  const procSql = fs.readFileSync(procPath, "utf-8");
  pgm.sql(procSql);

  // Load and execute triggers
  const trigPath = path.resolve(__dirname, "../../../query/triggers_final.sql");
  const trigSql = fs.readFileSync(trigPath, "utf-8");
  pgm.sql(trigSql);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Drop triggers
  pgm.sql(`
    DROP TRIGGER IF EXISTS trg_hitung_nilai ON detail_krs CASCADE;
    DROP TRIGGER IF EXISTS trg_cek_prasyarat ON detail_krs CASCADE;
    DROP TRIGGER IF EXISTS trg_update_kuota_kelas ON detail_krs CASCADE;
    DROP TRIGGER IF EXISTS trg_validasi_kuota_ruangan ON kelas CASCADE;
    DROP TRIGGER IF EXISTS trg_update_status_tagihan ON pembayaran CASCADE;
    DROP TRIGGER IF EXISTS trg_cek_jadwal_dosen ON kelas CASCADE;

    DROP FUNCTION IF EXISTS fn_hitung_nilai() CASCADE;
    DROP FUNCTION IF EXISTS fn_cek_prasyarat() CASCADE;
    DROP FUNCTION IF EXISTS fn_update_kuota_kelas() CASCADE;
    DROP FUNCTION IF EXISTS fn_validasi_kuota_ruangan() CASCADE;
    DROP FUNCTION IF EXISTS fn_update_status_tagihan() CASCADE;
    DROP FUNCTION IF EXISTS fn_cek_jadwal_dosen() CASCADE;

    DROP PROCEDURE IF EXISTS sp_tambah_kelas_krs(INT, INT) CASCADE;
    DROP PROCEDURE IF EXISTS sp_proses_pembayaran_standar(INT, NUMERIC) CASCADE;
    DROP PROCEDURE IF EXISTS sp_sahkan_krs(INT) CASCADE;
    DROP PROCEDURE IF EXISTS sp_konversi_nilai_huruf() CASCADE;

    DROP FUNCTION IF EXISTS format_profil_mahasiswa(INT) CASCADE;
    DROP FUNCTION IF EXISTS cek_kelayakan_krs(INT) CASCADE;
  `);
}
