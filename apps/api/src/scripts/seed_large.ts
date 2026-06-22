import pg from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from apps/api/.dev.vars
const envPath = path.resolve(process.cwd(), ".dev.vars");
dotenv.config({ path: envPath });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ ERROR: DATABASE_URL is not defined in apps/api/.dev.vars");
  process.exit(1);
}

const firstNames = [
  "Ahmad", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hadi", "Indah", "Joko",
  "Kartika", "Lestari", "Muhammad", "Nur", "Oki", "Putra", "Rini", "Slamet", "Tari", "Utami",
  "Wibowo", "Yeni", "Zaki", "Rizky", "Aulia", "Siti", "Mega", "Agus", "Dedi", "Sri",
  "Ani", "Rian", "Rudi", "Andi", "Hendra", "Yudi", "Ferry", "Diana", "Lusi", "Maya",
  "Taufik", "Bambang", "Surya", "Dian", "Ari", "Anisa", "Rina", "Agung", "Farhan", "Riza"
];

const lastNames = [
  "Pratama", "Saputra", "Lestari", "Wulandari", "Hidayat", "Sari", "Kusuma", "Santoso",
  "Wijaya", "Fitriani", "Gunawan", "Setiawan", "Siregar", "Harahap", "Ginting", "Manurung",
  "Simanjuntak", "Purba", "Sitorus", "Lubis", "Nasution", "Tanjung", "Pohan", "Daulay",
  "Pane", "Batubara", "Hadi", "Wibowo", "Kurniawan", "Suharto", "Mulyadi", "Yusuf", "Lubis"
];

const subjectsBase = [
  "Algoritma", "Basis Data", "Pemrograman Web", "Rekayasa Lunak", "Sistem Operasi",
  "Jaringan Komputer", "Kecerdasan Buatan", "Struktur Data", "Keamanan Informasi",
  "Pemrograman Mobile", "Etika Profesi", "Grafika Komputer", "Metode Penelitian",
  "Statistika", "Bahasa Inggris", "Matematika Diskrit", "Fisika Dasar", "Kalkulus",
  "Pancasila", "Kewirausahaan", "Sistem Informasi", "Interaksi Komputer", "Manajemen Proyek"
];

