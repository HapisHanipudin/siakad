-- ============================================================
-- SKENARIO 1: Pengajuan KRS Mahasiswa Baru
-- Mahasiswa: Citra Lestari (id=6), KRS id=5 status 'menunggu'
-- Tambah detail KRS untuk kelas SI-A-PSI (id=5) & SI-A-BD (id=6)
-- Rollback jika: prasyarat gagal, kuota habis, data tidak valid
-- ============================================================

BEGIN;

    -- Lock the targeted kelas rows to secure their kuota from concurrent bookings
    -- FOR UPDATE ensures no other transaction can modify these classes' quota until this transaction commits.
    SELECT id_kelas, kuota FROM kelas WHERE id_kelas IN (5, 6) FOR UPDATE;

    -- Tambahkan mata kuliah ke detail KRS Citra (id_krs=5)
    -- Trigger T-02 otomatis cek prasyarat
    -- Trigger T-03 otomatis kurangi kuota kelas
    INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas)
    VALUES (5, 5, 0.00, 0.00, 0.00);  -- SI-A-PSI

    INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas)
    VALUES (5, 6, 0.00, 0.00, 0.00);  -- SI-A-BD

    -- Ubah status KRS dari menunggu → sah setelah semua MK ditambahkan
    UPDATE krs
    SET status_krs = 'sah'::status_krs,
        catatan    = 'KRS disetujui Dosen Wali'
    WHERE id_krs = 5;

-- Jika semua langkah berhasil → simpan permanen
COMMIT;

-- Jika ada error (prasyarat gagal, kuota habis) → batalkan semua
-- ROLLBACK;


-- ============================================================
-- SKENARIO 2: Input Nilai Akhir Mahasiswa oleh Dosen
-- Dosen input nilai untuk detail_krs id 3, 4, 6
-- Trigger T-01 otomatis hitung nilai_akhir_angka & nilai_akhir_huruf
-- Rollback jika: nilai di luar rentang 0-100
-- ============================================================

BEGIN;

    SAVEPOINT sp_sebelum_nilai;

    -- Input nilai Ahmad Farhan - Kelas IF-A-P1 (detail_krs id=3)
    -- Trigger T-01 otomatis menghitung nilai_akhir_angka & nilai_akhir_huruf
    UPDATE detail_krs
    SET nilai_tugas = 78.00,
        nilai_uts   = 72.00,
        nilai_uas   = 80.00
    WHERE id_detail_krs = 3;

    -- Validasi manual: pastikan nilai dalam rentang wajar
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1 FROM detail_krs
            WHERE id_detail_krs = 3
              AND (nilai_tugas < 0 OR nilai_tugas > 100
                OR nilai_uts   < 0 OR nilai_uts   > 100
                OR nilai_uas   < 0 OR nilai_uas   > 100)
        ) THEN
            RAISE EXCEPTION 'Nilai di luar rentang 0-100 untuk detail_krs id=3';
        END IF;
    END $$;

    -- Input nilai Rizky Ramadhan - Kelas IF-B-PW (detail_krs id=4)
    UPDATE detail_krs
    SET nilai_tugas = 65.00,
        nilai_uts   = 60.00,
        nilai_uas   = 70.00
    WHERE id_detail_krs = 4;

    -- Input nilai Budi Santoso - Kelas SI-A-PSI (detail_krs id=6)
    UPDATE detail_krs
    SET nilai_tugas = 82.00,
        nilai_uts   = 78.00,
        nilai_uas   = 85.00
    WHERE id_detail_krs = 6;

    -- Catat log aktivitas input nilai
    INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
    VALUES (7, '172.16.5.4', 'Input nilai akhir batch: detail_krs id 3, 4, 6');

COMMIT;

-- Jika ada nilai tidak valid → kembali ke kondisi sebelum input nilai
-- ROLLBACK TO SAVEPOINT sp_sebelum_nilai;
-- RELEASE SAVEPOINT sp_sebelum_nilai;


-- ============================================================
-- SKENARIO 3: Pembayaran Tagihan UKT Mahasiswa
-- Tagihan id=4 milik Rizky Ramadhan (belum bayar, nominal 5.500.000)
-- Trigger T-05 otomatis update status tagihan jika lunas
-- Rollback jika: tagihan sudah lunas, nominal tidak valid
-- ============================================================

