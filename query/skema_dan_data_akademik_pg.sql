-- =============================================================================
-- SCRIPT DDL & DML SISTEM INFORMASI AKADEMIK TERPADU (POSTGRESQL)
-- Memenuhi Spesifikasi Tugas Core DBA (24 Tabel & 150+ Baris Dummy Data)
-- Target Database: PostgreSQL
-- =============================================================================

-- =============================================================================
-- 0. DROP TABLES & TYPES (CLEANUP)
-- =============================================================================
DROP TABLE IF EXISTS log_aktivitas CASCADE;
DROP TABLE IF EXISTS pembayaran CASCADE;
DROP TABLE IF EXISTS tagihan CASCADE;
DROP TABLE IF EXISTS presensi CASCADE;
DROP TABLE IF EXISTS pertemuan CASCADE;
DROP TABLE IF EXISTS detail_krs CASCADE;
DROP TABLE IF EXISTS krs CASCADE;
DROP TABLE IF EXISTS kalender_akademik CASCADE;
DROP TABLE IF EXISTS pengumuman CASCADE;
DROP TABLE IF EXISTS kelas CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS mahasiswa CASCADE;
DROP TABLE IF EXISTS kelompok CASCADE;
DROP TABLE IF EXISTS dosen CASCADE;
DROP TABLE IF EXISTS kurikulum_mata_kuliah CASCADE;
DROP TABLE IF EXISTS kurikulum CASCADE;
DROP TABLE IF EXISTS rombel CASCADE;
DROP TABLE IF EXISTS prasyarat_mata_kuliah CASCADE;
DROP TABLE IF EXISTS mata_kuliah CASCADE;
DROP TABLE IF EXISTS ruangan CASCADE;
DROP TABLE IF EXISTS gedung CASCADE;
DROP TABLE IF EXISTS program_studi CASCADE;
DROP TABLE IF EXISTS tahun_ajaran CASCADE;
DROP TABLE IF EXISTS fakultas CASCADE;

DROP TYPE IF EXISTS tipe_ruangan CASCADE;
DROP TYPE IF EXISTS enum_role CASCADE;
DROP TYPE IF EXISTS status_mahasiswa CASCADE;
DROP TYPE IF EXISTS semester_aktif CASCADE;
DROP TYPE IF EXISTS status_krs CASCADE;
DROP TYPE IF EXISTS jenjang CASCADE;
DROP TYPE IF EXISTS nilai_huruf CASCADE;
DROP TYPE IF EXISTS tipe_mata_kuliah CASCADE;
DROP TYPE IF EXISTS status_presensi CASCADE;
DROP TYPE IF EXISTS tipe_tagihan CASCADE;
DROP TYPE IF EXISTS status_transaksi CASCADE;
DROP TYPE IF EXISTS target_pengumuman CASCADE;

-- =============================================================================
-- 1. CREATE ENUM TYPES (KHUSUS POSTGRESQL)
-- =============================================================================
CREATE TYPE tipe_ruangan AS ENUM ('kelas_biasa', 'laboratorium');
CREATE TYPE enum_role AS ENUM ('mahasiswa', 'dosen', 'admin');
CREATE TYPE status_mahasiswa AS ENUM ('aktif', 'cuti', 'lulus', 'drop_out');
CREATE TYPE semester_aktif AS ENUM ('ganjil', 'genap');
CREATE TYPE status_krs AS ENUM ('draft', 'menunggu', 'ditolak', 'sah');
CREATE TYPE jenjang AS ENUM ('D3', 'D4', 'S1', 'S2', 'S3');
CREATE TYPE nilai_huruf AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');
CREATE TYPE tipe_mata_kuliah AS ENUM ('wajib', 'peminatan');
CREATE TYPE status_presensi AS ENUM ('hadir', 'izin', 'sakit', 'alfa');
CREATE TYPE tipe_tagihan AS ENUM ('ukt', 'spi', 'denda');
CREATE TYPE status_transaksi AS ENUM ('belum', 'diverifikasi', 'lunas');
CREATE TYPE target_pengumuman AS ENUM ('global', 'prodi', 'personal');

