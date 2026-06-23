import type { RouteHandler } from "@hono/zod-openapi";
import { createDb } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import { getDosenRoute, createDosenRoute, getBimbinganRoute } from "./dosen.routes";

export const getDosenHandler: RouteHandler<
  typeof getDosenRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  await client.connect();
  try {
    const { page, limit, search } = c.req.valid("query");
    const pageNum = parseInt(page ?? "1", 10) || 1;
    const limitNum = parseInt(limit ?? "10", 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for search
    const params: any[] = [];
    let whereSql = "";
    if (search) {
      params.push(`%${search}%`);
      whereSql = `WHERE d.nama_dosen ILIKE $${params.length} OR d.nidn ILIKE $${params.length}`;
    }

    // Total count for pagination
    const countQuery = `SELECT COUNT(*) AS total FROM dosen d ${whereSql}`;
    const countRes = await client.query(countQuery, params);
    const total = parseInt(countRes.rows[0].total, 10) || 0;

    // Main query with jumlah_bimbingan
    // We inject params for LIMIT/OFFSET at the end
    const mainParams = params.slice();
    mainParams.push(limitNum, offset);

    const mainQuery = `
      SELECT 
        d.id_dosen, 
        d.nidn, 
        d.nama_dosen, 
        d.gelar, 
        d.id_fakultas, 
        f.nama_fakultas, 
        u.email,
        COALESCE(cnt.jumlah, 0) AS jumlah_bimbingan
      FROM dosen d 
      LEFT JOIN fakultas f ON d.id_fakultas = f.id_fakultas 
      LEFT JOIN users u ON d.id_dosen = u.id_dosen
      LEFT JOIN (
        SELECT k.id_dosen, COUNT(m.id_mahasiswa) AS jumlah
        FROM kelompok k
        LEFT JOIN mahasiswa m ON m.id_kelompok = k.id_kelompok
        GROUP BY k.id_dosen
      ) cnt ON cnt.id_dosen = d.id_dosen
      ${whereSql}
      ORDER BY d.id_dosen DESC
      LIMIT $${mainParams.length - 1} OFFSET $${mainParams.length}
    `;

    const result = await client.query(mainQuery, mainParams);

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

export const getBimbinganHandler: RouteHandler<
  typeof getBimbinganRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const id_dosen = parseInt(c.req.param("id_dosen"), 10);

  await client.connect();
  try {
    const result = await client.query(`
      SELECT 
        m.id_mahasiswa, 
        m.nim, 
        m.nama_mahasiswa, 
        m.status_mahasiswa, 
        m.angkatan, 
        ps.nama_prodi
      FROM mahasiswa m 
      JOIN kelompok k ON m.id_kelompok = k.id_kelompok 
      JOIN program_studi ps ON m.id_program_studi = ps.id_program_studi 
      WHERE k.id_dosen = $1
      ORDER BY m.id_mahasiswa ASC
    `, [id_dosen]);

    return c.json(result.rows, 200);
  } finally {
    await client.end();
  }
};

export const createDosenHandler: RouteHandler<
  typeof createDosenRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const { nidn, nama_dosen, gelar, email, id_fakultas, password } = c.req.valid("json");

  await client.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert ke tabel dosen
    const dosenResult = await client.query(`
      INSERT INTO dosen (id_fakultas, nidn, nama_dosen, gelar)
      VALUES ($1, $2, $3, $4)
      RETURNING id_dosen, nidn, nama_dosen, gelar, id_fakultas
    `, [id_fakultas, nidn, nama_dosen, gelar]);
    const newDosen = dosenResult.rows[0];

    // 2. Insert ke tabel users
    const userResult = await client.query(`
      INSERT INTO users (id_mahasiswa, id_dosen, email, password, role)
      VALUES (NULL, $1, $2, $3, 'dosen')
      RETURNING email
    `, [newDosen.id_dosen, email, password]);
    const newUser = userResult.rows[0];

    // 3. Catat log aktivitas
    await client.query(`
      INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
      VALUES ((SELECT id_user FROM users WHERE email = $1), $2, $3)
    `, [email, "127.0.0.1", `Pembuatan dosen baru: ${newDosen.nidn} - ${newDosen.nama_dosen}`]);

    await client.query("COMMIT");

    return c.json({
      id_dosen: newDosen.id_dosen,
      nidn: newDosen.nidn,
      nama_dosen: newDosen.nama_dosen,
      gelar: newDosen.gelar,
      id_fakultas: newDosen.id_fakultas,
      email: newUser.email,
    }, 201);
  } catch (error: any) {
    await client.query("ROLLBACK");
    return c.json({
      message: error.message || "Gagal membuat dosen baru",
    }, 400);
  } finally {
    await client.end();
  }
};
