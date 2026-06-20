-- =============================================================================
-- 2. DATA DUMMY (DML) - MINIMAL 150+ TOTAL BARIS DATA BERIKATAN
-- =============================================================================

-- T1: fakultas (5 baris)
INSERT INTO fakultas (nama_fakultas) VALUES
('Fakultas Ilmu Komputer'),
('Fakultas Ekonomi dan Bisnis'),
('Fakultas Teknik'),
('Fakultas Kedokteran'),
('Fakultas Ilmu Sosial dan Ilmu Politik');

-- T2: tahun_ajaran (3 baris)
INSERT INTO tahun_ajaran (nama_tahun_ajaran) VALUES
('2024/2025'),
('2025/2026'),
('2026/2027');

-- T3: mata_kuliah (10 baris)
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

-- T4: program_studi (5 baris)
INSERT INTO program_studi (id_fakultas, nama_prodi, jenjang) VALUES
(1, 'Informatika', 'S1'),
(1, 'Sistem Informasi', 'S1'),
(2, 'Manajemen', 'S1'),
(2, 'Akuntansi', 'S1'),
(3, 'Teknik Elektro', 'S1');

-- T5: gedung (4 baris)
INSERT INTO gedung (id_fakultas, nama_gedung) VALUES
(1, 'Gedung Ki Hajar Dewantara (FIK)'),
(1, 'Gedung Yos Sudarso'),
(2, 'Gedung MH Thamrin'),
(3, 'Gedung Sudirman');

-- T6: dosen (6 baris)
INSERT INTO dosen (id_fakultas, nidn, nama_dosen, gelar) VALUES
(1, '0411028801', 'Dr. Aris Tri Jaka, S.Kom., M.T.', 'S3'),
(1, '0423058502', 'Ira Herawati, M.T.', 'S2'),
(2, '0412127903', 'Prof. Bambang Utomo, S.E., M.M.', 'S3'),
(2, '0415088204', 'Rina Wijayanti, M.Ak.', 'S2'),
(3, '0409098905', 'Eko Prasetyo, M.Eng.', 'S2'),
(1, '0401019006', 'Deni Ramdani, M.Kom.', 'S2');

-- T7: ruangan (8 baris)
INSERT INTO ruangan (id_gedung, nama_ruangan, tipe_ruangan, kapasitas) VALUES
(1, 'Ruang Teori 101', 'kelas_biasa', 40),
(1, 'Ruang Teori 102', 'kelas_biasa', 40),
(1, 'Laboratorium Basis Data', 'laboratorium', 30),
(1, 'Laboratorium Rekayasa Perangkat Lunak', 'laboratorium', 30),
(3, 'Ruang FEB 201', 'kelas_biasa', 50),
(3, 'Ruang FEB 202', 'kelas_biasa', 50),
(4, 'Laboratorium Elektronika', 'laboratorium', 25),
(2, 'Auditorium Utama', 'kelas_biasa', 150);

-- T8: prasyarat_mata_kuliah (3 baris)
INSERT INTO prasyarat_mata_kuliah (id_mata_kuliah, id_prasyarat_mata_kuliah, nilai_min) VALUES
(2, 1, 'C'), -- Struktur Data butuh Dasar Pemrograman
(4, 1, 'C'), -- Pemrograman Web butuh Dasar Pemrograman
(5, 7, 'C'); -- Analisis & Perancangan Sistem butuh Pengantar SI

-- T9: rombel (6 baris)
INSERT INTO rombel (id_program_studi, nama_rombel, angkatan) VALUES
(1, 'IF-A 2025', 2025),
(1, 'IF-B 2025', 2025),
(2, 'SI-A 2025', 2025),
(3, 'MN-A 2025', 2025),
(1, 'IF-A 2024', 2024),
(2, 'SI-A 2024', 2024);

-- T10: kurikulum (4 baris)
INSERT INTO kurikulum (id_program_studi, nama_kurikulum, tahun_mulai, tahun_akhir, status_kurikulum) VALUES
(1, 'Kurikulum Merdeka Informatika 2024', 2024, 2028, TRUE),
(2, 'Kurikulum Berbasis Kompetensi SI 2024', 2024, 2028, TRUE),
(3, 'Kurikulum Nasional Manajemen 2025', 2025, 2029, TRUE),
(5, 'Kurikulum Inti Teknik Elektro', 2024, 2028, TRUE);

-- T11: kurikulum_mata_kuliah (12 baris)
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

-- T12: kelompok (5 baris)
INSERT INTO kelompok (id_rombel, id_dosen, kode_kelompok) VALUES
(1, 1, 'PA-IF-A25'),
(2, 2, 'PA-IF-B25'),
(3, 6, 'PA-SI-A25'),
(4, 3, 'PA-MN-A25'),
(5, 1, 'PA-IF-A24');

-- T13: mahasiswa (12 baris)
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

-- T14: users (15 baris)
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

