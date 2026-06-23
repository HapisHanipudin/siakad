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

// Helpers for random generation
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

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 85% aktif, 8% lulus, 5% cuti, 2% drop_out
function getWeightedStatus(): string {
  const r = Math.random() * 100;
  if (r < 85) return "aktif";
  if (r < 93) return "lulus";
  if (r < 98) return "cuti";
  return "drop_out";
}

// Returns a random date within the last n months formatted as ISO string
function getRandomTimestamp(monthsAgo: number = 3): string {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * monthsAgo * 30 * 24 * 60 * 60 * 1000);
  return pastDate.toISOString();
}

// Calculate grade and letter grade
function calculateGrade(tugas: number, uts: number, uas: number) {
  const finalScore = tugas * 0.3 + uts * 0.3 + uas * 0.4;
  let letter: string | null = null;
  if (finalScore >= 80) letter = "A";
  else if (finalScore >= 70) letter = "B";
  else if (finalScore >= 60) letter = "C";
  else if (finalScore >= 50) letter = "D";
  else if (finalScore > 0) letter = "E";
  return { finalScore: Number(finalScore.toFixed(2)), letter };
}

// Optimized asynchronous bulk insert helper that automatically chunk-handles parameter limits (max 65,535 in pg)
async function bulkInsert(
  client: pg.Client,
  tableName: string,
  columns: string[],
  rows: any[][]
): Promise<any[]> {
  if (rows.length === 0) return [];

  const chunkSize = 500; // Safe chunk size
  const colNames = columns.join(", ");
  const results: any[] = [];

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const valuePlaceholders: string[] = [];
    const flatValues: any[] = [];

    let paramIndex = 1;
    for (const row of chunk) {
      const rowPlaceholders: string[] = [];
      for (const val of row) {
        rowPlaceholders.push(`$${paramIndex++}`);
        flatValues.push(val);
      }
      valuePlaceholders.push(`(${rowPlaceholders.join(", ")})`);
    }

    const query = `
      INSERT INTO ${tableName} (${colNames})
      VALUES ${valuePlaceholders.join(", ")}
      RETURNING *
    `;

    const res = await client.query(query, flatValues);
    results.push(...res.rows);
  }

  return results;
}

