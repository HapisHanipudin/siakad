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
  "Pane", "Batubara", "Hadi", "Wibowo", "Kurniawan", "Suharto", "Mulyadi", "Yusuf"
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

const URUTAN_NILAI = ['A', 'B', 'C', 'D', 'E', 'F'];

// Helper to check if a student satisfies prerequisites for a class's course
async function satisfiesPrereq(client: pg.Client, id_mahasiswa: number, id_kelas: number): Promise<boolean> {
  const classRes = await client.query("SELECT id_mata_kuliah FROM kelas WHERE id_kelas = $1", [id_kelas]);
  if (classRes.rows.length === 0) return false;
  const idMk = classRes.rows[0].id_mata_kuliah;

  const prereqs = await client.query(
    "SELECT id_prasyarat_mata_kuliah, nilai_min FROM prasyarat_mata_kuliah WHERE id_mata_kuliah = $1",
    [idMk]
  );
  if (prereqs.rows.length === 0) return true;

  for (const p of prereqs.rows) {
    const prId = p.id_prasyarat_mata_kuliah;
    const minGrade = p.nilai_min;

    const gradeRes = await client.query(`
      SELECT dk.nilai_akhir_huruf
      FROM detail_krs dk
      JOIN krs k ON dk.id_krs = k.id_krs
      JOIN kelas kl ON dk.id_kelas = kl.id_kelas
      WHERE k.id_mahasiswa = $1
        AND kl.id_mata_kuliah = $2
        AND dk.nilai_akhir_huruf IS NOT NULL
      ORDER BY array_position(ARRAY['A','B','C','D','E','F']::text[], dk.nilai_akhir_huruf::text) ASC
      LIMIT 1
    `, [id_mahasiswa, prId]);

    if (gradeRes.rows.length === 0) return false;
    const achievedGrade = gradeRes.rows[0].nilai_akhir_huruf;

    const achIdx = URUTAN_NILAI.indexOf(achievedGrade);
    const minIdx = URUTAN_NILAI.indexOf(minGrade);

    if (achIdx === -1 || minIdx === -1 || achIdx > minIdx) {
      return false;
    }
  }

  return true;
}