-- =============================================================================
-- 2. STRUKTUR TABEL (DDL)
-- =============================================================================

CREATE TABLE fakultas (
    id_fakultas SERIAL PRIMARY KEY,
    nama_fakultas VARCHAR(100) NOT NULL
);

CREATE TABLE tahun_ajaran (
    id_tahun_ajaran SERIAL PRIMARY KEY,
    nama_tahun_ajaran VARCHAR(9) NOT NULL UNIQUE
);

CREATE TABLE mata_kuliah (
    id_mata_kuliah SERIAL PRIMARY KEY,
    kode_mata_kuliah VARCHAR(10) NOT NULL UNIQUE,
    nama_mata_kuliah VARCHAR(255) NOT NULL,
    sks INT NOT NULL
);

CREATE TABLE program_studi (
    id_program_studi SERIAL PRIMARY KEY,
    id_fakultas INT NOT NULL,
    nama_prodi VARCHAR(100) NOT NULL,
    jenjang jenjang NOT NULL,
    FOREIGN KEY (id_fakultas) REFERENCES fakultas(id_fakultas) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE gedung (
    id_gedung SERIAL PRIMARY KEY,
    id_fakultas INT NOT NULL,
    nama_gedung VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_fakultas) REFERENCES fakultas(id_fakultas) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE dosen (
    id_dosen SERIAL PRIMARY KEY,
    id_fakultas INT NOT NULL,
    nidn VARCHAR(20) NOT NULL UNIQUE,
    nama_dosen VARCHAR(100) NOT NULL,
    gelar jenjang NOT NULL,
    FOREIGN KEY (id_fakultas) REFERENCES fakultas(id_fakultas) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE ruangan (
    id_ruangan SERIAL PRIMARY KEY,
    id_gedung INT NOT NULL,
    nama_ruangan VARCHAR(255) NOT NULL,
    tipe_ruangan tipe_ruangan NOT NULL,
    kapasitas INT NOT NULL,
    FOREIGN KEY (id_gedung) REFERENCES gedung(id_gedung) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE prasyarat_mata_kuliah (
    id_mata_kuliah INT NOT NULL,
    id_prasyarat_mata_kuliah INT NOT NULL,
    nilai_min nilai_huruf,
    PRIMARY KEY (id_mata_kuliah, id_prasyarat_mata_kuliah),
    FOREIGN KEY (id_mata_kuliah) REFERENCES mata_kuliah(id_mata_kuliah) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_prasyarat_mata_kuliah) REFERENCES mata_kuliah(id_mata_kuliah) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE rombel (
    id_rombel SERIAL PRIMARY KEY,
    id_program_studi INT NOT NULL,
    nama_rombel VARCHAR(10) NOT NULL,
    angkatan INT NOT NULL,
    FOREIGN KEY (id_program_studi) REFERENCES program_studi(id_program_studi) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE kurikulum (
    id_kurikulum SERIAL PRIMARY KEY,
    id_program_studi INT NOT NULL,
    nama_kurikulum VARCHAR(100) NOT NULL,
    tahun_mulai INT NOT NULL,
    tahun_akhir INT NULL,
    status_kurikulum BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_program_studi) REFERENCES program_studi(id_program_studi) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE kurikulum_mata_kuliah (
    id_kurikulum INT NOT NULL,
    id_mata_kuliah INT NOT NULL,
    semester INT NOT NULL,
    tipe_mata_kuliah tipe_mata_kuliah NOT NULL,
    PRIMARY KEY (id_kurikulum, id_mata_kuliah),
    FOREIGN KEY (id_kurikulum) REFERENCES kurikulum(id_kurikulum) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_mata_kuliah) REFERENCES mata_kuliah(id_mata_kuliah) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE kelompok (
    id_kelompok SERIAL PRIMARY KEY,
    id_rombel INT NOT NULL,
    id_dosen INT NOT NULL,
    kode_kelompok VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_rombel) REFERENCES rombel(id_rombel) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_dosen) REFERENCES dosen(id_dosen) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE mahasiswa (
    id_mahasiswa SERIAL PRIMARY KEY,
    id_program_studi INT NOT NULL,
    id_kurikulum INT NOT NULL,
    id_kelompok INT NOT NULL,
    nim VARCHAR(20) NOT NULL UNIQUE,
    nama_mahasiswa VARCHAR(255) NOT NULL,
    status_mahasiswa status_mahasiswa DEFAULT 'aktif',
    angkatan INT NOT NULL,
    FOREIGN KEY (id_program_studi) REFERENCES program_studi(id_program_studi) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_kurikulum) REFERENCES kurikulum(id_kurikulum) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_kelompok) REFERENCES kelompok(id_kelompok) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    id_mahasiswa INT NULL UNIQUE,
    id_dosen INT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role enum_role NOT NULL,
    FOREIGN KEY (id_mahasiswa) REFERENCES mahasiswa(id_mahasiswa) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_dosen) REFERENCES dosen(id_dosen) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE kelas (
    id_kelas SERIAL PRIMARY KEY,
    id_ruangan INT NOT NULL,
    id_program_studi INT NOT NULL,
    id_rombel INT NULL,
    id_mata_kuliah INT NOT NULL,
    id_dosen INT NOT NULL,
    id_tahun_ajaran INT NOT NULL,
    kode_kelas VARCHAR(10) NOT NULL,
    kuota INT NOT NULL,
    semester_aktif semester_aktif NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    hari VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_ruangan) REFERENCES ruangan(id_ruangan) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_program_studi) REFERENCES program_studi(id_program_studi) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_rombel) REFERENCES rombel(id_rombel) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_mata_kuliah) REFERENCES mata_kuliah(id_mata_kuliah) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_dosen) REFERENCES dosen(id_dosen) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_tahun_ajaran) REFERENCES tahun_ajaran(id_tahun_ajaran) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE pengumuman (
    id_pengumuman SERIAL PRIMARY KEY,
    id_program_studi INT NULL,
    id_user INT NULL,
    isi_pengumuman TEXT NOT NULL,
    target target_pengumuman DEFAULT 'global',
    tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_berakhir TIMESTAMP NULL,
    FOREIGN KEY (id_program_studi) REFERENCES program_studi(id_program_studi) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE kalender_akademik (
    id_kalender_akademik SERIAL PRIMARY KEY,
    id_tahun_ajaran INT NOT NULL,
    nama_kegiatan VARCHAR(255) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    FOREIGN KEY (id_tahun_ajaran) REFERENCES tahun_ajaran(id_tahun_ajaran) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE krs (
    id_krs SERIAL PRIMARY KEY,
    id_mahasiswa INT NOT NULL,
    id_tahun_ajaran INT NOT NULL,
    semester_aktif semester_aktif NOT NULL,
    status_krs status_krs NOT NULL,
    catatan TEXT NULL,
    FOREIGN KEY (id_mahasiswa) REFERENCES mahasiswa(id_mahasiswa) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tahun_ajaran) REFERENCES tahun_ajaran(id_tahun_ajaran) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE detail_krs (
    id_detail_krs SERIAL PRIMARY KEY,
    id_krs INT NOT NULL,
    id_kelas INT NOT NULL,
    nilai_tugas DECIMAL(5,2) DEFAULT 0.00,
    nilai_uts DECIMAL(5,2) DEFAULT 0.00,
    nilai_uas DECIMAL(5,2) DEFAULT 0.00,
    nilai_akhir_angka DECIMAL(5,2) DEFAULT 0.00,
    nilai_akhir_huruf nilai_huruf NULL,
    CONSTRAINT unique_krs_kelas UNIQUE (id_krs, id_kelas),
    FOREIGN KEY (id_krs) REFERENCES krs(id_krs) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE pertemuan (
    id_pertemuan SERIAL PRIMARY KEY,
    id_kelas INT NOT NULL,
    nomor_pertemuan INT NOT NULL,
    tanggal DATE NOT NULL,
    CONSTRAINT unique_kelas_pertemuan UNIQUE (id_kelas, nomor_pertemuan),
    FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE presensi (
    id_presensi SERIAL PRIMARY KEY,
    id_detail_krs INT NOT NULL,
    id_pertemuan INT NOT NULL,
    status_presensi status_presensi NOT NULL,
    CONSTRAINT unique_detail_pertemuan UNIQUE (id_detail_krs, id_pertemuan),
    FOREIGN KEY (id_detail_krs) REFERENCES detail_krs(id_detail_krs) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_pertemuan) REFERENCES pertemuan(id_pertemuan) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE tagihan (
    id_tagihan SERIAL PRIMARY KEY,
    id_mahasiswa INT NOT NULL,
    id_tahun_ajaran INT NOT NULL,
    semester_aktif semester_aktif NOT NULL,
    tipe_tagihan tipe_tagihan NOT NULL,
    nominal DECIMAL(10,2) NOT NULL,
    status_tagihan status_transaksi NOT NULL,
    tenggat DATE NOT NULL,
    FOREIGN KEY (id_mahasiswa) REFERENCES mahasiswa(id_mahasiswa) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tahun_ajaran) REFERENCES tahun_ajaran(id_tahun_ajaran) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE pembayaran (
    id_pembayaran SERIAL PRIMARY KEY,
    id_tagihan INT NOT NULL,
    tanggal_bayar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nominal_bayar DECIMAL(10,2) NOT NULL,
    status_pembayaran status_transaksi NOT NULL,
    FOREIGN KEY (id_tagihan) REFERENCES tagihan(id_tagihan) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE log_aktivitas (
    id_log SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    aktivitas VARCHAR(255) NOT NULL,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- 3. DATA DUMMY (DML) - MINIMAL 150+ TOTAL BARIS DATA BERIKATAN
-- =============================================================================

INSERT INTO fakultas (nama_fakultas) VALUES
('Fakultas Ilmu Komputer'),
('Fakultas Ekonomi dan Bisnis'),
('Fakultas Teknik'),
('Fakultas Kedokteran'),
('Fakultas Ilmu Sosial dan Ilmu Politik');

INSERT INTO tahun_ajaran (nama_tahun_ajaran) VALUES
('2024/2025'),
('2025/2026'),
('2026/2027');

INSERT INTO mata_kuliah (kode_mata_kuliah, nama_mata_kuliah, sks) VALUES
('IF101', 'Dasar-Dasar Pemrograman', 3),
('IF102', 'Struktur Data', 3),
('IF201', 'Sistem Basis Data', 4),
('IF202', 'Pemrograman Web', 3),
('IF301', 'Rekayasa Perangkat Lunak', 3),
('SI101', 'Pengantar Sistem Informasi', 2),
('SI201', 'Analisis dan Perancangan Sistem', 3),
('MN101', 'Pengantar Manajemen', 3),
('MN202', 'Manajemen Keuangan', 3),
('TE101', 'Rangkaian Digital', 3);

INSERT INTO program_studi (id_fakultas, nama_prodi, jenjang) VALUES
(1, 'Informatika', 'S1'),
(1, 'Sistem Informasi', 'S1'),
(2, 'Manajemen', 'S1'),
(2, 'Akuntansi', 'S1'),
(3, 'Teknik Elektro', 'S1');

INSERT INTO gedung (id_fakultas, nama_gedung) VALUES
(1, 'Gedung Ki Hajar Dewantara (FIK)'),
(1, 'Gedung Yos Sudarso'),
(2, 'Gedung MH Thamrin'),
(3, 'Gedung Sudirman');

INSERT INTO dosen (id_fakultas, nidn, nama_dosen, gelar) VALUES
(1, '0411028801', 'Dr. Aris Tri Jaka, S.Kom., M.T.', 'S3'),
(1, '0423058502', 'Ira Herawati, M.T.', 'S2'),
(2, '0412127903', 'Prof. Bambang Utomo, S.E., M.M.', 'S3'),
(2, '0415088204', 'Rina Wijayanti, M.Ak.', 'S2'),
(3, '0409098905', 'Eko Prasetyo, M.Eng.', 'S2'),
(1, '0401019006', 'Deni Ramdani, M.Kom.', 'S2');

INSERT INTO ruangan (id_gedung, nama_ruangan, tipe_ruangan, kapasitas) VALUES
(1, 'Ruang Teori 101', 'kelas_biasa', 40),
(1, 'Ruang Teori 102', 'kelas_biasa', 40),
(1, 'Laboratorium Basis Data', 'laboratorium', 30),
(1, 'Laboratorium Rekayasa Perangkat Lunak', 'laboratorium', 30),
(3, 'Ruang FEB 201', 'kelas_biasa', 50),
(3, 'Ruang FEB 202', 'kelas_biasa', 50),
(4, 'Laboratorium Elektronika', 'laboratorium', 25),
(2, 'Auditorium Utama', 'kelas_biasa', 150);

INSERT INTO prasyarat_mata_kuliah (id_mata_kuliah, id_prasyarat_mata_kuliah, nilai_min) VALUES
(2, 1, 'C'), 
(4, 1, 'C'), 
(5, 7, 'C'); 

INSERT INTO rombel (id_program_studi, nama_rombel, angkatan) VALUES
(1, 'IF-A 2025', 2025),
(1, 'IF-B 2025', 2025),
(2, 'SI-A 2025', 2025),
(3, 'MN-A 2025', 2025),
(1, 'IF-A 2024', 2024),
(2, 'SI-A 2024', 2024);

INSERT INTO kurikulum (id_program_studi, nama_kurikulum, tahun_mulai, tahun_akhir, status_kurikulum) VALUES
(1, 'Kurikulum Merdeka Informatika 2024', 2024, 2028, TRUE),
(2, 'Kurikulum Berbasis Kompetensi SI 2024', 2024, 2028, TRUE),
(3, 'Kurikulum Nasional Manajemen 2025', 2025, 2029, TRUE),
(5, 'Kurikulum Inti Teknik Elektro', 2024, 2028, TRUE);

INSERT INTO kurikulum_mata_kuliah (id_kurikulum, id_mata_kuliah, semester, tipe_mata_kuliah) VALUES
(1, 1, 1, 'wajib'),
(1, 2, 2, 'wajib'),
(1, 3, 3, 'wajib'),
(1, 4, 3, 'wajib'),
(1, 5, 4, 'peminatan'),
(2, 6, 1, 'wajib'),
(2, 7, 3, 'wajib'),
(2, 3, 3, 'wajib'),
(3, 8, 1, 'wajib'),
(3, 9, 2, 'wajib'),
(4, 10, 2, 'wajib'),
(1, 10, 4, 'peminatan');

INSERT INTO kelompok (id_rombel, id_dosen, kode_kelompok) VALUES
(1, 1, 'PA-IF-A25'),
(2, 2, 'PA-IF-B25'),
(3, 6, 'PA-SI-A25'),
(4, 3, 'PA-MN-A25'),
(5, 1, 'PA-IF-A24');

INSERT INTO mahasiswa (id_program_studi, id_kurikulum, id_kelompok, nim, nama_mahasiswa, status_mahasiswa, angkatan) VALUES
(1, 1, 1, '2510511001', 'Dimitri Putranto', 'aktif', 2025),
(1, 1, 1, '2510511002', 'Ahmad Farhan', 'aktif', 2025),
(1, 1, 2, '2510511003', 'Siti Amalia', 'aktif', 2025),
(1, 1, 2, '2510511004', 'Rizky Ramadhan', 'cuti', 2025),
(2, 2, 3, '2510512001', 'Budi Santoso', 'aktif', 2025),
(2, 2, 3, '2510512002', 'Citra Lestari', 'aktif', 2025),
(3, 3, 4, '2510521001', 'Dedi Wijaya', 'aktif', 2025),
(3, 3, 4, '2510521002', 'Eka Putri', 'lulus', 2025),
(1, 1, 5, '2410511015', 'Fikri Haikal', 'aktif', 2024),
(1, 1, 5, '2410511016', 'Gita Gutawa', 'aktif', 2024),
(2, 2, 3, '2410512030', 'Hendra Wijaya', 'drop_out', 2024),
(1, 1, 1, '2510511009', 'Myshaa Adristi', 'aktif', 2025);

INSERT INTO users (id_mahasiswa, id_dosen, email, password, role) VALUES
(NULL, NULL, 'admin.puskom@upnvj.ac.id', 'hash_admin_123', 'admin'),
(1, NULL, 'dimitri.putranto@mahasiswa.upnvj.ac.id', 'hash_dimitri55', 'mahasiswa'),
(2, NULL, 'ahmad.farhan@mahasiswa.upnvj.ac.id', 'hash_farhan12', 'mahasiswa'),
(3, NULL, 'siti.amalia@mahasiswa.upnvj.ac.id', 'hash_siti990', 'mahasiswa'),
(5, NULL, 'budi.santoso@mahasiswa.upnvj.ac.id', 'hash_budi88', 'mahasiswa'),
(12, NULL, 'myshaa.adristi@mahasiswa.upnvj.ac.id', 'hash_mysh123', 'mahasiswa'),
(NULL, 1, 'aris.trijaka@dosen.upnvj.ac.id', 'hash_doc_aris', 'dosen'),
(NULL, 2, 'ira.herawati@dosen.upnvj.ac.id', 'hash_doc_ira', 'dosen'),
(NULL, 3, 'bambang.utomo@dosen.upnvj.ac.id', 'hash_doc_bam', 'dosen'),
(NULL, 6, 'deni.ramdani@dosen.upnvj.ac.id', 'hash_doc_deni', 'dosen'),
(4, NULL, 'rizky.ramadhan@mahasiswa.upnvj.ac.id', 'pass_rizky', 'mahasiswa'),
(6, NULL, 'citra.lestari@mahasiswa.upnvj.ac.id', 'pass_citra', 'mahasiswa'),
(7, NULL, 'dedi.wijaya@mahasiswa.upnvj.ac.id', 'pass_dedi', 'mahasiswa'),
(8, NULL, 'eka.putri@mahasiswa.upnvj.ac.id', 'pass_eka', 'mahasiswa'),
(9, NULL, 'fikri.haikal@mahasiswa.upnvj.ac.id', 'pass_fikri', 'mahasiswa');

INSERT INTO kelas (id_ruangan, id_program_studi, id_rombel, id_mata_kuliah, id_dosen, id_tahun_ajaran, kode_kelas, kuota, semester_aktif, jam_mulai, jam_selesai, hari) VALUES
(1, 1, 1, 1, 1, 2, 'IF-A-P1', 40, 'ganjil', '08:00:00', '10:30:00', 'Senin'),
(2, 1, 2, 1, 2, 2, 'IF-B-P1', 40, 'ganjil', '10:40:00', '13:10:00', 'Senin'),
(3, 1, 1, 3, 1, 2, 'IF-A-BD', 30, 'ganjil', '08:00:00', '11:20:00', 'Selasa'),
(4, 1, 2, 4, 6, 2, 'IF-B-PW', 30, 'ganjil', '13:30:00', '16:00:00', 'Rabu'),
(5, 2, 3, 6, 6, 2, 'SI-A-PSI', 45, 'ganjil', '08:00:00', '09:40:00', 'Kamis'),
(3, 2, 3, 3, 2, 2, 'SI-A-BD', 30, 'ganjil', '10:00:00', '13:20:00', 'Kamis'),
(6, 3, 4, 8, 3, 2, 'MN-A-PM', 50, 'ganjil', '08:00:00', '10:30:00', 'Jumat'),
(1, 1, 5, 5, 1, 1, 'IF-A24-RPL', 35, 'genap', '13:30:00', '16:00:00', 'Selasa');

INSERT INTO pengumuman (id_program_studi, id_user, isi_pengumuman, target, tanggal_berakhir) VALUES
(NULL, 1, 'Selamat Datang Mahasiswa Baru UPNVJ Tahun Ajaran 2025/2026!', 'global', '2025-09-30 23:59:59'),
(1, 1, 'Pengisian KRS Utama Prodi Informatika dibuka s.d 20 Agustus 2025.', 'prodi', '2025-08-20 23:59:59'),
(2, 1, 'Diberitahukan pergeseran ruang kuliah untuk SI-A Angkatan 2025.', 'prodi', '2025-09-10 17:00:00'),
(NULL, 7, 'Tugas Besar Basis Data dikumpulkan maksimal Pertemuan 15 via Eluon.', 'global', '2025-12-15 23:59:59'),
(1, 1, 'Evaluasi Tengah Semester Kurikulum Informatika Berjalan.', 'prodi', '2025-11-10 23:59:59');

INSERT INTO kalender_akademik (id_tahun_ajaran, nama_kegiatan, tanggal_mulai, tanggal_selesai) VALUES
(2, 'Pembayaran UKT Semester Ganjil', '2025-07-01', '2025-07-31'),
(2, 'Masa Pengisian KRS Mahasiswa', '2025-08-01', '2025-08-15'),
(2, 'Perkuliahan Efektif Ganjil (Bagian 1)', '2025-09-01', '2025-10-24'),
(2, 'Ujian Tengah Semester (UTS)', '2025-10-27', '2025-11-07'),
(2, 'Ujian Akhir Semester (UAS)', '2026-01-05', '2026-01-16');

INSERT INTO krs (id_mahasiswa, id_tahun_ajaran, semester_aktif, status_krs, catatan) VALUES
(1, 2, 'ganjil', 'sah', 'KRS disetujui Dosen Wali'),
(2, 2, 'ganjil', 'sah', 'Disetujui'),
(3, 2, 'ganjil', 'sah', 'OK'),
(5, 2, 'ganjil', 'sah', 'Sesuai kuota'),
(6, 2, 'ganjil', 'menunggu', 'Menunggu verifikasi'),
(7, 2, 'ganjil', 'draft', 'Belum diajukan'),
(9, 1, 'genap', 'sah', 'KRS Semester Lalu'),
(10, 1, 'genap', 'sah', 'KRS Semester Lalu'),
(12, 2, 'ganjil', 'sah', 'KRS Aman');

INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas, nilai_akhir_angka, nilai_akhir_huruf) VALUES
(1, 1, 85.00, 80.00, 90.00, 85.50, 'A'), 
(1, 3, 90.00, 85.00, 88.00, 87.50, 'A'), 
(2, 1, 75.00, 70.00, 80.00, 75.50, 'B'),
(2, 3, 80.00, 78.00, 85.00, 81.40, 'A'),
(3, 2, 88.00, 82.00, 80.00, 82.60, 'A'),
(4, 5, 70.00, 65.00, 75.00, 70.50, 'B'),
(4, 6, 85.00, 80.00, 78.00, 80.50, 'A'),
(5, 5, 0.00, 0.00, 0.00, 0.00, NULL),
(5, 6, 0.00, 0.00, 0.00, 0.00, NULL),
(7, 8, 80.00, 75.00, 85.00, 80.50, 'A'),
(8, 8, 92.00, 90.00, 95.00, 92.60, 'A'),
(9, 1, 88.00, 84.00, 92.00, 88.40, 'A'),
(9, 3, 85.00, 80.00, 89.00, 85.10, 'A'),
(6, 5, 0.00, 0.00, 0.00, 0.00, NULL);

INSERT INTO pertemuan (id_kelas, nomor_pertemuan, tanggal) VALUES
(1, 1, '2025-09-01'),
(1, 2, '2025-09-08'),
(1, 3, '2025-09-15'),
(3, 1, '2025-09-02'),
(3, 2, '2025-09-09'),
(5, 1, '2025-09-04'),
(5, 2, '2025-09-11'),
(6, 1, '2025-09-04'),
(7, 1, '2025-09-05'),
(8, 1, '2025-02-11'),
(8, 2, '2025-02-18'),
(3, 3, '2025-09-16');

INSERT INTO presensi (id_detail_krs, id_pertemuan, status_presensi) VALUES
(1, 1, 'hadir'),
(1, 2, 'hadir'),
(1, 3, 'hadir'),
(2, 1, 'hadir'),
(2, 2, 'izin'),
(2, 3, 'hadir'),
(3, 4, 'hadir'),
(3, 5, 'sakit'),
(4, 4, 'hadir'),
(4, 5, 'hadir'),
(6, 6, 'hadir'),
(7, 8, 'hadir'),
(10, 10, 'hadir'),
(11, 10, 'hadir'),
(1, 12, 'hadir');

INSERT INTO tagihan (id_mahasiswa, id_tahun_ajaran, semester_aktif, tipe_tagihan, nominal, status_tagihan, tenggat) VALUES
(1, 2, 'ganjil', 'ukt', 5500000.00, 'lunas', '2025-07-31'),
(2, 2, 'ganjil', 'ukt', 5500000.00, 'lunas', '2025-07-31'),
(3, 2, 'ganjil', 'ukt', 4200000.00, 'lunas', '2025-07-31'),
(4, 2, 'ganjil', 'ukt', 5500000.00, 'belum', '2025-07-31'),
(5, 2, 'ganjil', 'ukt', 6000000.00, 'diverifikasi', '2025-07-31'),
(6, 2, 'ganjil', 'ukt', 6000000.00, 'belum', '2025-07-31'),
(7, 2, 'ganjil', 'ukt', 3500000.00, 'lunas', '2025-07-31'),
(9, 2, 'ganjil', 'ukt', 5000000.00, 'lunas', '2025-07-31'),
(10, 2, 'ganjil', 'ukt', 5000000.00, 'lunas', '2025-07-31'),
(1, 2, 'ganjil', 'denda', 50000.00, 'lunas', '2025-08-31'),
(12, 2, 'ganjil', 'ukt', 5500000.00, 'lunas', '2025-07-31'),
(2, 2, 'ganjil', 'denda', 100000.00, 'belum', '2025-08-31');

INSERT INTO pembayaran (id_tagihan, nominal_bayar, status_pembayaran) VALUES
(1, 5500000.00, 'lunas'),
(2, 5500000.00, 'lunas'),
(3, 4200000.00, 'lunas'),
(5, 6000000.00, 'diverifikasi'),
(7, 3500000.00, 'lunas'),
(8, 5000000.00, 'lunas'),
(9, 5000000.00, 'lunas'),
(10, 50000.00, 'lunas'),
(11, 5500000.00, 'lunas'),
(4, 2000000.00, 'belum');

INSERT INTO log_aktivitas (id_user, ip_address, aktivitas) VALUES
(2, '192.168.1.10', 'Login Mahasiswa - Dimitri Putranto'),
(2, '192.168.1.10', 'Mengisi KRS Semester Ganjil 2025/2026'),
(1, '10.0.2.15', 'Login Admin Puskom'),
(1, '10.0.2.15', 'Membuat Kelas Baru IF-A-P1'),
(7, '172.16.5.4', 'Login Dosen - Aris Tri Jaka'),
(7, '172.16.5.4', 'Menyetujui KRS Mahasiswa - Dimitri Putranto'),
(2, '192.168.1.10', 'Melihat Jadwal Kuliah Mingguan'),
(3, '192.168.1.12', 'Login Mahasiswa - Ahmad Farhan'),
(3, '192.168.1.12', 'Mengisi KRS Ganjil'),
(6, '192.168.1.44', 'Login Mahasiswa - Myshaa Adristi'),
(6, '192.168.1.44', 'Melihat Tagihan UKT Ganjil'),
(8, '172.16.5.9', 'Login Dosen - Ira Herawati'),
(2, '192.168.1.10', 'Melihat Nilai Akhir Semester Ganjil'),
(1, '10.0.2.15', 'Publish Pengumuman KRS Utama'),
(7, '172.16.5.4', 'Menginput Nilai Tugas Kelas IF-A-BD');
