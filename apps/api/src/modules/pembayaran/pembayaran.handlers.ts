import type { RouteHandler } from "@hono/zod-openapi";
import { createDb } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import { createPembayaranRoute, getTagihanRoute } from "./pembayaran.routes";

export const getTagihanHandler: RouteHandler<
  typeof getTagihanRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const id_mahasiswa = parseInt(c.req.param("id_mahasiswa"), 10);

  await client.connect();
  try {
    const result = await client.query(`
      SELECT 
        t.id_tagihan, 
        t.id_mahasiswa, 
        t.id_tahun_ajaran, 
        t.semester_aktif, 
        t.tipe_tagihan, 
        t.nominal::float as nominal, 
        t.status_tagihan, 
        t.tenggat, 
        ta.nama_tahun_ajaran 
      FROM tagihan t 
      JOIN tahun_ajaran ta ON t.id_tahun_ajaran = ta.id_tahun_ajaran 
      WHERE t.id_mahasiswa = $1 
      ORDER BY t.id_tagihan DESC
    `, [id_mahasiswa]);

    const list = result.rows.map(row => ({
      ...row,
      tenggat: new Date(row.tenggat).toISOString(),
    }));

    return c.json(list, 200);
  } finally {
    await client.end();
  }
};

export const createPembayaranHandler: RouteHandler<
  typeof createPembayaranRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const { id_tagihan, nominal_bayar } = c.req.valid("json");

  await client.connect();
  try {
    await client.query("BEGIN");

    // Skenario 3: Verifikasi status tagihan sebelum membayar
    const tagihanCheck = await client.query(`
      SELECT status_tagihan, nominal, id_mahasiswa
      FROM tagihan
      WHERE id_tagihan = $1
    `, [id_tagihan]);

    if (tagihanCheck.rows.length === 0) {
      throw new Error(`Tagihan dengan id=${id_tagihan} tidak ditemukan`);
    }

    const { status_tagihan, nominal, id_mahasiswa } = tagihanCheck.rows[0];

    if (status_tagihan === "lunas") {
      throw new Error(`Tagihan dengan id=${id_tagihan} sudah berstatus lunas, pembayaran ditolak.`);
    }

    // Insert record pembayaran
    // Trigger trg_update_status_tagihan otomatis berjalan saat status_pembayaran dimasukkan / didefinisikan lunas
    const payResult = await client.query(`
      INSERT INTO pembayaran (id_tagihan, nominal_bayar, status_pembayaran)
      VALUES ($1, $2, 'diverifikasi')
      RETURNING id_pembayaran, id_tagihan, tanggal_bayar, nominal_bayar::float as nominal_bayar, status_pembayaran
    `, [id_tagihan, nominal_bayar]);

    const newPayment = payResult.rows[0];

    // Catat log aktivitas verifikasi pembayaran oleh admin / mahasiswa
    await client.query(`
      INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
      VALUES (
        (SELECT id_user FROM users WHERE role = 'admin' LIMIT 1), 
        '127.0.0.1', 
        $1
      )
    `, [`Verifikasi pembayaran UKT - tagihan id=${id_tagihan} sebesar ${nominal_bayar}`]);

    await client.query("COMMIT");

    return c.json({
      id_pembayaran: newPayment.id_pembayaran,
      id_tagihan: newPayment.id_tagihan,
      tanggal_bayar: new Date(newPayment.tanggal_bayar).toISOString(),
      nominal_bayar: Number(newPayment.nominal_bayar),
      status_pembayaran: newPayment.status_pembayaran,
      message: "Pembayaran terverifikasi dan status tagihan berhasil diperbarui otomatis",
    }, 201);
  } catch (error: any) {
    await client.query("ROLLBACK");
    return c.json({
      message: error.message || "Gagal memproses pembayaran",
    }, 400);
  } finally {
    await client.end();
  }
};
