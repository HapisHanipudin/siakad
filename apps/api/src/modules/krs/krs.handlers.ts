import type { RouteHandler } from "@hono/zod-openapi";
import { createDb } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import { getKrsRoute, createKrsRoute, cancelKrsRoute, approveKrsRoute } from "./krs.routes";

export const getKrsHandler: RouteHandler<
  typeof getKrsRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const id_mahasiswa = parseInt(c.req.param("id_mahasiswa"), 10);

  await client.connect();
  try {
    // 1. Dapatkan KRS teraktif
    let krsResult = await client.query(`
      SELECT 
        k.id_krs, 
        k.id_mahasiswa, 
        k.id_tahun_ajaran, 
        k.semester_aktif, 
        k.status_krs, 
        k.catatan,
        ta.nama_tahun_ajaran
      FROM krs k
      LEFT JOIN tahun_ajaran ta ON k.id_tahun_ajaran = ta.id_tahun_ajaran
      WHERE k.id_mahasiswa = $1 
      ORDER BY k.id_krs DESC 
      LIMIT 1
    `, [id_mahasiswa]);

    let krs = krsResult.rows[0];

    // Jika tidak ditemukan, buat record draft baru untuk mempermudah portal
    if (!krs) {
      const newKrsResult = await client.query(`
        INSERT INTO krs (id_mahasiswa, id_tahun_ajaran, semester_aktif, status_krs, catatan)
        VALUES ($1, 2, 'ganjil', 'draft', NULL)
        RETURNING *
      `, [id_mahasiswa]);
      
      const taResult = await client.query(`
        SELECT nama_tahun_ajaran FROM tahun_ajaran WHERE id_tahun_ajaran = 2
      `);

      krs = {
        ...newKrsResult.rows[0],
        nama_tahun_ajaran: taResult.rows[0]?.nama_tahun_ajaran || "2025/2026",
      };
    }

    // 2. Dapatkan detail mata kuliah di KRS tersebut beserta kehadiran
    const detailResult = await client.query(`
      SELECT 
        dk.id_detail_krs, 
        dk.id_krs, 
        dk.id_kelas, 
        dk.nilai_tugas, 
        dk.nilai_uts, 
        dk.nilai_uas, 
        dk.nilai_akhir_angka, 
        dk.nilai_akhir_huruf,
        kl.kode_kelas,
        mk.nama_mata_kuliah,
        mk.sks,
        ds.nama_dosen,
        (SELECT COUNT(*) FROM pertemuan pt WHERE pt.id_kelas = kl.id_kelas)::INTEGER AS total_pertemuan,
        (SELECT COUNT(*) FROM presensi pr WHERE pr.id_detail_krs = dk.id_detail_krs AND pr.status_presensi = 'hadir')::INTEGER AS total_hadir
      FROM detail_krs dk
      JOIN kelas kl ON dk.id_kelas = kl.id_kelas
      JOIN mata_kuliah mk ON kl.id_mata_kuliah = mk.id_mata_kuliah
      JOIN dosen ds ON kl.id_dosen = ds.id_dosen
      WHERE dk.id_krs = $1
      ORDER BY dk.id_detail_krs ASC
    `, [krs.id_krs]);

    // Parsing decimal ke number agar sesuai schema Zod
    const detail = detailResult.rows.map(row => ({
      ...row,
      nilai_tugas: Number(row.nilai_tugas),
      nilai_uts: Number(row.nilai_uts),
      nilai_uas: Number(row.nilai_uas),
      nilai_akhir_angka: Number(row.nilai_akhir_angka),
      total_pertemuan: Number(row.total_pertemuan || 0),
      total_hadir: Number(row.total_hadir || 0),
    }));

    return c.json({
      id_krs: krs.id_krs,
      id_mahasiswa: krs.id_mahasiswa,
      id_tahun_ajaran: krs.id_tahun_ajaran,
      nama_tahun_ajaran: krs.nama_tahun_ajaran,
      semester_aktif: krs.semester_aktif,
      status_krs: krs.status_krs,
      catatan: krs.catatan,
      detail,
    }, 200);
  } catch (error: any) {
    return c.json({ message: error.message || "Gagal mengambil data KRS" }, 404);
  } finally {
    await client.end();
  }
};

