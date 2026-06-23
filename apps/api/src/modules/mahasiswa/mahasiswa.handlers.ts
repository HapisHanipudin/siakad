import type { RouteHandler } from "@hono/zod-openapi";
import { createDb } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import { getMahasiswaRoute, createMahasiswaRoute } from "./mahasiswa.routes";

export const getMahasiswaHandler: RouteHandler<
  typeof getMahasiswaRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const { page, limit, search } = c.req.valid("query");
  
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  await client.connect();
  try {
    let countResult;
    let result;

    const baseDataQuery = `
      SELECT 
        m.id_mahasiswa, 
        m.nim, 
        m.nama_mahasiswa, 
        m.status_mahasiswa, 
        m.angkatan, 
        m.id_program_studi, 
        m.id_kurikulum, 
        m.id_kelompok, 
        ps.nama_prodi, 
        u.email,
        format_profil_mahasiswa(m.id_mahasiswa) AS profil_format,
        k.id_dosen AS id_dosen_pembimbing,
        d.nama_dosen AS nama_dosen_pembimbing,
        d.nidn AS nidn_pembimbing
      FROM mahasiswa m 
      LEFT JOIN program_studi ps ON m.id_program_studi = ps.id_program_studi 
      LEFT JOIN users u ON m.id_mahasiswa = u.id_mahasiswa
      LEFT JOIN kelompok k ON m.id_kelompok = k.id_kelompok
      LEFT JOIN dosen d ON k.id_dosen = d.id_dosen
    `;

    if (search) {
      const searchPattern = `%${search}%`;
      countResult = await client.query(
        "SELECT COUNT(*) FROM mahasiswa WHERE nama_mahasiswa ILIKE $1 OR nim ILIKE $1",
        [searchPattern]
      );
      result = await client.query(
        baseDataQuery + `
          WHERE m.nama_mahasiswa ILIKE $3 OR m.nim ILIKE $3
          ORDER BY m.id_mahasiswa DESC
          LIMIT $1 OFFSET $2
        `,
        [limitNum, offset, searchPattern]
      );
    } else {
      countResult = await client.query("SELECT COUNT(*) FROM mahasiswa");
      result = await client.query(
        baseDataQuery + `
          ORDER BY m.id_mahasiswa DESC
          LIMIT $1 OFFSET $2
        `,
        [limitNum, offset]
      );
    }

    const total = parseInt(countResult.rows[0].count, 10);
    
    return c.json({
      data: result.rows,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    }, 200);
  } finally {
    await client.end();
  }
};

export const createMahasiswaHandler: RouteHandler<
  typeof createMahasiswaRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const { 
    nim, 
    nama_mahasiswa, 
    email, 
    id_program_studi, 
    id_kurikulum, 
    id_kelompok, 
    angkatan, 
    password 
  } = c.req.valid("json");

  await client.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert ke tabel mahasiswa
    const studentResult = await client.query(`
      INSERT INTO mahasiswa (id_program_studi, id_kurikulum, id_kelompok, nim, nama_mahasiswa, status_mahasiswa, angkatan)
      VALUES ($1, $2, $3, $4, $5, 'aktif', $6)
      RETURNING id_mahasiswa, nim, nama_mahasiswa, status_mahasiswa, angkatan, id_program_studi, id_kurikulum, id_kelompok
    `, [id_program_studi, id_kurikulum, id_kelompok, nim, nama_mahasiswa, angkatan]);
    const newMahasiswa = studentResult.rows[0];

    // 2. Insert ke tabel users
    const userResult = await client.query(`
      INSERT INTO users (id_mahasiswa, id_dosen, email, password, role)
      VALUES ($1, NULL, $2, $3, 'mahasiswa')
      RETURNING id_user, email
    `, [newMahasiswa.id_mahasiswa, email, password]);
    const newUser = userResult.rows[0];

    // 3. Buat tagihan UKT awal semester ganjil (nominal 5.500.000)
    await client.query(`
      INSERT INTO tagihan (id_mahasiswa, id_tahun_ajaran, semester_aktif, tipe_tagihan, nominal, status_tagihan, tenggat)
      VALUES ($1, 2, 'ganjil', 'ukt', 5500000.00, 'belum', '2025-07-31')
    `, [newMahasiswa.id_mahasiswa]);

    // 4. Catat ke log_aktivitas
    await client.query(`
      INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
      VALUES ($1, $2, $3)
    `, [newUser.id_user, "127.0.0.1", `Pendaftaran mahasiswa baru: ${newMahasiswa.nim} - ${newMahasiswa.nama_mahasiswa}`]);

    await client.query("COMMIT");

    return c.json({
      id_mahasiswa: newMahasiswa.id_mahasiswa,
      nim: newMahasiswa.nim,
      nama_mahasiswa: newMahasiswa.nama_mahasiswa,
      status_mahasiswa: newMahasiswa.status_mahasiswa,
      angkatan: newMahasiswa.angkatan,
      id_program_studi: newMahasiswa.id_program_studi,
      id_kurikulum: newMahasiswa.id_kurikulum,
      id_kelompok: newMahasiswa.id_kelompok,
      email: newUser.email,
    }, 201);
  } catch (error: any) {
    await client.query("ROLLBACK");
    return c.json({
      message: error.message || "Gagal mendaftarkan mahasiswa baru",
    }, 400);
  } finally {
    await client.end();
  }
};
