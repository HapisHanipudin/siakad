import type { RouteHandler } from "@hono/zod-openapi";
import { createDb } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import { updateGradeRoute } from "./nilai.routes";

export const updateGradeHandler: RouteHandler<
  typeof updateGradeRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const { updates, id_dosen_user } = c.req.valid("json");

  await client.connect();
  try {
    await client.query("BEGIN");

    // Skenario 2: Update Nilai Akhir transaksional
    for (const update of updates) {
      // Validasi manual di script: pastikan nilai dalam rentang wajar (0-100)
      if (
        update.nilai_tugas < 0 || update.nilai_tugas > 100 ||
        update.nilai_uts < 0 || update.nilai_uts > 100 ||
        update.nilai_uas < 0 || update.nilai_uas > 100
      ) {
        throw new Error(`Nilai untuk detail_krs id=${update.id_detail_krs} harus berada di antara rentang 0-100`);
      }

      // Jalankan UPDATE. Trigger trg_hitung_nilai akan otomatis menghitung nilai_akhir_angka dan nilai_akhir_huruf
      const res = await client.query(`
        UPDATE detail_krs
        SET 
          nilai_tugas = $1,
          nilai_uts = $2,
          nilai_uas = $3
        WHERE id_detail_krs = $4
        RETURNING id_detail_krs
      `, [update.nilai_tugas, update.nilai_uts, update.nilai_uas, update.id_detail_krs]);

      if (res.rows.length === 0) {
        throw new Error(`Detail KRS dengan id=${update.id_detail_krs} tidak ditemukan`);
      }
    }

    // Menjalankan stored procedure sp_konversi_nilai_huruf (SP-04) dengan Cursor massal
    await client.query("CALL sp_konversi_nilai_huruf()");

    // Catat log aktivitas input nilai
    const updateIdsString = updates.map(u => u.id_detail_krs).join(", ");
    await client.query(`
      INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
      VALUES ($1, $2, $3)
    `, [id_dosen_user, "127.0.0.1", `Input nilai akhir batch untuk detail_krs id: ${updateIdsString}`]);

    await client.query("COMMIT");

    return c.json({
      message: "Seluruh nilai mahasiswa berhasil diperbarui dan dihitung otomatis oleh trigger basis data",
      count: updates.length,
    }, 200);
  } catch (error: any) {
    await client.query("ROLLBACK");
    return c.json({
      message: error.message || "Gagal meng-update nilai",
    }, 400);
  } finally {
    await client.end();
  }
};
