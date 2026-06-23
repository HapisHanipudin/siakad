# Dokumentasi Pemenuhan Spesifikasi Proyek SIAKAD

Dokumen ini memuat pemetaan (mapping) antara kriteria tugas akhir Praktikum Sistem Basis Data dengan implementasi pada *codebase* proyek SIAKAD, serta rincian pembagian tugas masing-masing anggota kelompok.

## A. Status Pemenuhan Persyaratan Teknis
Berikut adalah status implementasi dari spesifikasi minimal yang disyaratkan:

- [x] **Database & Entitas:** Terimplementasi **24 Tabel** (Syarat min. 20 tabel), mencakup Data Master, Transaksional, Referensi, dan Aktor.
- [x] **Dummy Data:** Terisi lebih dari 150 baris data dummy operasional yang saling berelasi.
- [x] **Trigger:** Terimplementasi **6 Trigger** (Syarat min. 3), meliputi kalkulasi nilai otomatis, validasi prasyarat matkul, update kuota kelas, dan log audit.
- [x] **Function (UDF):** Terimplementasi **2 Function** (Syarat min. 2), untuk pemformatan data UI dan validasi kelayakan transaksi secara boolean.
- [x] **Stored Procedure:** Terimplementasi **4 Procedure** (Syarat min. 3), untuk otomasi pendaftaran KRS, verifikasi pembayaran, dan pengesahan dokumen.
- [x] **Cursor:** Terimplementasi **1 Cursor** di dalam Stored Procedure untuk iterasi massal konversi nilai akademik mahasiswa.
- [x] **TCL & Table Locking:** Terimplementasi simulasi `COMMIT`, `ROLLBACK`, dan penguncian data konkuren menggunakan metode `FOR UPDATE` pada skenario rebutan kuota KRS dan validasi pembayaran tagihan.
- [x] **Aggregate & Reporting:** Terimplementasi **5 Query Laporan** menggunakan fungsi agregasi (`COUNT`, `SUM`, `AVG`, `MAX`, `MIN`) yang divisualisasikan dalam bentuk Web Dashboard Manajerial secara *real-time*.
- [x] **Backup & Restore:** Terlampir di Bab VI menggunakan command CLI `pg_dump` dan `psql` (Terdokumentasi di laporan Word).

---

## B. Matriks Pembagian Tugas Kelompok

Proses pengerjaan proyek dibagi secara merata untuk memastikan setiap anggota memiliki andil dalam perancangan *database*, penulisan *query* tingkat lanjut, hingga penyusunan laporan akhir.

| Peran & Nama Anggota | Deskripsi Kontribusi Teknis & Penyusunan Laporan |
| :--- | :--- |
| **Akbar**<br>*(System Analyst & DB Architect)* | **Fokus:** Perancangan Logika Bisnis & Struktur Data.<br>• Merumuskan aturan bisnis (business rules) SIAKAD dan batasan entitas aktor.<br>• Merancang Entity Relationship Diagram (ERD) dan melakukan normalisasi tabel (1NF hingga 3NF).<br>• **Laporan:** Bertanggung jawab penuh menyusun Bab I, Bab II (Proses Bisnis), Bab III (ERD & Data Dictionary), dan Bab VIII. |
| **Dimitri**<br>*(Core Database Administrator)* | **Fokus:** Eksekusi DDL, DML, dan Keamanan Data Dasar.<br>• Mengonversi struktur rancangan DBML menjadi eksekusi `CREATE TABLE` (DDL) dengan constraints ketat di PostgreSQL.<br>• Melakukan data seeding ratusan baris dummy data (DML).<br>• Melakukan simulasi dan eksekusi Backup & Restore Database via CLI.<br>• **Laporan:** Bertanggung jawab menyusun Bab IV (DDL & DML) dan Bab VI (Backup & Restore). |
| **Given**<br>*(SQL Developer A - Otomatisasi)* | **Fokus:** Keamanan Transaksi dan *Event-Driven Actions*.<br>• Membuat dan melakukan *testing* pada 6 buah `TRIGGER` untuk otomasi sistem.<br>• Merancang skenario demonstrasi Transaction Control Language (TCL) menggunakan `COMMIT` dan `ROLLBACK`.<br>• Mengimplementasikan skenario penguncian data (`Table Locking` dengan `FOR UPDATE`).<br>• **Laporan:** Bertanggung jawab menyusun Bab V (Bagian implementasi Trigger dan TCL). |
| **Ahya**<br>*(SQL Developer B - Pemrosesan)* | **Fokus:** *Business Logic Processing* berbasis Database.<br>• Menulis 4 *Stored Procedure* untuk memproses logika transaksi akademik.<br>• Membangun 2 *User Defined Function* (UDF).<br>• Mengimplementasikan fitur *Cursor* untuk *looping* pemrosesan data massal di dalam memori database.<br>• **Laporan:** Bertanggung jawab menyusun Bab V (Bagian implementasi Function, Procedure, dan Cursor). |
| **Hafizh**<br>*(Data Analyst & Fullstack Integrator)* | **Fokus:** Pelaporan Manajerial & Integrasi Web Dashboard.<br>• Meracik 5 *Query Aggregate* kompleks (SUM, AVG, COUNT, MAX, MIN) untuk pelaporan manajerial.<br>• Membangun integrasi Backend API dan menyajikan hasil *query* ke dalam antarmuka Frontend Web Dashboard (Next.js & Tailwind CSS).<br>• **Laporan:** Bertanggung jawab menyusun Bab VII (Reporting & Dashboard) serta melakukan kompilasi hasil akhir *source code*. |
