-- ========================================================================================
-- File: task04_procedure_function_cursor.sql
-- Deskripsi: Pemrosesan transaksi akademik (Target: 2 Function, 3 SP, 1 Cursor)
-- ========================================================================================


-- ========================================================================================
-- BAGIAN 1: FUNCTION
-- ========================================================================================

-- FUNCTION 1: Memformat nama dan NIM mahasiswa untuk kebutuhan UI/Labeling
CREATE OR REPLACE FUNCTION format_profil_mahasiswa(p_id_mahasiswa INT)
RETURNS VARCHAR 
LANGUAGE plpgsql
AS $$
DECLARE
    v_nama VARCHAR;
    v_nim VARCHAR;
BEGIN
    SELECT nama_mahasiswa, nim INTO v_nama, v_nim 
    FROM mahasiswa 
    WHERE id_mahasiswa = p_id_mahasiswa;
    
    RETURN v_nama || ' (NIM: ' || v_nim || ')';
END;
$$;


-- FUNCTION 2: Mengecek kelayakan tagihan KRS (Lunas = TRUE)
CREATE OR REPLACE FUNCTION cek_kelayakan_krs(p_id_tagihan INT)
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
DECLARE
    v_status status_transaksi; 
BEGIN
    SELECT status_tagihan INTO v_status 
    FROM tagihan 
    WHERE id_tagihan = p_id_tagihan;
    
    IF v_status = 'lunas' THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;


-- ========================================================================================
-- BAGIAN 2: STORED PROCEDURE (SP)
-- ========================================================================================

-- SP 1: Menambahkan record mata kuliah baru ke dalam KRS
CREATE OR REPLACE PROCEDURE sp_tambah_kelas_krs(p_id_krs INT, p_id_kelas INT)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO detail_krs (id_krs, id_kelas, nilai_tugas, nilai_uts, nilai_uas, nilai_akhir_angka)
    VALUES (p_id_krs, p_id_kelas, 0.00, 0.00, 0.00, 0.00);
END;
$$;


-- SP 2: Mencatat riwayat pembayaran dan mengunci status tagihan
CREATE OR REPLACE PROCEDURE sp_proses_pembayaran_standar(p_id_tagihan INT, p_nominal NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO pembayaran (id_tagihan, nominal_bayar, status_pembayaran)
    VALUES (p_id_tagihan, p_nominal, 'diverifikasi');
    
    UPDATE tagihan 
    SET status_tagihan = 'lunas' 
    WHERE id_tagihan = p_id_tagihan;
END;
$$;


-- SP 3: Memperbarui status KRS yang diajukan menjadi sah
CREATE OR REPLACE PROCEDURE sp_sahkan_krs(p_id_krs INT)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE krs 
    SET status_krs = 'sah' 
    WHERE id_krs = p_id_krs AND status_krs IN ('draft', 'menunggu');
END;
$$;


-- ========================================================================================
-- BAGIAN 3: CURSOR (Diimplementasikan di dalam Stored Procedure)
-- ========================================================================================

-- SP 4 dengan CURSOR: Iterasi massal untuk mengonversi nilai angka menjadi huruf mutu
CREATE OR REPLACE PROCEDURE sp_konversi_nilai_huruf()
LANGUAGE plpgsql
AS $$
DECLARE
    -- DECLARE CURSOR: Membaca nilai angka > 0 yang belum dikonversi
    cur_nilai CURSOR FOR 
        SELECT id_detail_krs, nilai_akhir_angka 
        FROM detail_krs 
        WHERE nilai_akhir_huruf IS NULL AND nilai_akhir_angka > 0;
        
    v_id_detail INT;
    v_angka NUMERIC(5,2);
    v_huruf nilai_huruf; 
BEGIN
    -- OPEN CURSOR: Membuka kursor di memori
    OPEN cur_nilai;
    
    LOOP
        -- FETCH CURSOR: Mengambil data baris demi baris ke dalam variabel
        FETCH cur_nilai INTO v_id_detail, v_angka;
        EXIT WHEN NOT FOUND;

        -- Logika konversi nilai akademik
        IF v_angka >= 85.00 THEN v_huruf := 'A';
        ELSIF v_angka >= 70.00 THEN v_huruf := 'B';
        ELSIF v_angka >= 55.00 THEN v_huruf := 'C';
        ELSIF v_angka >= 40.00 THEN v_huruf := 'D';
        ELSE v_huruf := 'E';
        END IF;

        UPDATE detail_krs
        SET nilai_akhir_huruf = v_huruf
        WHERE id_detail_krs = v_id_detail;
    END LOOP;
    
    -- CLOSE CURSOR: Menutup kursor dan membersihkan memori
    CLOSE cur_nilai;
END;
$$;