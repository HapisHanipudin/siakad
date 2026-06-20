
CREATE DATABASE IF NOT EXISTS akademik_upnvj;
USE akademik_upnvj;

-- Hapus tabel jika sudah ada untuk menghindari error (urut dari yang memiliki FK paling banyak)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS log_aktivitas;
DROP TABLE IF EXISTS pembayaran;
DROP TABLE IF EXISTS tagihan;
DROP TABLE IF EXISTS presensi;
DROP TABLE IF EXISTS pertemuan;
DROP TABLE IF EXISTS detail_krs;
DROP TABLE IF EXISTS krs;
DROP TABLE IF EXISTS kalender_akademik;
DROP TABLE IF EXISTS pengumuman;
DROP TABLE IF EXISTS kelas;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS mahasiswa;
DROP TABLE IF EXISTS kelompok;
DROP TABLE IF EXISTS dosen;
DROP TABLE IF EXISTS kurikulum_mata_kuliah;
DROP TABLE IF EXISTS kurikulum;
DROP TABLE IF EXISTS rombel;
DROP TABLE IF EXISTS prasyarat_mata_kuliah;
DROP TABLE IF EXISTS mata_kuliah;
DROP TABLE IF EXISTS ruangan;
DROP TABLE IF EXISTS gedung;
DROP TABLE IF EXISTS program_studi;
DROP TABLE IF EXISTS tahun_ajaran;
DROP TABLE IF EXISTS fakultas;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. STRUKTUR TABEL (DDL)
-- =============================================================================