const buildingNames = [
  "Kartini", "Dewantara", "Sudirman", "Gatot Subroto", "Hatta", "Sjahrir",
  "Diponegoro", "Imam Bonjol", "Pattimura", "Teuku Umar", "Raden Saleh",
  "Multatuli", "Habibie", "Wahid Hasyim", "Samanhudy", "Yos Sudarso",
  "Slamet Riyadi", "Sutomo", "Wahidin", "Husni Thamrin"
];

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const times = [
  { mul: "08:00:00", sel: "10:30:00" },
  { mul: "10:40:00", sel: "13:10:00" },
  { mul: "13:30:00", sel: "16:00:00" },
  { mul: "16:10:00", sel: "18:40:00" }
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName(): string {
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
}

async function seed() {
  console.log("⚡ Connecting to Neon PostgreSQL...");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  try {
    console.log("🚀 Starting database seeding transaction...");
    await client.query("BEGIN");

    // 0. Kurikulum
    console.log("⏳ Seeding kurikulum...");
    const kurikulumRes = await client.query(`
      INSERT INTO kurikulum (id_program_studi, nama_kurikulum, tahun_mulai, tahun_akhir, status_kurikulum)
      VALUES (1, 'Kurikulum UPNVJ Baru 2026', 2026, 2030, TRUE)
      RETURNING id_kurikulum;
    `);
    const idKurikulum = kurikulumRes.rows[0].id_kurikulum;

    // 1. Gedung (20 rows)
    console.log("⏳ Seeding gedung...");
    const idGedungs: number[] = [];
    for (let i = 0; i < 20; i++) {
      const idFakultas = (i % 2) + 1;
      const res = await client.query(`
        INSERT INTO gedung (id_fakultas, nama_gedung)
        VALUES ($1, $2)
        RETURNING id_gedung;
      `, [idFakultas, `Gedung ${buildingNames[i]}`]);
      idGedungs.push(res.rows[0].id_gedung);
    }

    // 2. Ruangan (50 rows)
    console.log("⏳ Seeding ruangan...");
    const idRuangans: number[] = [];
    for (let i = 1; i <= 50; i++) {
      const idGedung = idGedungs[(i - 1) % idGedungs.length];
      const cap = getRandomElement([30, 40, 60]);
      const tipe = i % 3 === 0 ? "laboratorium" : "kelas_biasa";
      const res = await client.query(`
        INSERT INTO ruangan (id_gedung, nama_ruangan, kapasitas, tipe_ruangan)
        VALUES ($1, $2, $3, $4)
        RETURNING id_ruangan;
      `, [idGedung, `Ruang ${100 + i}`, cap, tipe]);
      idRuangans.push(res.rows[0].id_ruangan);
    }

    // 3. Mata Kuliah (100 rows)
    console.log("⏳ Seeding mata kuliah...");
    const idMataKuliahs: number[] = [];
    for (let i = 1; i <= 100; i++) {
      const code = `MK-${String(1000 + i).slice(-4)}`;
      const name = `${getRandomElement(subjectsBase)} ${String(i).slice(-2)}`;
      const sks = getRandomElement([2, 3, 4]);
      const res = await client.query(`
        INSERT INTO mata_kuliah (kode_mata_kuliah, nama_mata_kuliah, sks)
        VALUES ($1, $2, $3)
        RETURNING id_mata_kuliah;
      `, [code, name, sks]);
      idMataKuliahs.push(res.rows[0].id_mata_kuliah);
    }

    // 4. Prasyarat Mata Kuliah (100 rows)
    console.log("⏳ Seeding prasyarat mata kuliah...");
    for (let i = 0; i < 100; i++) {
      const idMk = idMataKuliahs[i % idMataKuliahs.length];
      const idPrasyarat = idMataKuliahs[(i + 3) % idMataKuliahs.length];
      if (idMk !== idPrasyarat) {
        await client.query(`
          INSERT INTO prasyarat_mata_kuliah (id_mata_kuliah, id_prasyarat_mata_kuliah, nilai_min)
          VALUES ($1, $2, 'C'::nilai_huruf)
          ON CONFLICT DO NOTHING;
        `, [idMk, idPrasyarat]);
      }
    }

    // 5. Rombel (100 rows)
    console.log("⏳ Seeding rombel...");
    const idRombels: number[] = [];
    for (let i = 1; i <= 100; i++) {
      const idProdi = getRandomElement([1, 2, 3]);
      const res = await client.query(`
        INSERT INTO rombel (id_program_studi, nama_rombel, angkatan)
        VALUES ($1, $2, 2025)
        RETURNING id_rombel;
      `, [idProdi, `RBL-${100 + i}`]);
      idRombels.push(res.rows[0].id_rombel);
    }

    // 6. Kurikulum Mata Kuliah (100 rows)
    console.log("⏳ Seeding kurikulum mata kuliah...");
    for (let i = 0; i < 100; i++) {
      const idMk = idMataKuliahs[i % idMataKuliahs.length];
      const sem = 1 + (i % 8);
      const type = i % 4 === 0 ? "peminatan" : "wajib";
      await client.query(`
        INSERT INTO kurikulum_mata_kuliah (id_kurikulum, id_mata_kuliah, semester, tipe_mata_kuliah)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING;
      `, [idKurikulum, idMk, sem, type]);
    }

    // 7. Dosen (100 rows)
    console.log("⏳ Seeding dosen...");
    const idDosens: number[] = [];
    const nidns = new Set<string>();
    for (let i = 1; i <= 100; i++) {
      let nidn = "";
      do {
        nidn = `04${Math.floor(10000000 + Math.random() * 90000000)}`;
      } while (nidns.has(nidn));
      nidns.add(nidn);
      const idFakultas = Math.random() > 0.5 ? 1 : 2;
      const degree = getRandomElement(["S2", "S3"]);
      const res = await client.query(`
        INSERT INTO dosen (id_fakultas, nidn, nama_dosen, gelar)
        VALUES ($1, $2, $3, $4)
        RETURNING id_dosen;
      `, [idFakultas, nidn, getRandomName(), degree]);
      idDosens.push(res.rows[0].id_dosen);
    }

    // 8. Kelompok (50 rows)
    console.log("⏳ Seeding kelompok...");
    const idKelompoks: number[] = [];
    for (let i = 1; i <= 50; i++) {
      const rombelId = idRombels[(i - 1) % idRombels.length];
      const dosenId = idDosens[(i - 1) % idDosens.length];
      const res = await client.query(`
        INSERT INTO kelompok (id_rombel, id_dosen, kode_kelompok)
        VALUES ($1, $2, $3)
        RETURNING id_kelompok;
      `, [rombelId, dosenId, `KLP-${100 + i}`]);
      idKelompoks.push(res.rows[0].id_kelompok);
    }

    // 9. Mahasiswa (100 rows)
    console.log("⏳ Seeding mahasiswa...");
    const idMahasiswas: number[] = [];
    const studentData: { id: number; nim: string; nama: string }[] = [];
    for (let i = 1; i <= 100; i++) {
      const prodi = getRandomElement([1, 2, 3]);
      const nim = `25105110${String(200 + i).slice(-3)}`;
      const kelompokId = idKelompoks[(i - 1) % idKelompoks.length];
      const nama = getRandomName();
      const res = await client.query(`
        INSERT INTO mahasiswa (id_program_studi, id_kurikulum, id_kelompok, nim, nama_mahasiswa, status_mahasiswa, angkatan)
        VALUES ($1, $2, $3, $4, $5, 'aktif'::status_mahasiswa, 2025)
        RETURNING id_mahasiswa;
      `, [prodi, idKurikulum, kelompokId, nim, nama]);
      idMahasiswas.push(res.rows[0].id_mahasiswa);
      studentData.push({ id: res.rows[0].id_mahasiswa, nim, nama });
    }

    // 10. Users (200 rows)
    console.log("⏳ Seeding users...");
    const studentUserIds: number[] = [];
    // Lecturer users
    for (let i = 0; i < 100; i++) {
      const dosenId = idDosens[i];
      const email = `dosen.large.${dosenId}@upnvj.ac.id`;
      await client.query(`
        INSERT INTO users (id_mahasiswa, id_dosen, email, password, role)
        VALUES (NULL, $1, $2, 'dosen123', 'dosen'::enum_role);
      `, [dosenId, email]);
    }
    // Student users
    for (let i = 0; i < 100; i++) {
      const m = studentData[i];
      const email = `mhs.large.${m.nim}@mahasiswa.upnvj.ac.id`;
      const res = await client.query(`
        INSERT INTO users (id_mahasiswa, id_dosen, email, password, role)
        VALUES ($1, NULL, $2, 'mhs123', 'mahasiswa'::enum_role)
        RETURNING id_user;
      `, [m.id, email]);
      studentUserIds.push(res.rows[0].id_user);
    }

    // 11. Kelas (100 rows)
    console.log("⏳ Seeding kelas...");
    const idKelases: number[] = [];
    for (let i = 1; i <= 100; i++) {
      const ruangan = idRuangans[(i - 1) % idRuangans.length];
      const prodi = getRandomElement([1, 2, 3]);
      const rombel = idRombels[(i - 1) % idRombels.length];
      const mk = idMataKuliahs[(i - 1) % idMataKuliahs.length];
      const dosen = idDosens[i - 1]; // Exactly 1 lecturer per class
      const day = getRandomElement(days);
      const time = getRandomElement(times);
      const res = await client.query(`
        INSERT INTO kelas (id_ruangan, id_program_studi, id_rombel, id_mata_kuliah, id_dosen, id_tahun_ajaran, kode_kelas, kuota, semester_aktif, jam_mulai, jam_selesai, hari)
        VALUES ($1, $2, $3, $4, $5, 2, $6, 30, 'ganjil'::semester_aktif, $7, $8, $9)
        RETURNING id_kelas;
      `, [ruangan, prodi, rombel, mk, dosen, `KLS-LG-${100 + i}`, time.mul, time.sel, day]);
      idKelases.push(res.rows[0].id_kelas);
    }

    // 12. KRS (100 rows)
    console.log("⏳ Seeding KRS...");
    const idKrses: number[] = [];
    for (let i = 0; i < 100; i++) {
      const mhsId = idMahasiswas[i];
      const res = await client.query(`
        INSERT INTO krs (id_mahasiswa, id_tahun_ajaran, semester_aktif, status_krs, catatan)
        VALUES ($1, 2, 'ganjil'::semester_aktif, 'sah'::status_krs, 'KRS disetujui Dosen Wali')
        RETURNING id_krs;
      `, [mhsId]);
      idKrses.push(res.rows[0].id_krs);
    }

    // 13. Detail KRS (200 rows)
    console.log("⏳ Seeding detail KRS...");
    const idDetailKrses: number[] = [];
    for (let i = 0; i < 100; i++) {
      const krsId = idKrses[i];
      const cls1 = idKelases[i % 50];
      const cls2 = idKelases[50 + (i % 50)];

      const tugas1 = (60 + Math.random() * 35).toFixed(2);
      const uts1 = (60 + Math.random() * 35).toFixed(2);
      const uas1 = (60 + Math.random() * 35).toFixed(2);

      const tugas2 = (60 + Math.random() * 35).toFixed(2);
      const uts2 = (60 + Math.random() * 35).toFixed(2);
      const uas2 = (60 + Math.random() * 35).toFixed(2);

      const res1 = await client.query(`
        INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_detail_krs;
      `, [krsId, cls1, tugas1, uts1, uas1]);
      idDetailKrses.push(res1.rows[0].id_detail_krs);

      const res2 = await client.query(`
        INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_detail_krs;
      `, [krsId, cls2, tugas2, uts2, uas2]);
      idDetailKrses.push(res2.rows[0].id_detail_krs);
    }

    // 14. Pertemuan (100 rows)
    console.log("⏳ Seeding pertemuan...");
    const idPertemuans: number[] = [];
    for (let i = 1; i <= 100; i++) {
      const classId = idKelases[(i - 1) % idKelases.length];
      const pertKe = 1 + Math.floor((i - 1) / 100);
      const res = await client.query(`
        INSERT INTO pertemuan (id_kelas, nomor_pertemuan, tanggal)
        VALUES ($1, $2, $3)
        RETURNING id_pertemuan;
      `, [classId, pertKe, `2025-09-${String(1 + (i % 28)).padStart(2, "0")}`]);
      idPertemuans.push(res.rows[0].id_pertemuan);
    }

    // 15. Presensi (200 rows)
    console.log("⏳ Seeding presensi...");
    for (let i = 0; i < 200; i++) {
      const detailKrsId = idDetailKrses[i];
      const pertId = idPertemuans[i % idPertemuans.length];
      const presenceStatus = Math.random() > 0.95 ? "alfa" : (Math.random() > 0.9 ? "izin" : "hadir");
      await client.query(`
        INSERT INTO presensi (id_detail_krs, id_pertemuan, status_presensi)
        VALUES ($1, $2, $3::status_presensi);
      `, [detailKrsId, pertId, presenceStatus]);
    }

    // 16. Tagihan (100 rows)
    console.log("⏳ Seeding tagihan...");
    const idTagihans: number[] = [];
    for (let i = 0; i < 100; i++) {
      const mhsId = idMahasiswas[i];
      const nominal = getRandomElement([3500000, 4200000, 5000000, 5500000, 6000000]);
      const status = Math.random() > 0.4 ? "lunas" : "belum";
      const res = await client.query(`
        INSERT INTO tagihan (id_mahasiswa, id_tahun_ajaran, semester_aktif, tipe_tagihan, nominal, status_tagihan, tenggat)
        VALUES ($1, 2, 'ganjil'::semester_aktif, 'ukt'::tipe_tagihan, $2, $3::status_transaksi, '2025-07-31')
        RETURNING id_tagihan;
      `, [mhsId, nominal, status]);
      idTagihans.push(res.rows[0].id_tagihan);
    }

    // 17. Pembayaran (100 rows)
    console.log("⏳ Seeding pembayaran...");
    for (let i = 0; i < 100; i++) {
      const tagihanId = idTagihans[i];
      // Only pay if status is set to lunas
      await client.query(`
        INSERT INTO pembayaran (id_tagihan, nominal_bayar, status_pembayaran)
        VALUES ($1, (SELECT nominal FROM tagihan WHERE id_tagihan = $1), 'lunas'::status_transaksi);
      `, [tagihanId]);
    }

    // 18. Log Aktivitas (100 rows)
    console.log("⏳ Seeding log aktivitas...");
    for (let i = 0; i < 100; i++) {
      const userId = studentUserIds[i];
      await client.query(`
        INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
        VALUES ($1, '127.0.0.1', 'Mengisi KRS dan mendaftarkan pertemuan mata kuliah');
      `, [userId]);
    }

    // 19. Pengumuman (100 rows)
    console.log("⏳ Seeding pengumuman...");
    for (let i = 1; i <= 100; i++) {
      const target = getRandomElement(["global", "prodi", "personal"]);
      await client.query(`
        INSERT INTO pengumuman (id_user, isi_pengumuman, target)
        VALUES (1, $1, $2::target_pengumuman);
      `, [`Informasi akademik dan registrasi semester baru nomor ${i}`, target]);
    }

    // 20. Kalender Akademik (100 rows)
    console.log("⏳ Seeding kalender akademik...");
    for (let i = 1; i <= 100; i++) {
      await client.query(`
        INSERT INTO kalender_akademik (id_tahun_ajaran, nama_kegiatan, tanggal_mulai, tanggal_selesai)
        VALUES (2, $1, $2, $3);
      `, [`Kegiatan Akademik ${i}`, `2025-08-${String(1 + (i % 28)).padStart(2, "0")}`, `2025-08-${String(1 + (i % 28)).padStart(2, "0")}`]);
    }

    await client.query("COMMIT");
    console.log("🎉 SUCCESS: Seeding completed successfully inside transaction!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ ERROR: Seeding failed, transaction rolled back.");
    console.error(err);
  } finally {
    await client.end();
  }
}

seed();