// Helper to check if a lecturer is already scheduled at the same time
async function hasLecturerConflict(
  client: pg.Client,
  id_dosen: number,
  hari: string,
  jam_mulai: string,
  jam_selesai: string
): Promise<boolean> {
  const conflictRes = await client.query(`
    SELECT 1 FROM kelas
    WHERE id_dosen = $1 
      AND hari = $2 
      AND (
        (jam_mulai, jam_selesai) OVERLAPS ($3::time, $4::time)
      )
  `, [id_dosen, hari, jam_mulai, jam_selesai]);
  return conflictRes.rows.length > 0;
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

    // ==========================================
    // 1. Custom Students (Group Members & Bagas)
    // ==========================================
    console.log("⏳ Seeding custom student group members and requests...");
    const customStudents = [
      { nama: "Given Elyada Bani", nim: "2510511046", email: "given.elyada@mahasiswa.upnvj.ac.id" },
      { nama: "Ahya Mujahid Almadani", nim: "2510511047", email: "ahya.mujahid@mahasiswa.upnvj.ac.id" },
      { nama: "Dimitri Putranto", nim: "2510511059", email: "dimitri.putranto.new@mahasiswa.upnvj.ac.id" },
      { nama: "Muhammad Hafizh Hanifuddin", nim: "2510511060", email: "hafizh.hanifuddin@mahasiswa.upnvj.ac.id" },
      { nama: "Muhammad Akbar Alfarizy", nim: "2510511068", email: "akbar.alfarizy@mahasiswa.upnvj.ac.id" },
      { nama: "Adri Bagas Witjaksono", nim: "2510511091", email: "adri.bagas@mahasiswa.upnvj.ac.id" },
      { nama: "Adrian Bagas Wicaksono", nim: "2510511092", email: "adrian.bagas@mahasiswa.upnvj.ac.id" }
    ];

    for (const student of customStudents) {
      const exists = await client.query("SELECT id_mahasiswa FROM mahasiswa WHERE nim = $1", [student.nim]);
      if (exists.rows.length === 0) {
        // 1. Insert Mahasiswa (Linked to prodi 1 (Informatika), kurikulum 1, kelompok 1)
        const mRes = await client.query(`
          INSERT INTO mahasiswa (id_program_studi, id_kurikulum, id_kelompok, nim, nama_mahasiswa, status_mahasiswa, angkatan)
          VALUES (1, 1, 1, $1, $2, 'aktif', 2025)
          RETURNING id_mahasiswa;
        `, [student.nim, student.nama]);
        const mId = mRes.rows[0].id_mahasiswa;

        // 2. Insert User
        await client.query(`
          INSERT INTO users (id_mahasiswa, id_dosen, email, password, role)
          VALUES ($1, NULL, $2, 'mhs123', 'mahasiswa')
        `, [mId, student.email]);

        // 3. Insert Tagihan UKT (Ganjil 2025/2026, id_tahun_ajaran = 2)
        await client.query(`
          INSERT INTO tagihan (id_mahasiswa, id_tahun_ajaran, semester_aktif, tipe_tagihan, nominal, status_tagihan, tenggat)
          VALUES ($1, 2, 'ganjil', 'ukt', 5500000.00, 'belum', '2025-07-31')
        `, [mId]);

        // 4. Insert KRS
        const kRes = await client.query(`
          INSERT INTO krs (id_mahasiswa, id_tahun_ajaran, semester_aktif, status_krs, catatan)
          VALUES ($1, 2, 'ganjil', 'sah', 'KRS Mahasiswa Baru (Custom)')
          RETURNING id_krs;
        `, [mId]);
        const kId = kRes.rows[0].id_krs;

        // 5. Insert Detail KRS (Take class 1 - IF-A-P1 and class 3 - IF-A-BD)
        const allowed1 = await satisfiesPrereq(client, mId, 1);
        if (allowed1) {
          await client.query(`
            INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas, nilai_akhir_angka, nilai_akhir_huruf)
            VALUES ($1, 1, 0, 0, 0, 0, NULL)
          `, [kId]);
        }

        const allowed2 = await satisfiesPrereq(client, mId, 3);
        if (allowed2) {
          await client.query(`
            INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas, nilai_akhir_angka, nilai_akhir_huruf)
            VALUES ($1, 3, 0, 0, 0, 0, NULL)
          `, [kId]);
        }
      }
    }
    console.log("✅ Seeded custom students successfully!");

    // ==========================================
    // 2. Bulk Random Record Expansion to 100 rows
    // ==========================================

    // Fetch existing identifiers
    const prodiRes = await client.query("SELECT id_program_studi FROM program_studi");
    const idProdis = prodiRes.rows.map(r => r.id_program_studi);

    const gedRes = await client.query("SELECT id_gedung FROM gedung");
    const idGedungs = gedRes.rows.map(r => r.id_gedung);
    const existingGedungCount = idGedungs.length;
    console.log(`⏳ Scaling Gedung to 20 rows...`);
    for (let i = existingGedungCount; i < 20; i++) {
      const idFakultas = (i % 2) + 1;
      const nameIdx = i % buildingNames.length;
      const buildingName = `Gedung ${buildingNames[nameIdx]} Extra`;
      const exists = await client.query("SELECT id_gedung FROM gedung WHERE nama_gedung = $1", [buildingName]);
      if (exists.rows.length === 0) {
        const res = await client.query(`
          INSERT INTO gedung (id_fakultas, nama_gedung)
          VALUES ($1, $2)
          RETURNING id_gedung;
        `, [idFakultas, buildingName]);
        idGedungs.push(res.rows[0].id_gedung);
      }
    }

    // Ruangan
    const ruaRes = await client.query("SELECT id_ruangan FROM ruangan");
    const idRuangans = ruaRes.rows.map(r => r.id_ruangan);
    const existingRuanganCount = idRuangans.length;
    console.log(`⏳ Scaling Ruangan to 50 rows...`);
    for (let i = existingRuanganCount; i < 50; i++) {
      const idGedung = idGedungs[i % idGedungs.length];
      const cap = getRandomElement([30, 40, 60]);
      const tipe = i % 3 === 0 ? "laboratorium" : "kelas_biasa";
      const roomName = `Ruang ${100 + i + 1} Extra`;
      const exists = await client.query("SELECT id_ruangan FROM ruangan WHERE nama_ruangan = $1", [roomName]);
      if (exists.rows.length === 0) {
        const res = await client.query(`
          INSERT INTO ruangan (id_gedung, nama_ruangan, kapasitas, tipe_ruangan)
          VALUES ($1, $2, $3, $4)
          RETURNING id_ruangan;
        `, [idGedung, roomName, cap, tipe]);
        idRuangans.push(res.rows[0].id_ruangan);
      }
    }

    // Mata Kuliah
    const matRes = await client.query("SELECT id_mata_kuliah FROM mata_kuliah");
    const idMataKuliahs = matRes.rows.map(r => r.id_mata_kuliah);
    const existingMkCount = idMataKuliahs.length;
    console.log(`⏳ Scaling Mata Kuliah to 100 rows...`);
    for (let i = existingMkCount; i < 100; i++) {
      const code = `MK-${String(1000 + i + 1).slice(-4)}`;
      const name = `${getRandomElement(subjectsBase)} ${String(i + 1).slice(-2)}`;
      const sks = getRandomElement([2, 3, 4]);
      const exists = await client.query("SELECT id_mata_kuliah FROM mata_kuliah WHERE kode_mata_kuliah = $1", [code]);
      if (exists.rows.length === 0) {
        const res = await client.query(`
          INSERT INTO mata_kuliah (kode_mata_kuliah, nama_mata_kuliah, sks)
          VALUES ($1, $2, $3)
          RETURNING id_mata_kuliah;
        `, [code, name, sks]);
        idMataKuliahs.push(res.rows[0].id_mata_kuliah);
      }
    }

    // Rombel
    const romRes = await client.query("SELECT id_rombel FROM rombel");
    const idRombels = romRes.rows.map(r => r.id_rombel);
    const existingRombelCount = idRombels.length;
    console.log(`⏳ Scaling Rombel to 100 rows...`);
    for (let i = existingRombelCount; i < 100; i++) {
      const idProdi = getRandomElement([1, 2, 3]);
      const romName = `RBL-${100 + i + 1}`;
      const exists = await client.query("SELECT id_rombel FROM rombel WHERE nama_rombel = $1", [romName]);
      if (exists.rows.length === 0) {
        const res = await client.query(`
          INSERT INTO rombel (id_program_studi, nama_rombel, angkatan)
          VALUES ($1, $2, 2025)
          RETURNING id_rombel;
        `, [idProdi, romName]);
        idRombels.push(res.rows[0].id_rombel);
      }
    }

    // Kurikulum Mata Kuliah links
    for (let i = existingMkCount; i < 100; i++) {
      const idMk = idMataKuliahs[i];
      const sem = 1 + (i % 8);
      const type = i % 4 === 0 ? "peminatan" : "wajib";
      await client.query(`
        INSERT INTO kurikulum_mata_kuliah (id_kurikulum, id_mata_kuliah, semester, tipe_mata_kuliah)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING;
      `, [1, idMk, sem, type]);
    }

    // Dosen
    const dosRes = await client.query("SELECT id_dosen, nidn FROM dosen");
    const idDosens = dosRes.rows.map(r => r.id_dosen);
    const nidns = new Set<string>(dosRes.rows.map(r => r.nidn));
    const existingDosenCount = idDosens.length;
    console.log(`⏳ Scaling Dosen to 100 rows...`);
    for (let i = existingDosenCount; i < 100; i++) {
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

    // Kelompok
    const kelRes = await client.query("SELECT id_kelompok FROM kelompok");
    const idKelompoks = kelRes.rows.map(r => r.id_kelompok);
    const existingKelompokCount = idKelompoks.length;
    console.log(`⏳ Scaling Kelompok to 50 rows...`);
    for (let i = existingKelompokCount; i < 50; i++) {
      const rombelId = idRombels[i % idRombels.length];
      const dosenId = idDosens[i % idDosens.length];
      const klpName = `KLP-${100 + i + 1}`;
      const exists = await client.query("SELECT id_kelompok FROM kelompok WHERE kode_kelompok = $1", [klpName]);
      if (exists.rows.length === 0) {
        const res = await client.query(`
          INSERT INTO kelompok (id_rombel, id_dosen, kode_kelompok)
          VALUES ($1, $2, $3)
          RETURNING id_kelompok;
        `, [rombelId, dosenId, klpName]);
        idKelompoks.push(res.rows[0].id_kelompok);
      }
    }

    // Mahasiswa
    const mhsRes = await client.query("SELECT id_mahasiswa, nim FROM mahasiswa");
    const idMahasiswas = mhsRes.rows.map(r => r.id_mahasiswa);
    const existingMhsCount = idMahasiswas.length;
    const studentData: { id: number; nim: string; nama: string }[] = [];
    console.log(`⏳ Scaling Mahasiswa to 100 rows...`);
    for (let i = existingMhsCount; i < 100; i++) {
      const prodi = getRandomElement([1, 2, 3]);
      const nim = `2510511${String(200 + i + 1).slice(-3)}`;
      const kelompokId = idKelompoks[i % idKelompoks.length];
      const nama = getRandomName();
      const res = await client.query(`
        INSERT INTO mahasiswa (id_program_studi, id_kurikulum, id_kelompok, nim, nama_mahasiswa, status_mahasiswa, angkatan)
        VALUES ($1, 1, $2, $3, $4, 'aktif'::status_mahasiswa, 2025)
        RETURNING id_mahasiswa;
      `, [prodi, kelompokId, nim, nama]);
      idMahasiswas.push(res.rows[0].id_mahasiswa);
      studentData.push({ id: res.rows[0].id_mahasiswa, nim, nama });
    }

    // Users
    console.log("⏳ Seeding additional users...");
    for (let i = existingDosenCount; i < 100; i++) {
      const dosenId = idDosens[i];
      const email = `dosen.large.${dosenId}@upnvj.ac.id`;
      const exists = await client.query("SELECT 1 FROM users WHERE email = $1", [email]);
      if (exists.rows.length === 0) {
        await client.query(`
          INSERT INTO users (id_mahasiswa, id_dosen, email, password, role)
          VALUES (NULL, $1, $2, 'dosen123', 'dosen'::enum_role);
        `, [dosenId, email]);
      }
    }
    const studentUserIds: number[] = [];
    for (let i = 0; i < studentData.length; i++) {
      const m = studentData[i];
      const email = `mhs.large.${m.nim}@mahasiswa.upnvj.ac.id`;
      const exists = await client.query("SELECT 1 FROM users WHERE email = $1", [email]);
      if (exists.rows.length === 0) {
        const res = await client.query(`
          INSERT INTO users (id_mahasiswa, id_dosen, email, password, role)
          VALUES ($1, NULL, $2, 'mhs123', 'mahasiswa'::enum_role)
          RETURNING id_user;
        `, [m.id, email]);
        studentUserIds.push(res.rows[0].id_user);
      }
    }

    // Kelas (respecting capacities and lecturer schedule conflicts)
    const klsRes = await client.query("SELECT id_kelas FROM kelas");
    const idKelases = klsRes.rows.map(r => r.id_kelas);
    const existingKelasCount = idKelases.length;
    console.log(`⏳ Scaling Kelas to 100 rows (checking capacity & schedule)...`);
    for (let i = existingKelasCount; i < 100; i++) {
      const ruanganId = idRuangans[i % idRuangans.length];
      const prodiId = getRandomElement([1, 2, 3]);
      const rombelId = idRombels[i % idRombels.length];
      const mkId = idMataKuliahs[i % idMataKuliahs.length];
      const dosenId = idDosens[i % idDosens.length];
      const taId = 2; // semester aktif ganjil 2025/2026
      const kode = `KLS-LG-${100 + i + 1}`;
      
      const exists = await client.query("SELECT id_kelas FROM kelas WHERE kode_kelas = $1", [kode]);
      if (exists.rows.length === 0) {
        // Enforce trg_validasi_kuota_ruangan rule (kuota <= kapasitas)
        const ruCapRes = await client.query("SELECT kapasitas FROM ruangan WHERE id_ruangan = $1", [ruanganId]);
        const capacity = ruCapRes.rows.length > 0 ? ruCapRes.rows[0].kapasitas : 30;
        const kuota = Math.min(30, capacity);

        // Avoid trg_cek_jadwal_dosen rule by finding a conflict-free day/time slot
        let day = "Senin";
        let time = times[0];
        let attempts = 0;
        let conflict = true;

        while (conflict && attempts < 10) {
          day = getRandomElement(days);
          time = getRandomElement(times);
          conflict = await hasLecturerConflict(client, dosenId, day, time.mul, time.sel);
          attempts++;
        }

        // If even after 10 attempts a conflict remains, skip this iteration or use a new dosen to prevent conflict
        if (conflict) {
          continue;
        }

        const res = await client.query(`
          INSERT INTO kelas (id_ruangan, id_program_studi, id_rombel, id_mata_kuliah, id_dosen, id_tahun_ajaran, kode_kelas, kuota, semester_aktif, jam_mulai, jam_selesai, hari)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ganjil'::semester_aktif, $9, $10, $11)
          RETURNING id_kelas;
        `, [ruanganId, prodiId, rombelId, mkId, dosenId, taId, kode, kuota, time.mul, time.sel, day]);
        idKelases.push(res.rows[0].id_kelas);
      }
    }

    // KRS
    const krsSelRes = await client.query("SELECT id_krs FROM krs");
    const idKrses = krsSelRes.rows.map(r => r.id_krs);
    const newKrsIds: number[] = [];
    console.log("⏳ Seeding additional KRS...");
    for (let i = 0; i < studentData.length; i++) {
      const mhsId = studentData[i].id;
      const taId = 2;
      const exists = await client.query("SELECT id_krs FROM krs WHERE id_mahasiswa = $1 AND id_tahun_ajaran = $2 AND semester_aktif = 'ganjil'", [mhsId, taId]);
      if (exists.rows.length === 0) {
        const res = await client.query(`
          INSERT INTO krs (id_mahasiswa, id_tahun_ajaran, semester_aktif, status_krs, catatan)
          VALUES ($1, $2, 'ganjil'::semester_aktif, 'sah'::status_krs, 'KRS disetujui Dosen Wali')
          RETURNING id_krs;
        `, [mhsId, taId]);
        idKrses.push(res.rows[0].id_krs);
        newKrsIds.push(res.rows[0].id_krs);
      }
    }

    // Detail KRS
    console.log("⏳ Seeding additional detail KRS (checking prerequisite triggers)...");
    const newDetailKrsIds: number[] = [];
    for (let i = 0; i < newKrsIds.length; i++) {
      const krsId = newKrsIds[i];
      const mhsId = studentData[i].id;
      
      // Select 2 classes. To prevent trg_cek_prasyarat violations, we find classes that have no prerequisites
      const safeClassesRes = await client.query(`
        SELECT k.id_kelas FROM kelas k
        LEFT JOIN prasyarat_mata_kuliah p ON k.id_mata_kuliah = p.id_mata_kuliah
        WHERE p.id_mata_kuliah IS NULL
        LIMIT 2
      `);

      if (safeClassesRes.rows.length >= 2) {
        const cls1 = safeClassesRes.rows[0].id_kelas;
        const cls2 = safeClassesRes.rows[1].id_kelas;

        const tugas1 = (60 + Math.random() * 35).toFixed(2);
        const uts1 = (60 + Math.random() * 35).toFixed(2);
        const uas1 = (60 + Math.random() * 35).toFixed(2);

        const tugas2 = (60 + Math.random() * 35).toFixed(2);
        const uts2 = (60 + Math.random() * 35).toFixed(2);
        const uas2 = (60 + Math.random() * 35).toFixed(2);

        // Check satisfiesPrereq helper before inserting
        const check1 = await satisfiesPrereq(client, mhsId, cls1);
        if (check1) {
          const res1 = await client.query(`
            INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
            RETURNING id_detail_krs;
          `, [krsId, cls1, tugas1, uts1, uas1]);
          if (res1.rows.length > 0) newDetailKrsIds.push(res1.rows[0].id_detail_krs);
        }

        const check2 = await satisfiesPrereq(client, mhsId, cls2);
        if (check2) {
          const res2 = await client.query(`
            INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
            RETURNING id_detail_krs;
          `, [krsId, cls2, tugas2, uts2, uas2]);
          if (res2.rows.length > 0) newDetailKrsIds.push(res2.rows[0].id_detail_krs);
        }
      }
    }

    // Pertemuan
    const perRes = await client.query("SELECT id_pertemuan FROM pertemuan");
    const idPertemuans = perRes.rows.map(r => r.id_pertemuan);
    const existingPertemuanCount = idPertemuans.length;
    console.log(`⏳ Scaling Pertemuan to 100 rows...`);
    for (let i = existingPertemuanCount; i < 100; i++) {
      const classId = idKelases[i % idKelases.length];
      const pertKe = 1 + Math.floor(i / 100);
      const tgl = `2025-09-${String(1 + (i % 28)).padStart(2, "0")}`;
      
      const exists = await client.query("SELECT id_pertemuan FROM pertemuan WHERE id_kelas = $1 AND nomor_pertemuan = $2", [classId, pertKe]);
      if (exists.rows.length === 0) {
        const res = await client.query(`
          INSERT INTO pertemuan (id_kelas, nomor_pertemuan, tanggal)
          VALUES ($1, $2, $3)
          RETURNING id_pertemuan;
        `, [classId, pertKe, tgl]);
        idPertemuans.push(res.rows[0].id_pertemuan);
      }
    }

    // Presensi
    console.log("⏳ Seeding additional presensi...");
    for (let i = 0; i < newDetailKrsIds.length; i++) {
      const detailKrsId = newDetailKrsIds[i];
      const pertId = idPertemuans[i % idPertemuans.length];
      const presenceStatus = Math.random() > 0.95 ? "alfa" : (Math.random() > 0.9 ? "izin" : "hadir");
      await client.query(`
        INSERT INTO presensi (id_detail_krs, id_pertemuan, status_presensi)
        VALUES ($1, $2, $3::status_presensi)
        ON CONFLICT DO NOTHING;
      `, [detailKrsId, pertId, presenceStatus]);
    }

    // Tagihan and Pembayaran
    const tagRes = await client.query("SELECT id_tagihan FROM tagihan");
    const idTagihans = tagRes.rows.map(r => r.id_tagihan);
    const existingTagihanCount = idTagihans.length;
    const newTagihanIds: number[] = [];
    console.log(`⏳ Scaling Tagihan to 100 rows...`);
    for (let i = 0; i < studentData.length; i++) {
      const mhsId = studentData[i].id;
      const taId = 2;
      const nominal = getRandomElement([3500000, 4200000, 5000000, 5500000, 6000000]);
      const status = Math.random() > 0.4 ? "lunas" : "belum";
      
      const exists = await client.query(`
        SELECT id_tagihan FROM tagihan 
        WHERE id_mahasiswa = $1 AND id_tahun_ajaran = $2 AND semester_aktif = 'ganjil' AND tipe_tagihan = 'ukt'
      `, [mhsId, taId]);

      if (exists.rows.length === 0) {
        const res = await client.query(`
          INSERT INTO tagihan (id_mahasiswa, id_tahun_ajaran, semester_aktif, tipe_tagihan, nominal, status_tagihan, tenggat)
          VALUES ($1, $2, 'ganjil'::semester_aktif, 'ukt'::tipe_tagihan, $3, $4::status_transaksi, '2025-07-31')
          RETURNING id_tagihan;
        `, [mhsId, taId, nominal, status]);
        idTagihans.push(res.rows[0].id_tagihan);
        newTagihanIds.push(res.rows[0].id_tagihan);
      }
    }

    console.log("⏳ Seeding additional pembayaran...");
    for (let i = 0; i < newTagihanIds.length; i++) {
      const tagihanId = newTagihanIds[i];
      await client.query(`
        INSERT INTO pembayaran (id_tagihan, nominal_bayar, status_pembayaran)
        VALUES ($1, (SELECT nominal FROM tagihan WHERE id_tagihan = $1), 'lunas'::status_transaksi);
      `, [tagihanId]);
    }

    // Log Aktivitas
    console.log("⏳ Seeding additional log aktivitas...");
    for (let i = 0; i < studentUserIds.length; i++) {
      const userId = studentUserIds[i];
      await client.query(`
        INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
        VALUES ($1, '127.0.0.1', 'Mengisi KRS dan mendaftarkan pertemuan mata kuliah');
      `, [userId]);
    }

    // Pengumuman
    const pengRes = await client.query("SELECT id_pengumuman FROM pengumuman");
    const existingPengCount = pengRes.rows.length;
    console.log(`⏳ Scaling Pengumuman to 100 rows...`);
    for (let i = existingPengCount; i < 100; i++) {
      const target = getRandomElement(["global", "prodi", "personal"]);
      await client.query(`
        INSERT INTO pengumuman (id_user, isi_pengumuman, target)
        VALUES (1, $1, $2::target_pengumuman);
      `, [`Informasi akademik dan registrasi semester baru nomor ${i + 1}`, target]);
    }

    // Kalender Akademik
    const kalRes = await client.query("SELECT id_kalender_akademik FROM kalender_akademik");
    const existingKalCount = kalRes.rows.length;
    console.log(`⏳ Scaling Kalender Akademik to 100 rows...`);
    for (let i = existingKalCount; i < 100; i++) {
      const activityName = `Kegiatan Akademik Extra ${i + 1}`;
      const exists = await client.query("SELECT 1 FROM kalender_akademik WHERE id_tahun_ajaran = 2 AND nama_kegiatan = $1", [activityName]);
      if (exists.rows.length === 0) {
        await client.query(`
          INSERT INTO kalender_akademik (id_tahun_ajaran, nama_kegiatan, tanggal_mulai, tanggal_selesai)
          VALUES (2, $1, $2, $3);
        `, [activityName, `2025-08-${String(1 + (i % 28)).padStart(2, "0")}`, `2025-08-${String(1 + (i % 28)).padStart(2, "0")}`]);
      }
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
