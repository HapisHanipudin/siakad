import type { RouteHandler } from "@hono/zod-openapi";
import { createDb } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import { getKelasRoute, createKelasRoute, getKelasCountRoute, getMataKuliahOptionsRoute, getRuanganOptionsRoute, getRombelOptionsRoute } from "./kelas.routes";

export const getKelasHandler: RouteHandler<
  typeof getKelasRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);

  await client.connect();
  try {
    const result = await client.query(`
      SELECT 
        kl.id_kelas, 
        kl.id_ruangan, 
        kl.id_program_studi, 
        kl.id_rombel, 
        kl.id_mata_kuliah, 
        kl.id_dosen, 
        kl.id_tahun_ajaran, 
        kl.kode_kelas, 
        kl.kuota, 
        kl.semester_aktif, 
        kl.jam_mulai, 
        kl.jam_selesai, 
        kl.hari,
        mk.nama_mata_kuliah,
        mk.kode_mata_kuliah,
        mk.sks,
        d.nama_dosen,
        r.nama_ruangan
      FROM kelas kl
      JOIN mata_kuliah mk ON kl.id_mata_kuliah = mk.id_mata_kuliah
      JOIN dosen d ON kl.id_dosen = d.id_dosen
      JOIN ruangan r ON kl.id_ruangan = r.id_ruangan
      ORDER BY kl.id_kelas ASC
    `);

    // Parse time fields to string
    const list = result.rows.map(row => ({
      ...row,
      jam_mulai: String(row.jam_mulai),
      jam_selesai: String(row.jam_selesai),
    }));
    
    return c.json(list, 200);
  } finally {
    await client.end();
  }
};

export const createKelasHandler: RouteHandler<
  typeof createKelasRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const body = c.req.valid("json");

  await client.connect();
  try {
    await client.query("BEGIN");

    // Skenario 4: Pendaftaran kelas baru
    // Validasi kuota vs kapasitas ruangan otomatis dijalankan oleh trigger trg_validasi_kuota_ruangan
    // Validasi tabrakan jadwal dosen otomatis dijalankan oleh trigger trg_cek_jadwal_dosen
    const result = await client.query(`
      INSERT INTO kelas (
        id_ruangan, id_program_studi, id_rombel, id_mata_kuliah,
        id_dosen, id_tahun_ajaran, kode_kelas,
        kuota, semester_aktif, jam_mulai, jam_selesai, hari
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id_kelas, id_ruangan, id_program_studi, id_rombel, id_mata_kuliah, id_dosen, id_tahun_ajaran, kode_kelas, kuota, semester_aktif, jam_mulai, jam_selesai, hari
    `, [
      body.id_ruangan, body.id_program_studi, body.id_rombel, body.id_mata_kuliah,
      body.id_dosen, body.id_tahun_ajaran, body.kode_kelas,
      body.kuota, body.semester_aktif, body.jam_mulai, body.jam_selesai, body.hari
    ]);

    const newKelas = result.rows[0];

    // Catat log aktivitas
    await client.query(`
      INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
      VALUES (
        (SELECT id_user FROM users WHERE role = 'admin' LIMIT 1), 
        '127.0.0.1', 
        $1
      )
    `, [`Kelas baru ${newKelas.kode_kelas} berhasil dibuat oleh admin`]);

    await client.query("COMMIT");

    return c.json({
      ...newKelas,
      jam_mulai: String(newKelas.jam_mulai),
      jam_selesai: String(newKelas.jam_selesai),
    }, 201);
  } catch (error: any) {
    await client.query("ROLLBACK");
    return c.json({
      message: error.message || "Gagal membuat kelas baru",
    }, 400);
  } finally {
    await client.end();
  }
};

export const getKelasCountHandler: RouteHandler<
  typeof getKelasCountRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);

  await client.connect();
  try {
    const kRes = await client.query(`
      SELECT COUNT(*) FROM kelas k
      JOIN tahun_ajaran ta ON k.id_tahun_ajaran = ta.id_tahun_ajaran
      WHERE ta.nama_tahun_ajaran = '2025/2026'
    `);
    return c.json({
      totalKelas: parseInt(kRes.rows[0].count, 10),
    }, 200);
  } finally {
    await client.end();
  }
};

export const getMataKuliahOptionsHandler: RouteHandler<
  typeof getMataKuliahOptionsRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);

  await client.connect();
  try {
    const result = await client.query(`
      SELECT id_mata_kuliah, kode_mata_kuliah, nama_mata_kuliah, sks
      FROM mata_kuliah
      ORDER BY nama_mata_kuliah ASC
    `);
    return c.json(result.rows, 200);
  } finally {
    await client.end();
  }
};

export const getRuanganOptionsHandler: RouteHandler<
  typeof getRuanganOptionsRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);

  await client.connect();
  try {
    const result = await client.query(`
      SELECT id_ruangan, nama_ruangan, kapasitas
      FROM ruangan
      ORDER BY nama_ruangan ASC
    `);
    return c.json(result.rows, 200);
  } finally {
    await client.end();
  }
};

export const getRombelOptionsHandler: RouteHandler<
  typeof getRombelOptionsRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);

  await client.connect();
  try {
    const result = await client.query(`
      SELECT id_rombel, id_program_studi, nama_rombel, angkatan
      FROM rombel
      ORDER BY nama_rombel ASC
    `);
    return c.json(result.rows, 200);
  } finally {
    await client.end();
  }
};