BEGIN;

    SAVEPOINT sp_sebelum_bayar;

    -- Cek status tagihan sebelum membayar dengan mengunci row tersebut
    DO $$
    DECLARE
        v_status  status_transaksi;
        v_nominal DECIMAL(10,2);
    BEGIN
        -- Lock the targeted tagihan row using FOR UPDATE to ensure its status/amount 
        -- is not modified concurrently by another transaction until we commit.
        SELECT status_tagihan, nominal
        INTO v_status, v_nominal
        FROM tagihan
        WHERE id_tagihan = 4
        FOR UPDATE;

        IF v_status = 'lunas'::status_transaksi THEN
            RAISE EXCEPTION 'Tagihan id=4 sudah berstatus lunas, pembayaran ditolak.';
        END IF;

        IF v_nominal IS NULL THEN
            RAISE EXCEPTION 'Tagihan id=4 tidak ditemukan.';
        END IF;
    END $$;

    -- Insert record pembayaran Rizky (5.500.000 lunas sekaligus)
    -- Trigger T-05 otomatis update status_tagihan → 'lunas'
    INSERT INTO pembayaran (id_tagihan, nominal_bayar, status_pembayaran)
    VALUES (4, 5500000.00, 'diverifikasi'::status_transaksi);

    -- Catat log aktivitas pembayaran
    INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
    VALUES (1, '10.0.2.15', 'Verifikasi pembayaran UKT Rizky Ramadhan - tagihan id=4');

COMMIT;

-- Jika terjadi error saat proses pembayaran → batalkan semua
-- ROLLBACK TO SAVEPOINT sp_sebelum_bayar;


-- ============================================================
-- SKENARIO 4: Pendaftaran Kelas Baru oleh Admin
-- Kelas baru: IF201 (Sistem Basis Data) untuk rombel IF-A 2025
-- Ruangan: Lab Basis Data (id=3, kapasitas 30)
-- Trigger T-04 validasi kuota, T-10 cek jadwal dosen
-- Rollback jika: kuota > kapasitas ruangan, jadwal dosen bentrok
-- ============================================================

BEGIN;

    SAVEPOINT sp_sebelum_kelas;

    -- Cek ketersediaan ruangan Lab Basis Data (id=3)
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM ruangan WHERE id_ruangan = 3
        ) THEN
            RAISE EXCEPTION 'Ruangan id=3 tidak ditemukan.';
        END IF;
    END $$;

    -- Insert kelas baru IF201 - Semester Genap 2025/2026
    -- Trigger T-04 otomatis validasi kuota vs kapasitas ruangan (maks 30)
    -- Trigger T-06 otomatis cek konflik jadwal dosen id=2 (Ira Herawati)
    INSERT INTO kelas (
        id_ruangan, id_program_studi, id_rombel, id_mata_kuliah,
        id_dosen, id_tahun_ajaran, kode_kelas,
        kuota, semester_aktif, jam_mulai, jam_selesai, hari
    )
    VALUES (
        3, 1, 1, 3,
        2, 2, 'IF-A-BD2',
        30, 'genap'::semester_aktif, '08:00:00', '11:20:00', 'Rabu'
    );

    -- Catat log pembuatan kelas
    INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
    VALUES (1, '10.0.2.15', 'Kelas baru IF-A-BD2 (IF201 Genap) berhasil dibuat oleh admin');

COMMIT;

-- Jika validasi gagal (kuota > kapasitas / jadwal dosen bentrok) → batalkan
-- ROLLBACK TO SAVEPOINT sp_sebelum_kelas;


-- ============================================================
-- SKENARIO 5: Pembatalan KRS Mahasiswa
-- KRS id=6 milik Dedi Wijaya (status 'draft', belum diajukan)
-- Trigger T-03 otomatis kembalikan kuota kelas saat detail dihapus
-- Rollback jika: KRS sudah berstatus 'sah'
-- ============================================================