-- Tabel 1: Fakultas
CREATE TABLE fakultas (
    id_fakultas INT AUTO_INCREMENT PRIMARY KEY,
    nama_fakultas VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Tabel 2: Tahun Ajaran
CREATE TABLE tahun_ajaran (
    id_tahun_ajaran INT AUTO_INCREMENT PRIMARY KEY,
    nama_tahun_ajaran VARCHAR(9) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Tabel 3: Mata Kuliah
CREATE TABLE mata_kuliah (
    id_mata_kuliah INT AUTO_INCREMENT PRIMARY KEY,
    kode_mata_kuliah VARCHAR(10) NOT NULL UNIQUE,
    nama_mata_kuliah VARCHAR(255) NOT NULL,
    sks INT NOT NULL
) ENGINE=InnoDB;

-- Tabel 4: Program Studi
CREATE TABLE program_studi (
    id_program_studi INT AUTO_INCREMENT PRIMARY KEY,
    id_fakultas INT NOT NULL,
    nama_prodi VARCHAR(100) NOT NULL,
    jenjang ENUM('D3', 'D4', 'S1', 'S2', 'S3') NOT NULL,
    FOREIGN KEY (id_fakultas) REFERENCES fakultas(id_fakultas) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 5: Gedung
CREATE TABLE gedung (
    id_gedung INT AUTO_INCREMENT PRIMARY KEY,
    id_fakultas INT NOT NULL,
    nama_gedung VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_fakultas) REFERENCES fakultas(id_fakultas) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 6: Dosen
CREATE TABLE dosen (
    id_dosen INT AUTO_INCREMENT PRIMARY KEY,
    id_fakultas INT NOT NULL,
    nidn VARCHAR(20) NOT NULL UNIQUE,
    nama_dosen VARCHAR(100) NOT NULL,
    gelar ENUM('D3', 'D4', 'S1', 'S2', 'S3') NOT NULL,
    FOREIGN KEY (id_fakultas) REFERENCES fakultas(id_fakultas) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 7: Ruangan
CREATE TABLE ruangan (
    id_ruangan INT AUTO_INCREMENT PRIMARY KEY,
    id_gedung INT NOT NULL,
    nama_ruangan VARCHAR(255) NOT NULL,
    tipe_ruangan ENUM('kelas_biasa', 'laboratorium') NOT NULL,
    kapasitas INT NOT NULL,
    FOREIGN KEY (id_gedung) REFERENCES gedung(id_gedung) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 8: Prasyarat Mata Kuliah
CREATE TABLE prasyarat_mata_kuliah (
    id_mata_kuliah INT NOT NULL,
    id_prasyarat_mata_kuliah INT NOT NULL,
    nilai_min ENUM('A', 'B', 'C', 'D', 'E', 'F'),
    PRIMARY KEY (id_mata_kuliah, id_prasyarat_mata_kuliah),
    FOREIGN KEY (id_mata_kuliah) REFERENCES mata_kuliah(id_mata_kuliah) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_prasyarat_mata_kuliah) REFERENCES mata_kuliah(id_mata_kuliah) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 9: Rombel
CREATE TABLE rombel (
    id_rombel INT AUTO_INCREMENT PRIMARY KEY,
    id_program_studi INT NOT NULL,
    nama_rombel VARCHAR(10) NOT NULL,
    angkatan INT NOT NULL,
    FOREIGN KEY (id_program_studi) REFERENCES program_studi(id_program_studi) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 10: Kurikulum
CREATE TABLE kurikulum (
    id_kurikulum INT AUTO_INCREMENT PRIMARY KEY,
    id_program_studi INT NOT NULL,
    nama_kurikulum VARCHAR(100) NOT NULL,
    tahun_mulai INT NOT NULL,
    tahun_akhir INT NULL,
    status_kurikulum BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_program_studi) REFERENCES program_studi(id_program_studi) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 11: Kurikulum Mata Kuliah
CREATE TABLE kurikulum_mata_kuliah (
    id_kurikulum INT NOT NULL,
    id_mata_kuliah INT NOT NULL,
    semester INT NOT NULL,
    tipe_mata_kuliah ENUM('wajib', 'peminatan') NOT NULL,
    PRIMARY KEY (id_kurikulum, id_mata_kuliah),
    FOREIGN KEY (id_kurikulum) REFERENCES kurikulum(id_kurikulum) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_mata_kuliah) REFERENCES mata_kuliah(id_mata_kuliah) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 12: Kelompok
CREATE TABLE kelompok (
    id_kelompok INT AUTO_INCREMENT PRIMARY KEY,
    id_rombel INT NOT NULL,
    id_dosen INT NOT NULL,
    kode_kelompok VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_rombel) REFERENCES rombel(id_rombel) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_dosen) REFERENCES dosen(id_dosen) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 13: Mahasiswa
CREATE TABLE mahasiswa (
    id_mahasiswa INT AUTO_INCREMENT PRIMARY KEY,
    id_program_studi INT NOT NULL,
    id_kurikulum INT NOT NULL,
    id_kelompok INT NOT NULL,
    nim VARCHAR(20) NOT NULL UNIQUE,
    nama_mahasiswa VARCHAR(255) NOT NULL,
    status_mahasiswa ENUM('aktif', 'cuti', 'lulus', 'drop_out') DEFAULT 'aktif',
    angkatan INT NOT NULL,
    FOREIGN KEY (id_program_studi) REFERENCES program_studi(id_program_studi) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_kurikulum) REFERENCES kurikulum(id_kurikulum) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_kelompok) REFERENCES kelompok(id_kelompok) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 14: Users
CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    id_mahasiswa INT NULL UNIQUE,
    id_dosen INT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('mahasiswa', 'dosen', 'admin') NOT NULL,
    FOREIGN KEY (id_mahasiswa) REFERENCES mahasiswa(id_mahasiswa) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_dosen) REFERENCES dosen(id_dosen) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 15: Kelas
CREATE TABLE kelas (
    id_kelas INT AUTO_INCREMENT PRIMARY KEY,
    id_ruangan INT NOT NULL,
    id_program_studi INT NOT NULL,
    id_rombel INT NULL,
    id_mata_kuliah INT NOT NULL,
    id_dosen INT NOT NULL,
    id_tahun_ajaran INT NOT NULL,
    kode_kelas VARCHAR(10) NOT NULL,
    kuota INT NOT NULL,
    semester_aktif ENUM('ganjil', 'genap') NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    hari VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_ruangan) REFERENCES ruangan(id_ruangan) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_program_studi) REFERENCES program_studi(id_program_studi) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_rombel) REFERENCES rombel(id_rombel) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_mata_kuliah) REFERENCES mata_kuliah(id_mata_kuliah) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_dosen) REFERENCES dosen(id_dosen) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_tahun_ajaran) REFERENCES tahun_ajaran(id_tahun_ajaran) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 16: Pengumuman