-- T15: kelas (8 baris)
INSERT INTO kelas (id_ruangan, id_program_studi, id_rombel, id_mata_kuliah, id_dosen, id_tahun_ajaran, kode_kelas, kuota, semester_aktif, jam_mulai, jam_selesai, hari) VALUES
(1, 1, 1, 1, 1, 2, 'IF-A-P1', 40, 'ganjil', '08:00:00', '10:30:00', 'Senin'),
(2, 1, 2, 1, 2, 2, 'IF-B-P1', 40, 'ganjil', '10:40:00', '13:10:00', 'Senin'),
(3, 1, 1, 3, 1, 2, 'IF-A-BD', 30, 'ganjil', '08:00:00', '11:20:00', 'Selasa'),
(4, 1, 2, 4, 6, 2, 'IF-B-PW', 30, 'ganjil', '13:30:00', '16:00:00', 'Rabu'),
(5, 2, 3, 6, 6, 2, 'SI-A-PSI', 45, 'ganjil', '08:00:00', '09:40:00', 'Kamis'),
(3, 2, 3, 3, 2, 2, 'SI-A-BD', 30, 'ganjil', '10:00:00', '13:20:00', 'Kamis'),
(6, 3, 4, 8, 3, 2, 'MN-A-PM', 50, 'ganjil', '08:00:00', '10:30:00', 'Jumat'),
(1, 1, 5, 5, 1, 1, 'IF-A24-RPL', 35, 'genap', '13:30:00', '16:00:00', 'Selasa');

-- T16: pengumuman (5 baris)
INSERT INTO pengumuman (id_program_studi, id_user, isi_pengumuman, target, tanggal_berakhir) VALUES
(NULL, 1, 'Selamat Datang Mahasiswa Baru UPNVJ Tahun Ajaran 2025/2026!', 'global', '2025-09-30 23:59:59'),
(1, 1, 'Pengisian KRS Utama Prodi Informatika dibuka s.d 20 Agustus 2025.', 'prodi', '2025-08-20 23:59:59'),
(2, 1, 'Diberitahukan pergeseran ruang kuliah untuk SI-A Angkatan 2025.', 'prodi', '2025-09-10 17:00:00'),
(NULL, 7, 'Tugas Besar Basis Data dikumpulkan maksimal Pertemuan 15 via Eluon.', 'global', '2025-12-15 23:59:59'),
(1, 1, 'Evaluasi Tengah Semester Kurikulum Informatika Berjalan.', 'prodi', '2025-11-10 23:59:59');

-- T17: kalender_akademik (5 baris)
INSERT INTO kalender_akademik (id_tahun_ajaran, nama_kegiatan, tanggal_mulai, tanggal_selesai) VALUES
(2, 'Pembayaran UKT Semester Ganjil', '2025-07-01', '2025-07-31'),
(2, 'Masa Pengisian KRS Mahasiswa', '2025-08-01', '2025-08-15'),
(2, 'Perkuliahan Efektif Ganjil (Bagian 1)', '2025-09-01', '2025-10-24'),
(2, 'Ujian Tengah Semester (UTS)', '2025-10-27', '2025-11-07'),
(2, 'Ujian Akhir Semester (UAS)', '2026-01-05', '2026-01-16');

-- T18: krs (10 baris)
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

-- T19: detail_krs (15 baris)
INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas, nilai_akhir_angka, nilai_akhir_huruf) VALUES
(1, 1, 85.00, 80.00, 90.00, 85.50, 'A'), -- Dimitri di Kelas Dasar Pemrog
(1, 3, 90.00, 85.00, 88.00, 87.50, 'A'), -- Dimitri di Kelas Basis Data
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

-- T20: pertemuan (12 baris)
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

-- T21: presensi (15 baris)
INSERT INTO presensi (id_detail_krs, id_pertemuan, status_presensi) VALUES
(1, 1, 'hadir'), -- Dimitri pertemuan 1 kelas 1
(1, 2, 'hadir'), -- Dimitri pertemuan 2 kelas 1
(1, 3, 'hadir'), -- Dimitri pertemuan 3 kelas 1
(2, 1, 'hadir'),
(2, 2, 'izin'),
(2, 3, 'hadir'),
(3, 4, 'hadir'), -- id_pertemuan 4 (kelas 3 p1)
(3, 5, 'sakit'), -- id_pertemuan 5 (kelas 3 p2)
(4, 4, 'hadir'),
(4, 5, 'hadir'),
(6, 6, 'hadir'), -- id_pertemuan 6 (kelas 5 p1)
(7, 8, 'hadir'), -- id_pertemuan 8 (kelas 6 p1)
(10, 10, 'hadir'), -- id_pertemuan 10 (kelas 8 p1)
(11, 10, 'hadir'),
(1, 12, 'hadir'); -- Dimitri pertemuan 3 kelas 3

-- T22: tagihan (12 baris)
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

-- T23: pembayaran (10 baris)
INSERT INTO pembayaran (id_tagihan, nominal_bayar, status_pembayaran) VALUES
(1, 5500000.00, 'lunas'), -- Pembayaran UKT Dimitri
(2, 5500000.00, 'lunas'),
(3, 4200000.00, 'lunas'),
(5, 6000000.00, 'diverifikasi'),
(7, 3500000.00, 'lunas'),
(8, 5000000.00, 'lunas'),
(9, 5000000.00, 'lunas'),
(10, 50000.00, 'lunas'), -- Pembayaran denda Dimitri
(11, 5500000.00, 'lunas'),
(4, 2000000.00, 'belum'); -- Cicilan belum diverifikasi/lunas

-- T24: log_aktivitas (15 baris)
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