async function seed() {
  console.log("⚡ Connecting to Neon PostgreSQL...");
  const client = new pg.Client({
    connectionString: databaseUrl!,
    ssl: databaseUrl!.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    console.log("🚀 Starting database append-only seeding transaction...");
    await client.query("BEGIN");

    // ==========================================
    // 0. TEMPORARILY DISABLE OPERATIONAL TRIGGERS
    // ==========================================
    console.log("🔓 Temporarily disabling operational triggers to prevent seeding failures...");
    await client.query("ALTER TABLE detail_krs DISABLE TRIGGER trg_cek_prasyarat");
    await client.query("ALTER TABLE detail_krs DISABLE TRIGGER trg_update_kuota_kelas");
    await client.query("ALTER TABLE kelas DISABLE TRIGGER trg_cek_jadwal_dosen");

    // ==========================================
    // 1. FETCH EXISTING MASTER DATA (NO TRUNCATE)
    // ==========================================
    console.log("🔍 Fetching existing static master data arrays...");
    const faks = (await client.query("SELECT id_fakultas FROM fakultas")).rows;
    const prodis = (await client.query("SELECT id_program_studi FROM program_studi")).rows;
    const gedungs = (await client.query("SELECT id_gedung FROM gedung")).rows;
    const ruangans = (await client.query("SELECT id_ruangan, kapasitas FROM ruangan")).rows;
    const mks = (await client.query("SELECT id_mata_kuliah, sks FROM mata_kuliah")).rows;
    const kurikulums = (await client.query("SELECT id_kurikulum, id_program_studi FROM kurikulum")).rows;
    const tas = (await client.query("SELECT id_tahun_ajaran FROM tahun_ajaran")).rows;
    const kurikulumMks = (await client.query("SELECT id_kurikulum, id_mata_kuliah, semester, tipe_mata_kuliah FROM kurikulum_mata_kuliah")).rows;
    const kalenders = (await client.query("SELECT id_kalender_akademik FROM kalender_akademik")).rows;

    if (faks.length === 0 || prodis.length === 0 || mks.length === 0 || kurikulums.length === 0 || tas.length === 0) {
      throw new Error("Foundational static database schema not found. Please populate base master data first!");
    }

    // ==========================================
    // 2. DYNAMIC RECORD GENERATION & APPENDS
    // ==========================================

    // Fetch existing NIDNs, NIMs, and emails to prevent unique constraint violations
    const existingNidns = new Set<string>();
    const existingDosenNidnRes = await client.query("SELECT nidn FROM dosen");
    existingDosenNidnRes.rows.forEach(r => existingNidns.add(r.nidn));

    const existingNims = new Set<string>();
    const existingMahasiswaNimsRes = await client.query("SELECT nim FROM mahasiswa");
    existingMahasiswaNimsRes.rows.forEach(r => existingNims.add(r.nim));

    const existingEmails = new Set<string>();
    const existingEmailsRes = await client.query("SELECT email FROM users");
    existingEmailsRes.rows.forEach(r => existingEmails.add(r.email.toLowerCase()));

    const existingRombelNames = new Set<string>();
    const existingRombelsRes = await client.query("SELECT nama_rombel FROM rombel");
    existingRombelsRes.rows.forEach(r => existingRombelNames.add(r.nama_rombel.toLowerCase()));

    const existingClassCodes = new Set<string>();
    const existingClassCodesRes = await client.query("SELECT kode_kelas FROM kelas");
    existingClassCodesRes.rows.forEach(r => existingClassCodes.add(r.kode_kelas.toLowerCase()));

    // Dynamic Dosen (30 - 50 globally)
    const numDosen = getRandomInt(30, 50);
    console.log(`⏳ Seeding ${numDosen} dynamic dosen...`);
    const dosenRows: any[][] = [];

    for (let i = 0; i < numDosen; i++) {
      let nidn = "";
      do {
        // Prefix with 99 to prevent collisions
        nidn = `99${Math.floor(100000 + Math.random() * 900000)}`;
      } while (existingNidns.has(nidn));
      existingNidns.add(nidn);
      const randomFak = getRandomElement(faks).id_fakultas;
      const degree = getRandomElement(["S2", "S3"]);
      dosenRows.push([randomFak, nidn, getRandomName(), degree]);
    }
    const dosens = await bulkInsert(client, "dosen", ["id_fakultas", "nidn", "nama_dosen", "gelar"], dosenRows);

    // Dosen Users (emails format gen.dosen.{nidn}@upnvj.ac.id)
    const dosenUserRows: any[][] = [];
    for (const d of dosens) {
      let email = `gen.dosen.${d.nidn}@upnvj.ac.id`;
      // Ensure unique email
      let attempt = 0;
      while (existingEmails.has(email.toLowerCase())) {
        email = `gen.dosen.${d.nidn}.${attempt++}@upnvj.ac.id`;
      }
      existingEmails.add(email.toLowerCase());
      dosenUserRows.push([null, d.id_dosen, email, "dosen123", "dosen"]);
    }
    await bulkInsert(client, "users", ["id_mahasiswa", "id_dosen", "email", "password", "role"], dosenUserRows);

    // Dynamic Rombel & Kelompok (1 Rombel & Kelompok per Program Studi)
    console.log("⏳ Seeding rombel and kelompok per prodi...");
    const rombelRows: any[][] = [];
    let rombelCounter = 1;
    prodis.forEach(p => {
      let name = "";
      do {
        name = `R-${p.id_program_studi}-${rombelCounter++}`;
      } while (existingRombelNames.has(name.toLowerCase()) || name.length > 10);
      existingRombelNames.add(name.toLowerCase());
      rombelRows.push([p.id_program_studi, name, 2025]);
    });
    const rombels = await bulkInsert(client, "rombel", ["id_program_studi", "nama_rombel", "angkatan"], rombelRows);

    const kelompokRows = rombels.map(r => {
      const randomDosen = getRandomElement(dosens).id_dosen;
      return [r.id_rombel, randomDosen, `KLP-${r.nama_rombel}`];
    });
    const kelompoks = await bulkInsert(client, "kelompok", ["id_rombel", "id_dosen", "kode_kelompok"], kelompokRows);

    // Dynamic Mahasiswa (100 - 150 per Program Studi)
    console.log("⏳ Preparing dynamic mahasiswa rows...");
    const mahasiswaRows: any[][] = [];

    prodis.forEach(p => {
      const studentCount = getRandomInt(100, 150);
      const kur = kurikulums.find(k => k.id_program_studi === p.id_program_studi) || kurikulums[0];
      const rom = rombels.find(r => r.id_program_studi === p.id_program_studi) || rombels[0];
      const kel = kelompoks.find(k => k.id_rombel === rom.id_rombel) || kelompoks[0];

      for (let s = 0; s < studentCount; s++) {
        let nim = "";
        let attempts = 0;
        do {
          // Prefix with 99 to prevent collisions
          nim = `9925105${String(p.id_program_studi).padStart(2, "0")}${String(s + 1 + attempts).padStart(3, "0")}`;
          attempts++;
        } while (existingNims.has(nim));
        existingNims.add(nim);
        const nama = getRandomName();
        const status = getWeightedStatus();
        mahasiswaRows.push([p.id_program_studi, kur.id_kurikulum, kel.id_kelompok, nim, nama, status, 2025]);
      }
    });

    console.log(`⏳ Inserting ${mahasiswaRows.length} Mahasiswa in bulk...`);
    const mahasiswas = await bulkInsert(
      client,
      "mahasiswa",
      ["id_program_studi", "id_kurikulum", "id_kelompok", "nim", "nama_mahasiswa", "status_mahasiswa", "angkatan"],
      mahasiswaRows
    );

    // Mahasiswa Users (emails format gen.mhs.{nim}@upnvj.ac.id)
    console.log("⏳ Seeding mahasiswa users...");
    const studentUserRows: any[][] = [];
    for (const m of mahasiswas) {
      let email = `gen.mhs.${m.nim}@upnvj.ac.id`;
      let attempt = 0;
      while (existingEmails.has(email.toLowerCase())) {
        email = `gen.mhs.${m.nim}.${attempt++}@upnvj.ac.id`;
      }
      existingEmails.add(email.toLowerCase());
      studentUserRows.push([m.id_mahasiswa, null, email, "mhs123", "mahasiswa"]);
    }
    const studentUsers = await bulkInsert(client, "users", ["id_mahasiswa", "id_dosen", "email", "password", "role"], studentUserRows);

    // Dynamic Kelas (checking conflicts & managing quota)
    console.log("⏳ Seeding dynamic kelas...");
    const kurikulumMkMap = new Map<number, number[]>();
    kurikulumMks.forEach(kmk => {
      if (!kurikulumMkMap.has(kmk.id_kurikulum)) kurikulumMkMap.set(kmk.id_kurikulum, []);
      kurikulumMkMap.get(kmk.id_kurikulum)!.push(kmk.id_mata_kuliah);
    });

    const kelasRows: any[][] = [];
    const prodiKelasMap = new Map<number, number[]>();
    const lecturerSchedule = new Map<number, Set<string>>();
    let classCounter = 1;

    const randomTa = tas[0].id_tahun_ajaran;

    prodis.forEach(p => {
      const kur = kurikulums.find(k => k.id_program_studi === p.id_program_studi);
      if (!kur) return;
      const mkIds = kurikulumMkMap.get(kur.id_kurikulum) || [];
      const rom = rombels.find(r => r.id_program_studi === p.id_program_studi) || rombels[0];

      mkIds.forEach(idMk => {
        const ru = getRandomElement(ruangans);
        const kuota = Math.min(150, ru.kapasitas);

        // Find conflict-free schedule for lecturer
        let assignedDosenId = getRandomElement(dosens).id_dosen;
        let day = "Senin";
        let time = times[0];
        let foundSlot = false;

        for (const possibleDosen of dosens) {
          const scheds = lecturerSchedule.get(possibleDosen.id_dosen) || new Set();
          for (let attempt = 0; attempt < 10; attempt++) {
            const tempDay = getRandomElement(days);
            const tempTimeIdx = Math.floor(Math.random() * times.length);
            const slotKey = `${tempDay}-${tempTimeIdx}`;

            if (!scheds.has(slotKey)) {
              assignedDosenId = possibleDosen.id_dosen;
              day = tempDay;
              time = times[tempTimeIdx];
              scheds.add(slotKey);
              lecturerSchedule.set(possibleDosen.id_dosen, scheds);
              foundSlot = true;
              break;
            }
          }
          if (foundSlot) break;
        }

        let code = "";
        do {
          code = `G-${classCounter++}`;
        } while (existingClassCodes.has(code.toLowerCase()) || code.length > 10);
        existingClassCodes.add(code.toLowerCase());

        kelasRows.push([
          ru.id_ruangan,
          p.id_program_studi,
          rom.id_rombel,
          idMk,
          assignedDosenId,
          randomTa,
          code,
          kuota,
          "ganjil",
          time.mul,
          time.sel,
          day
        ]);
      });
    });

    const kelases = await bulkInsert(
      client,
      "kelas",
      ["id_ruangan", "id_program_studi", "id_rombel", "id_mata_kuliah", "id_dosen", "id_tahun_ajaran", "kode_kelas", "kuota", "semester_aktif", "jam_mulai", "jam_selesai", "hari"],
      kelasRows
    );

    kelases.forEach(kls => {
      if (!prodiKelasMap.has(kls.id_program_studi)) prodiKelasMap.set(kls.id_program_studi, []);
      prodiKelasMap.get(kls.id_program_studi)!.push(kls.id_kelas);
    });

    // Dynamic KRS (for each student)
    console.log("⏳ Seeding dynamic KRS...");
    const krsRows = mahasiswas.map(m => [
      m.id_mahasiswa,
      randomTa,
      "ganjil",
      "sah",
      "KRS Semester Ganjil (Append Seeder)"
    ]);
    const krses = await bulkInsert(client, "krs", ["id_mahasiswa", "id_tahun_ajaran", "semester_aktif", "status_krs", "catatan"], krsRows);

    // Dynamic Detail KRS (enrolling each student in 2-4 prodi classes)
    console.log("⏳ Seeding dynamic detail KRS...");
    const detailKrsRows: any[][] = [];
    mahasiswas.forEach(m => {
      const krsRecord = krses.find(k => k.id_mahasiswa === m.id_mahasiswa);
      if (!krsRecord) return;

      const prodiClasses = prodiKelasMap.get(m.id_program_studi) || [];
      if (prodiClasses.length === 0) return;

      const numClasses = getRandomInt(2, 4);
      const chosenClasses = new Set<number>();
      let attempts = 0;
      while (chosenClasses.size < Math.min(numClasses, prodiClasses.length) && attempts < 10) {
        chosenClasses.add(getRandomElement(prodiClasses));
        attempts++;
      }

      chosenClasses.forEach(classId => {
        const tugas = getRandomInt(65, 95);
        const uts = getRandomInt(60, 90);
        const uas = getRandomInt(60, 95);
        const { finalScore, letter } = calculateGrade(tugas, uts, uas);
        detailKrsRows.push([krsRecord.id_krs, classId, tugas, uts, uas, finalScore, letter]);
      });
    });

    const details = await bulkInsert(
      client,
      "detail_krs",
      ["id_krs", "id_kelas", "nilai_tugas", "nilai_uts", "nilai_uas", "nilai_akhir_angka", "nilai_akhir_huruf"],
      detailKrsRows
    );

    // Dynamic Pertemuan (3 per class)
    console.log("⏳ Seeding dynamic pertemuan...");
    const pertemuanRows: any[][] = [];
    kelases.forEach(kls => {
      pertemuanRows.push([kls.id_kelas, 1, "2025-09-08"]);
      pertemuanRows.push([kls.id_kelas, 2, "2025-09-15"]);
      pertemuanRows.push([kls.id_kelas, 3, "2025-09-22"]);
    });
    const pertemuans = await bulkInsert(client, "pertemuan", ["id_kelas", "nomor_pertemuan", "tanggal"], pertemuanRows);

    const classMeetingsMap = new Map<number, number[]>();
    pertemuans.forEach(p => {
      if (!classMeetingsMap.has(p.id_kelas)) classMeetingsMap.set(p.id_kelas, []);
      classMeetingsMap.get(p.id_kelas)!.push(p.id_pertemuan);
    });

    // Dynamic Presensi
    console.log("⏳ Seeding dynamic presensi...");
    const presensiRows: any[][] = [];
    details.forEach(d => {
      const meetings = classMeetingsMap.get(d.id_kelas) || [];
      meetings.forEach(pertId => {
        const status = Math.random() > 0.9 ? (Math.random() > 0.5 ? "sakit" : "izin") : "hadir";
        presensiRows.push([d.id_detail_krs, pertId, status]);
      });
    });
    await bulkInsert(client, "presensi", ["id_detail_krs", "id_pertemuan", "status_presensi"], presensiRows);

    // Dynamic Tagihan & Pembayaran
    console.log("⏳ Seeding dynamic tagihan & pembayaran...");
    const tagihanRows: any[][] = [];
    mahasiswas.forEach(m => {
      const nominal = getRandomElement([4500000, 5500000, 6000000, 7000000]);
      const status = Math.random() > 0.3 ? "lunas" : "belum";
      tagihanRows.push([m.id_mahasiswa, randomTa, "ganjil", "ukt", nominal, status, "2025-07-31"]);
    });

    const tagihans = await bulkInsert(
      client,
      "tagihan",
      ["id_mahasiswa", "id_tahun_ajaran", "semester_aktif", "tipe_tagihan", "nominal", "status_tagihan", "tenggat"],
      tagihanRows
    );

    const pembayaranRows: any[][] = [];
    tagihans.forEach(t => {
      if (t.status_tagihan === "lunas") {
        pembayaranRows.push([
          t.id_tagihan,
          getRandomTimestamp(4), // Random time over last 4 months
          t.nominal,
          "lunas"
        ]);
      }
    });
    await bulkInsert(client, "pembayaran", ["id_tagihan", "tanggal_bayar", "nominal_bayar", "status_pembayaran"], pembayaranRows);

    // Dynamic Log Aktivitas
    console.log("⏳ Seeding dynamic log_aktivitas...");
    const logRows = studentUsers.map(u => [
      u.id_user,
      "127.0.0.1",
      "Melakukan login dan pengisian KRS secara berkala"
    ]);
    await bulkInsert(client, "log_aktivitas", ["id_user", "ip_address", "aktivitas"], logRows);

    // Dynamic Pengumuman (10)
    console.log("⏳ Seeding dynamic pengumuman...");
    const adminUserRes = await client.query("SELECT id_user FROM users WHERE role = 'admin' LIMIT 1");
    const adminId = adminUserRes.rows.length > 0 ? adminUserRes.rows[0].id_user : 1;

    const pengumumanRows = Array.from({ length: 10 }).map((_, idx) => {
      const target = getRandomElement(["global", "prodi", "personal"]);
      return [
        null,
        adminId,
        `Informasi akademis tambahan ke-${idx + 1} seputar penyesuaian agenda kuliah semester berjalan.`,
        target,
        "2025-09-30"
      ];
    });
    await bulkInsert(client, "pengumuman", ["id_program_studi", "id_user", "isi_pengumuman", "target", "tanggal_berakhir"], pengumumanRows);

    // ==========================================
    // 3. RE-ENABLE TRIGGERS & COMMIT
    // ==========================================
    console.log("🔒 Re-enabling operational triggers...");
    await client.query("ALTER TABLE detail_krs ENABLE TRIGGER trg_cek_prasyarat");
    await client.query("ALTER TABLE detail_krs ENABLE TRIGGER trg_update_kuota_kelas");
    await client.query("ALTER TABLE kelas ENABLE TRIGGER trg_cek_jadwal_dosen");

    await client.query("COMMIT");
    console.log("🎉 SUCCESS: Append-only seeding completed successfully inside transaction!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ ERROR: Seeding failed, transaction rolled back.");
    console.error(err);
  } finally {
    await client.end();
  }
}

seed();