export const createKrsHandler: RouteHandler<
  typeof createKrsRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const { id_mahasiswa, id_kelas_list } = c.req.valid("json");

  await client.connect();
  try {
    // A. Cek status mahasiswa (Cuti / Drop Out dibatasi pengisian KRS)
    const mhsRes = await client.query(`
      SELECT status_mahasiswa 
      FROM mahasiswa 
      WHERE id_mahasiswa = $1
    `, [id_mahasiswa]);
    
    if (mhsRes.rows.length === 0) {
      throw new Error("Mahasiswa tidak ditemukan.");
    }
    
    const statusMhs = mhsRes.rows[0].status_mahasiswa;
    if (statusMhs === 'cuti' || statusMhs === 'drop_out') {
      throw new Error(`Akses ditolak: Mahasiswa dengan status '${statusMhs}' tidak diizinkan mengisi KRS.`);
    }

    // B. Cek tagihan belum lunas yang melewati tenggat waktu menggunakan UDF cek_kelayakan_krs
    const overdueRes = await client.query(`
      SELECT id_tagihan 
      FROM tagihan 
      WHERE id_mahasiswa = $1 
        AND status_tagihan = 'belum' 
        AND tenggat < CURRENT_DATE
    `, [id_mahasiswa]);
    
    for (const tagihanRow of overdueRes.rows) {
      const kelayakanRes = await client.query(`
        SELECT cek_kelayakan_krs($1) AS layak
      `, [tagihanRow.id_tagihan]);
      
      if (!kelayakanRes.rows[0].layak) {
        throw new Error("Akses ditolak: Pengisian KRS diblokir karena Anda memiliki tagihan belum lunas yang telah melewati tenggat waktu.");
      }
    }

    await client.query("BEGIN");

    // 1. Cari atau buat header KRS
    let krsResult = await client.query(`
      SELECT id_krs, status_krs FROM krs 
      WHERE id_mahasiswa = $1 
      ORDER BY id_krs DESC LIMIT 1
    `, [id_mahasiswa]);

    let id_krs: number;
    if (krsResult.rows.length > 0) {
      if (krsResult.rows[0].status_krs === 'sah') {
        throw new Error("KRS Anda sudah disahkan dan tidak dapat diubah.");
      }
      id_krs = krsResult.rows[0].id_krs;
    } else {
      const newKrs = await client.query(`
        INSERT INTO krs (id_mahasiswa, id_tahun_ajaran, semester_aktif, status_krs)
        VALUES ($1, 2, 'ganjil', 'draft')
        RETURNING id_krs
      `, [id_mahasiswa]);
      id_krs = newKrs.rows[0].id_krs;
    }

    // 2. Bersihkan detail KRS lama terlebih dahulu untuk resubmission
    await client.query(`
      DELETE FROM detail_krs WHERE id_krs = $1
    `, [id_krs]);

    // 3. Tambahkan kelas-kelas baru menggunakan Stored Procedure sp_tambah_kelas_krs
    for (const id_kelas of id_kelas_list) {
      // Menjalankan stored procedure sp_tambah_kelas_krs (Skenario 1)
      // Trigger T-02 (Cek Prasyarat) dan T-03 (Kuota) otomatis berjalan
      await client.query(`
        CALL sp_tambah_kelas_krs($1, $2)
      `, [id_krs, id_kelas]);
    }

    // 4. Ubah status KRS menjadi 'menunggu' (menunggu validasi Dosen Wali)
    await client.query(`
      UPDATE krs 
      SET status_krs = 'menunggu', 
          catatan = 'Menunggu validasi Dosen Wali' 
      WHERE id_krs = $1
    `, [id_krs]);

    // 5. Catat log aktivitas
    await client.query(`
      INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
      VALUES (
        (SELECT id_user FROM users WHERE id_mahasiswa = $1 LIMIT 1),
        '127.0.0.1',
        'Mengisi dan mengajukan KRS Semester Ganjil 2025/2026'
      )
    `, [id_mahasiswa]);

    await client.query("COMMIT");

    // Ambil data terbaru untuk dikembalikan ke client
    const updatedKrs = await client.query(`
      SELECT 
        k.id_krs, k.id_mahasiswa, k.id_tahun_ajaran, k.semester_aktif, k.status_krs, k.catatan,
        ta.nama_tahun_ajaran
      FROM krs k
      LEFT JOIN tahun_ajaran ta ON k.id_tahun_ajaran = ta.id_tahun_ajaran
      WHERE k.id_krs = $1
    `, [id_krs]);

    const updatedDetail = await client.query(`
      SELECT 
        dk.id_detail_krs, dk.id_krs, dk.id_kelas, 
        dk.nilai_tugas, dk.nilai_uts, dk.nilai_uas, dk.nilai_akhir_angka, dk.nilai_akhir_huruf,
        kl.kode_kelas, mk.nama_mata_kuliah, mk.sks, ds.nama_dosen
      FROM detail_krs dk
      JOIN kelas kl ON dk.id_kelas = kl.id_kelas
      JOIN mata_kuliah mk ON kl.id_mata_kuliah = mk.id_mata_kuliah
      JOIN dosen ds ON kl.id_dosen = ds.id_dosen
      WHERE dk.id_krs = $1
    `, [id_krs]);

    const detail = updatedDetail.rows.map(row => ({
      ...row,
      nilai_tugas: Number(row.nilai_tugas),
      nilai_uts: Number(row.nilai_uts),
      nilai_uas: Number(row.nilai_uas),
      nilai_akhir_angka: Number(row.nilai_akhir_angka),
    }));

    return c.json({
      id_krs: updatedKrs.rows[0].id_krs,
      id_mahasiswa: updatedKrs.rows[0].id_mahasiswa,
      id_tahun_ajaran: updatedKrs.rows[0].id_tahun_ajaran,
      nama_tahun_ajaran: updatedKrs.rows[0].nama_tahun_ajaran,
      semester_aktif: updatedKrs.rows[0].semester_aktif,
      status_krs: updatedKrs.rows[0].status_krs,
      catatan: updatedKrs.rows[0].catatan,
      detail,
    }, 201);
  } catch (error: any) {
    await client.query("ROLLBACK");
    return c.json({
      message: error.message || "Gagal memproses KRS",
    }, 400);
  } finally {
    await client.end();
  }
};