CREATE TABLE pengumuman (
    id_pengumuman INT AUTO_INCREMENT PRIMARY KEY,
    id_program_studi INT NULL,
    id_user INT NULL,
    isi_pengumuman TEXT NOT NULL,
    target ENUM('global', 'prodi', 'personal') DEFAULT 'global',
    tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_berakhir DATETIME NULL,
    FOREIGN KEY (id_program_studi) REFERENCES program_studi(id_program_studi) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 17: Kalender Akademik
CREATE TABLE kalender_akademik (
    id_kalender_akademik INT AUTO_INCREMENT PRIMARY KEY,
    id_tahun_ajaran INT NOT NULL,
    nama_kegiatan VARCHAR(255) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    FOREIGN KEY (id_tahun_ajaran) REFERENCES tahun_ajaran(id_tahun_ajaran) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 18: KRS
CREATE TABLE krs (
    id_krs INT AUTO_INCREMENT PRIMARY KEY,
    id_mahasiswa INT NOT NULL,
    id_tahun_ajaran INT NOT NULL,
    semester_aktif ENUM('ganjil', 'genap') NOT NULL,
    status_krs ENUM('draft', 'menunggu', 'ditolak', 'sah') NOT NULL,
    catatan TEXT NULL,
    FOREIGN KEY (id_mahasiswa) REFERENCES mahasiswa(id_mahasiswa) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tahun_ajaran) REFERENCES tahun_ajaran(id_tahun_ajaran) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 19: Detail KRS
CREATE TABLE detail_krs (
    id_detail_krs INT AUTO_INCREMENT PRIMARY KEY,
    id_krs INT NOT NULL,
    id_kelas INT NOT NULL,
    nilai_tugas DECIMAL(5,2) DEFAULT 0.00,
    nilai_uts DECIMAL(5,2) DEFAULT 0.00,
    nilai_uas DECIMAL(5,2) DEFAULT 0.00,
    nilai_akhir_angka DECIMAL(5,2) DEFAULT 0.00,
    nilai_akhir_huruf ENUM('A', 'B', 'C', 'D', 'E', 'F') NULL,
    CONSTRAINT unique_krs_kelas UNIQUE (id_krs, id_kelas),
    FOREIGN KEY (id_krs) REFERENCES krs(id_krs) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 20: Pertemuan
CREATE TABLE pertemuan (
    id_pertemuan INT AUTO_INCREMENT PRIMARY KEY,
    id_kelas INT NOT NULL,
    nomor_pertemuan INT NOT NULL,
    tanggal DATE NOT NULL,
    CONSTRAINT unique_kelas_pertemuan UNIQUE (id_kelas, nomor_pertemuan),
    FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 21: Presensi
CREATE TABLE presensi (
    id_presensi INT AUTO_INCREMENT PRIMARY KEY,
    id_detail_krs INT NOT NULL,
    id_pertemuan INT NOT NULL,
    status_presensi ENUM('hadir', 'izin', 'sakit', 'alfa') NOT NULL,
    CONSTRAINT unique_detail_pertemuan UNIQUE (id_detail_krs, id_pertemuan),
    FOREIGN KEY (id_detail_krs) REFERENCES detail_krs(id_detail_krs) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_pertemuan) REFERENCES pertemuan(id_pertemuan) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 22: Tagihan
CREATE TABLE tagihan (
    id_tagihan INT AUTO_INCREMENT PRIMARY KEY,
    id_mahasiswa INT NOT NULL,
    id_tahun_ajaran INT NOT NULL,
    semester_aktif ENUM('ganjil', 'genap') NOT NULL,
    tipe_tagihan ENUM('ukt', 'spi', 'denda') NOT NULL,
    nominal DECIMAL(10,2) NOT NULL,
    status_tagihan ENUM('belum', 'diverifikasi', 'lunas') NOT NULL,
    tenggat DATE NOT NULL,
    FOREIGN KEY (id_mahasiswa) REFERENCES mahasiswa(id_mahasiswa) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tahun_ajaran) REFERENCES tahun_ajaran(id_tahun_ajaran) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 23: Pembayaran
CREATE TABLE pembayaran (
    id_pembayaran INT AUTO_INCREMENT PRIMARY KEY,
    id_tagihan INT NOT NULL,
    tanggal_bayar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nominal_bayar DECIMAL(10,2) NOT NULL,
    status_pembayaran ENUM('belum', 'diverifikasi', 'lunas') NOT NULL,
    FOREIGN KEY (id_tagihan) REFERENCES tagihan(id_tagihan) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabel 24: Log Aktivitas
CREATE TABLE log_aktivitas (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    aktivitas VARCHAR(255) NOT NULL,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