BEGIN;

    SAVEPOINT sp_sebelum_batal;

    -- Validasi: KRS yang sudah sah tidak boleh dibatalkan sembarangan
    DO $$
    DECLARE
        v_status    status_krs;
        v_nama      VARCHAR;
    BEGIN
        SELECT k.status_krs, m.nama_mahasiswa
        INTO v_status, v_nama
        FROM krs k
        JOIN mahasiswa m ON k.id_mahasiswa = m.id_mahasiswa
        WHERE k.id_krs = 6;

        IF v_status = 'sah'::status_krs THEN
            RAISE EXCEPTION 'KRS id=6 milik % sudah berstatus SAH, tidak dapat dibatalkan tanpa persetujuan admin.', v_nama;
        END IF;

        IF v_status IS NULL THEN
            RAISE EXCEPTION 'KRS id=6 tidak ditemukan.';
        END IF;
    END $$;

    -- Hapus semua detail KRS Dedi (id_krs=6)
    -- Trigger T-03 otomatis kembalikan kuota ke masing-masing kelas
    DELETE FROM detail_krs
    WHERE id_krs = 6;

    -- Hapus header KRS
    DELETE FROM krs
    WHERE id_krs = 6;

    -- Catat log pembatalan
    INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
    VALUES (1, '10.0.2.15', 'KRS id=6 milik Dedi Wijaya dibatalkan oleh admin');

COMMIT;

-- Jika KRS tidak bisa dibatalkan → kembalikan semua data
-- ROLLBACK TO SAVEPOINT sp_sebelum_batal;


-- ============================================================
-- SKENARIO 6: Pendaftaran Mahasiswa Baru
-- Prodi Informatika (id=1), Kurikulum id=1 (aktif), Kelompok id=1
-- Rollback jika: NIM/email duplikat, kurikulum tidak aktif
-- ============================================================

BEGIN;

    SAVEPOINT sp_sebelum_daftar;

    -- Validasi program studi tersedia
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM program_studi WHERE id_program_studi = 1
        ) THEN
            RAISE EXCEPTION 'Program studi id=1 tidak ditemukan.';
        END IF;
    END $$;

    -- Validasi kurikulum aktif
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM kurikulum
            WHERE id_kurikulum    = 1
              AND status_kurikulum = TRUE
        ) THEN
            RAISE EXCEPTION 'Kurikulum id=1 tidak aktif atau tidak ditemukan.';
        END IF;
    END $$;

    -- Insert data mahasiswa baru
    INSERT INTO mahasiswa (
        id_program_studi, id_kurikulum, id_kelompok,
        nim, nama_mahasiswa, status_mahasiswa, angkatan
    )
    VALUES (
        1, 1, 1,
        '2510511099', 'Raka Pratama', 'aktif'::status_mahasiswa, 2025
    );

    -- Insert akun user untuk mahasiswa baru
    INSERT INTO users (id_mahasiswa, id_dosen, email, password, role)
    VALUES (
        (SELECT id_mahasiswa FROM mahasiswa WHERE nim = '2510511099'),
        NULL,
        'raka.pratama@mahasiswa.upnvj.ac.id',
        'hash_raka_2025',
        'mahasiswa'::enum_role
    );

    -- Buat tagihan UKT awal semester ganjil 2025/2026
    INSERT INTO tagihan (
        id_mahasiswa, id_tahun_ajaran, semester_aktif,
        tipe_tagihan, nominal, status_tagihan, tenggat
    )
    VALUES (
        (SELECT id_mahasiswa FROM mahasiswa WHERE nim = '2510511099'),
        2,
        'ganjil'::semester_aktif,
        'ukt'::tipe_tagihan,
        5500000.00,
        'belum'::status_transaksi,
        '2025-07-31'
    );

    -- Catat log pendaftaran
    INSERT INTO log_aktivitas (id_user, ip_address, aktivitas)
    VALUES (
        (SELECT id_user FROM users WHERE email = 'raka.pratama@mahasiswa.upnvj.ac.id'),
        '10.0.0.1',
        'Pendaftaran mahasiswa baru: 2510511099 - Raka Pratama'
    );

COMMIT;

-- Jika NIM/email duplikat atau data tidak valid → batalkan seluruh pendaftaran
-- ROLLBACK TO SAVEPOINT sp_sebelum_daftar;
-- ROLLBACK;


-- ============================================================
-- END OF FILE
-- ============================================================
