import type { RouteHandler } from "@hono/zod-openapi";
import { createDb } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import {
  getStatusMahasiswaRoute,
  getPendapatanUktRoute,
  getKesulitanMatkulRoute,
  getPerformaBasisDataRoute,
  getBebanKerjaDosenRoute,
} from "./laporan.routes";

export const getStatusMahasiswaHandler: RouteHandler<
  typeof getStatusMahasiswaRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  await client.connect();
  try {
    const result = await client.query(`
      SELECT 
          f.nama_fakultas,
          ps.nama_prodi,
          m.status_mahasiswa,
          COUNT(m.id_mahasiswa) AS jumlah_mahasiswa
      FROM fakultas f
      JOIN program_studi ps ON f.id_fakultas = ps.id_fakultas
      JOIN mahasiswa m ON ps.id_program_studi = m.id_program_studi
      GROUP BY 
          f.id_fakultas, 
          f.nama_fakultas, 
          ps.id_program_studi, 
          ps.nama_prodi, 
          m.status_mahasiswa
      ORDER BY 
          f.nama_fakultas ASC, 
          ps.nama_prodi ASC, 
          jumlah_mahasiswa DESC
    `);
    const mapped = result.rows.map((row) => ({
      nama_fakultas: row.nama_fakultas,
      nama_prodi: row.nama_prodi,
      status_mahasiswa: row.status_mahasiswa,
      jumlah_mahasiswa: Number(row.jumlah_mahasiswa),
    }));
    return c.json(mapped, 200);
  } finally {
    await client.end();
  }
};

export const getPendapatanUktHandler: RouteHandler<
  typeof getPendapatanUktRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  await client.connect();
  try {
    const result = await client.query(`
      SELECT 
          ps.nama_prodi,
          SUM(p.nominal_bayar) AS total_pendapatan_ukt
      FROM pembayaran p
      JOIN tagihan t ON p.id_tagihan = t.id_tagihan
      JOIN mahasiswa m ON t.id_mahasiswa = m.id_mahasiswa
      JOIN program_studi ps ON m.id_program_studi = ps.id_program_studi
      WHERE t.tipe_tagihan = 'ukt' 
        AND t.status_tagihan = 'lunas'
        AND t.semester_aktif = 'ganjil'
      GROUP BY 
          ps.id_program_studi, 
          ps.nama_prodi
      ORDER BY 
          total_pendapatan_ukt DESC
    `);
    const mapped = result.rows.map((row) => ({
      nama_prodi: row.nama_prodi,
      total_pendapatan_ukt: Number(row.total_pendapatan_ukt),
    }));
    return c.json(mapped, 200);
  } finally {
    await client.end();
  }
};

export const getKesulitanMatkulHandler: RouteHandler<
  typeof getKesulitanMatkulRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  await client.connect();
  try {
    const result = await client.query(`
      SELECT 
          mk.kode_mata_kuliah,
          mk.nama_mata_kuliah,
          ROUND(AVG(dk.nilai_akhir_angka), 2) AS rata_rata_nilai
      FROM detail_krs dk
      JOIN kelas k ON dk.id_kelas = k.id_kelas
      JOIN mata_kuliah mk ON k.id_mata_kuliah = mk.id_mata_kuliah
      GROUP BY 
          mk.id_mata_kuliah, 
          mk.kode_mata_kuliah, 
          mk.nama_mata_kuliah
      ORDER BY 
          rata_rata_nilai ASC
    `);
    const mapped = result.rows.map((row) => ({
      kode_mata_kuliah: row.kode_mata_kuliah,
      nama_mata_kuliah: row.nama_mata_kuliah,
      rata_rata_nilai: Number(row.rata_rata_nilai),
    }));
    return c.json(mapped, 200);
  } finally {
    await client.end();
  }
};

export const getPerformaBasisDataHandler: RouteHandler<
  typeof getPerformaBasisDataRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  await client.connect();
  try {
    const result = await client.query(`
      WITH stats AS (
          SELECT 
              MAX(dk.nilai_akhir_angka) AS max_nilai,
              MIN(dk.nilai_akhir_angka) AS min_nilai
          FROM detail_krs dk
          JOIN kelas k ON dk.id_kelas = k.id_kelas
          JOIN mata_kuliah mk ON k.id_mata_kuliah = mk.id_mata_kuliah
          WHERE mk.nama_mata_kuliah = 'Sistem Basis Data'
      )
      SELECT 
          m.nim,
          m.nama_mahasiswa,
          mk.nama_mata_kuliah,
          dk.nilai_akhir_angka,
          CASE 
              WHEN dk.nilai_akhir_angka = s.max_nilai THEN 'Top Performer'
              WHEN dk.nilai_akhir_angka = s.min_nilai THEN 'Bottom Performer'
          END AS kategori_performa
      FROM detail_krs dk
      JOIN krs kr ON dk.id_krs = kr.id_krs
      JOIN mahasiswa m ON kr.id_mahasiswa = m.id_mahasiswa
      JOIN kelas k ON dk.id_kelas = k.id_kelas
      JOIN mata_kuliah mk ON k.id_mata_kuliah = mk.id_mata_kuliah
      CROSS JOIN stats s
      WHERE mk.nama_mata_kuliah = 'Sistem Basis Data'
        AND (dk.nilai_akhir_angka = s.max_nilai OR dk.nilai_akhir_angka = s.min_nilai)
      ORDER BY 
          dk.nilai_akhir_angka DESC
    `);
    const mapped = result.rows.map((row) => ({
      nim: row.nim,
      nama_mahasiswa: row.nama_mahasiswa,
      nama_mata_kuliah: row.nama_mata_kuliah,
      nilai_akhir_angka: Number(row.nilai_akhir_angka),
      kategori_performa: row.kategori_performa,
    }));
    return c.json(mapped, 200);
  } finally {
    await client.end();
  }
};

export const getBebanKerjaDosenHandler: RouteHandler<
  typeof getBebanKerjaDosenRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  await client.connect();
  try {
    const result = await client.query(`
      SELECT 
          d.nidn,
          d.nama_dosen,
          COUNT(k.id_kelas) AS total_kelas_diajar,
          SUM(mk.sks) AS total_beban_sks
      FROM dosen d
      JOIN kelas k ON d.id_dosen = k.id_dosen
      JOIN tahun_ajaran ta ON k.id_tahun_ajaran = ta.id_tahun_ajaran
      JOIN mata_kuliah mk ON k.id_mata_kuliah = mk.id_mata_kuliah
      WHERE ta.nama_tahun_ajaran = '2025/2026'
      GROUP BY 
          d.id_dosen, 
          d.nidn, 
          d.nama_dosen
      ORDER BY 
          total_beban_sks DESC, 
          total_kelas_diajar DESC
    `);
    const mapped = result.rows.map((row) => ({
      nidn: row.nidn,
      nama_dosen: row.nama_dosen,
      total_kelas_diajar: Number(row.total_kelas_diajar),
      total_beban_sks: Number(row.total_beban_sks),
    }));
    return c.json(mapped, 200);
  } finally {
    await client.end();
  }
};