export const cancelKrsHandler: RouteHandler<
  typeof cancelKrsRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const id_krs = parseInt(c.req.param("id_krs"), 10);

  await client.connect();
  try {
    await client.query("BEGIN");

    // 1. Cek status KRS
    const checkKrs = await client.query(`
      SELECT k.status_krs, m.nama_mahasiswa, m.id_mahasiswa 
      FROM krs k
      JOIN mahasiswa m ON k.id_mahasiswa = m.id_mahasiswa
      WHERE k.id_krs = $1
    `, [id_krs]);

    if (checkKrs.rows.length === 0) {
      throw new Error(`KRS dengan id=${id_krs} tidak ditemukan`);
    }

    const { status_krs, nama_mahasiswa, id_mahasiswa } = checkKrs.rows[0];

    // Skenario 5: KRS yang sudah SAH tidak boleh dibatalkan sembarangan
    if (status_krs === 'sah') {
      throw new Error(`KRS milik ${nama_mahasiswa} sudah berstatus SAH, tidak dapat dibatalkan tanpa persetujuan admin.`);
    }

    // 2. Hapus detail KRS (Trigger T-03 otomatis mengembalikan kuota kelas)
    await client.query(`
      DELETE FROM detail_krs WHERE id_krs = $1
    `, [id_krs]);

    // 3. Hapus KRS header
    await client.query(`
      DELETE FROM krs WHERE id_krs = $1
    `, [id_krs]);

    // 4. Catat ke log
    await client.query(`
      INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
      VALUES (
        COALESCE(
          (SELECT id_user FROM users WHERE id_mahasiswa = $2 LIMIT 1), 
          (SELECT id_user FROM users WHERE role = 'admin' LIMIT 1)
        ),
        '127.0.0.1',
        $1
      )
    `, [`KRS id=${id_krs} milik ${nama_mahasiswa} dibatalkan.`, id_mahasiswa]);

    await client.query("COMMIT");

    return c.json({
      message: `KRS id=${id_krs} milik ${nama_mahasiswa} berhasil dibatalkan.`,
    }, 200);
  } catch (error: any) {
    await client.query("ROLLBACK");
    return c.json({
      message: error.message || "Gagal membatalkan KRS",
    }, 400);
  } finally {
    await client.end();
  }
};

export const approveKrsHandler: RouteHandler<
  typeof approveKrsRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const { id_krs } = c.req.valid("json");

  await client.connect();
  try {
    await client.query("BEGIN");

    // Menjalankan stored procedure sp_sahkan_krs (SP-03)
    await client.query(`
      CALL sp_sahkan_krs($1)
    `, [id_krs]);

    // Update catatan tambahan
    await client.query(`
      UPDATE krs 
      SET catatan = 'KRS disetujui Dosen Wali' 
      WHERE id_krs = $1
    `, [id_krs]);

    // Catat log
    await client.query(`
      INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
      VALUES (
        (SELECT id_user FROM users WHERE role = 'admin' LIMIT 1),
        '127.0.0.1',
        $1
      )
    `, [`Persetujuan KRS id=${id_krs} oleh Dosen Wali`]);

    await client.query("COMMIT");

    return c.json({
      message: "KRS berhasil disahkan oleh Dosen Wali",
      status_krs: "sah",
    }, 200);
  } catch (error: any) {
    await client.query("ROLLBACK");
    return c.json({
      message: error.message || "Gagal mengesahkan KRS",
    }, 400);
  } finally {
    await client.end();
  }
};
