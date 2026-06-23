-- =============================================================================
-- TASK 5: REPORTING & DASHBOARD QUERIES (AGGREGATE FUNCTIONS)
-- File: query/task05_reporting.sql
-- Description: Complex analytical queries utilizing aggregate functions 
--              (COUNT, SUM, AVG, MAX, MIN) to solve university business problems.
-- Target DB: PostgreSQL
-- =============================================================================

-- =============================================================================
-- QUERY 1 (COUNT): Rekapitulasi Status Mahasiswa
-- Business Purpose: Membantu pihak rektorat dan dekanat menganalisis distribusi 
--                   status akademik mahasiswa (aktif, cuti, lulus, drop_out) 
--                   untuk setiap program studi di setiap fakultas.
-- =============================================================================
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
    jumlah_mahasiswa DESC;


-- =============================================================================
-- QUERY 2 (SUM): Laporan Pendapatan UKT
-- Business Purpose: Membantu biro keuangan universitas menghitung total realisasi 
--                   pendapatan dari pembayaran tagihan kategori UKT yang telah 
--                   lunas pada Semester Ganjil, dikelompokkan per Program Studi.
-- =============================================================================
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
    total_pendapatan_ukt DESC;


-- =============================================================================
-- QUERY 3 (AVG): Analisis Tingkat Kesulitan Mata Kuliah
-- Business Purpose: Membantu bagian kurikulum menganalisis mata kuliah yang paling 
--                   sulit berdasarkan rata-rata nilai akhir angka terkecil (AVG), 
--                   sehingga dapat dilakukan evaluasi metode pembelajaran.
-- =============================================================================
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
    rata_rata_nilai ASC;


-- =============================================================================
-- QUERY 4 (MAX & MIN): Top & Bottom Performers pada Mata Kuliah 'Sistem Basis Data'
-- Business Purpose: Mengidentifikasi mahasiswa dengan prestasi terbaik (MAX) 
--                   dan mahasiswa yang memerlukan perbaikan (MIN) khusus pada 
--                   mata kuliah 'Sistem Basis Data' untuk laporan kinerja kelas.
-- =============================================================================
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
    dk.nilai_akhir_angka DESC;


-- =============================================================================
-- QUERY 5 (Dashboard Kombinasi): Dashboard Beban Kerja Dosen
-- Business Purpose: Membantu bagian kepegawaian (HR) memantau produktivitas dan 
--                   beban kerja mengajar dosen berdasarkan jumlah kelas yang diajar 
--                   (COUNT) dan total SKS (SUM) pada Tahun Ajaran 2025/2026.
-- =============================================================================
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
    total_kelas_diajar DESC;
