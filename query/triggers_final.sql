-- ============================================================
-- T-01: Hitung otomatis nilai_akhir_angka dan nilai_akhir_huruf
-- Event  : BEFORE INSERT OR UPDATE
-- Tabel  : detail_krs
-- ============================================================

CREATE OR REPLACE FUNCTION fn_hitung_nilai()
RETURNS TRIGGER AS $$
BEGIN
    -- Hitung nilai_akhir_angka: 30% tugas + 30% UTS + 40% UAS
    NEW.nilai_akhir_angka := (NEW.nilai_tugas * 0.30)
                           + (NEW.nilai_uts   * 0.30)
                           + (NEW.nilai_uas   * 0.40);

    -- Konversi ke nilai_akhir_huruf berdasarkan skala
    NEW.nilai_akhir_huruf :=
        CASE
            WHEN NEW.nilai_akhir_angka >= 80 THEN 'A'::nilai_huruf
            WHEN NEW.nilai_akhir_angka >= 70 THEN 'B'::nilai_huruf
            WHEN NEW.nilai_akhir_angka >= 60 THEN 'C'::nilai_huruf
            WHEN NEW.nilai_akhir_angka >= 50 THEN 'D'::nilai_huruf
            ELSE 'E'::nilai_huruf
        END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_hitung_nilai
BEFORE INSERT OR UPDATE OF nilai_tugas, nilai_uts, nilai_uas
ON detail_krs
FOR EACH ROW
EXECUTE FUNCTION fn_hitung_nilai();


-- ============================================================
-- T-02: Cek prasyarat mata kuliah sebelum KRS
-- Event  : BEFORE INSERT
-- Tabel  : detail_krs
-- ============================================================

CREATE OR REPLACE FUNCTION fn_cek_prasyarat()
RETURNS TRIGGER AS $$
DECLARE
    v_id_mahasiswa    INT;
    v_id_mata_kuliah  INT;
    v_id_prasyarat    INT;
    v_nilai_min       nilai_huruf;
    v_nilai_capai     nilai_huruf;

    -- Urutan nilai untuk perbandingan (A paling tinggi)
    v_urutan TEXT[] := ARRAY['A','B','C','D','E','F'];
BEGIN
    -- Ambil id_mahasiswa dari krs
    SELECT id_mahasiswa INTO v_id_mahasiswa
    FROM krs
    WHERE id_krs = NEW.id_krs;

    -- Ambil id_mata_kuliah dari kelas
    SELECT id_mata_kuliah INTO v_id_mata_kuliah
    FROM kelas
    WHERE id_kelas = NEW.id_kelas;

    -- Periksa setiap prasyarat mata kuliah ini
    FOR v_id_prasyarat, v_nilai_min IN
        SELECT id_prasyarat_mata_kuliah, nilai_min
        FROM prasyarat_mata_kuliah
        WHERE id_mata_kuliah = v_id_mata_kuliah
    LOOP
        -- Cek apakah mahasiswa sudah lulus prasyarat dengan nilai cukup
        SELECT dk.nilai_akhir_huruf INTO v_nilai_capai
        FROM detail_krs dk
        JOIN krs k    ON dk.id_krs   = k.id_krs
        JOIN kelas kl ON dk.id_kelas = kl.id_kelas
        WHERE k.id_mahasiswa    = v_id_mahasiswa
          AND kl.id_mata_kuliah = v_id_prasyarat
          AND dk.nilai_akhir_huruf IS NOT NULL
        ORDER BY
            array_position(v_urutan, dk.nilai_akhir_huruf::TEXT) ASC
        LIMIT 1;

        -- Jika belum pernah ambil atau nilai tidak memenuhi minimum
        IF v_nilai_capai IS NULL OR
           array_position(v_urutan, v_nilai_capai::TEXT) >
           array_position(v_urutan, v_nilai_min::TEXT)
        THEN
            RAISE EXCEPTION
                'Prasyarat tidak terpenuhi: mata kuliah id=% memerlukan nilai minimum % pada prasyarat id=%',
                v_id_mata_kuliah, v_nilai_min, v_id_prasyarat;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_cek_prasyarat
BEFORE INSERT
ON detail_krs
FOR EACH ROW
EXECUTE FUNCTION fn_cek_prasyarat();


-- ============================================================
-- T-03: Kuota kelas berkurang/bertambah otomatis
-- Event  : AFTER INSERT / DELETE
-- Tabel  : detail_krs
-- ============================================================

CREATE OR REPLACE FUNCTION fn_update_kuota_kelas()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Cek apakah kuota masih tersedia
        IF (SELECT kuota FROM kelas WHERE id_kelas = NEW.id_kelas) <= 0 THEN
            RAISE EXCEPTION 'Kelas id=% sudah penuh, kuota habis.', NEW.id_kelas;
        END IF;

        -- Kurangi kuota saat mahasiswa mendaftar
        UPDATE kelas
        SET kuota = kuota - 1
        WHERE id_kelas = NEW.id_kelas;

    ELSIF TG_OP = 'DELETE' THEN
        -- Kembalikan kuota saat mahasiswa membatalkan KRS
        UPDATE kelas
        SET kuota = kuota + 1
        WHERE id_kelas = OLD.id_kelas;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_kuota_kelas
AFTER INSERT OR DELETE
ON detail_krs
FOR EACH ROW
EXECUTE FUNCTION fn_update_kuota_kelas();


-- ============================================================
-- T-04: Validasi kuota kelas tidak melebihi kapasitas ruangan
-- Event  : BEFORE INSERT OR UPDATE
-- Tabel  : kelas
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validasi_kuota_ruangan()
RETURNS TRIGGER AS $$
DECLARE
    v_kapasitas INT;
BEGIN
    SELECT kapasitas INTO v_kapasitas
    FROM ruangan
    WHERE id_ruangan = NEW.id_ruangan;

    IF NEW.kuota > v_kapasitas THEN
        RAISE EXCEPTION
            'Kuota kelas (%) melebihi kapasitas ruangan (%) untuk ruangan id=%',
            NEW.kuota, v_kapasitas, NEW.id_ruangan;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validasi_kuota_ruangan
BEFORE INSERT OR UPDATE OF kuota, id_ruangan
ON kelas
FOR EACH ROW
EXECUTE FUNCTION fn_validasi_kuota_ruangan();


-- ============================================================
-- T-05: Update status tagihan menjadi 'lunas' saat pembayaran cukup
-- Event  : AFTER INSERT OR UPDATE
-- Tabel  : pembayaran
-- ============================================================

CREATE OR REPLACE FUNCTION fn_update_status_tagihan()
RETURNS TRIGGER AS $$
DECLARE
    v_total_bayar DECIMAL(10,2);
    v_nominal     DECIMAL(10,2);
BEGIN
    -- Jumlahkan semua pembayaran yang sudah diverifikasi untuk tagihan ini
    SELECT COALESCE(SUM(nominal_bayar), 0) INTO v_total_bayar
    FROM pembayaran
    WHERE id_tagihan         = NEW.id_tagihan
      AND status_pembayaran  = 'diverifikasi';

    -- Ambil nominal tagihan
    SELECT nominal INTO v_nominal
    FROM tagihan
    WHERE id_tagihan = NEW.id_tagihan;

    -- Update status tagihan sesuai kondisi
    IF v_total_bayar >= v_nominal THEN
        UPDATE tagihan
        SET status_tagihan = 'lunas'::status_transaksi
        WHERE id_tagihan = NEW.id_tagihan;
    ELSE
        UPDATE tagihan
        SET status_tagihan = 'diverifikasi'::status_transaksi
        WHERE id_tagihan   = NEW.id_tagihan
          AND status_tagihan = 'belum'::status_transaksi;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_status_tagihan
AFTER INSERT OR UPDATE OF status_pembayaran, nominal_bayar
ON pembayaran
FOR EACH ROW
EXECUTE FUNCTION fn_update_status_tagihan();


-- ============================================================
-- T-06: Cegah dosen mengajar 2 kelas di waktu yang sama
-- Event  : BEFORE INSERT OR UPDATE
-- Tabel  : kelas
-- ============================================================

CREATE OR REPLACE FUNCTION fn_cek_jadwal_dosen()
RETURNS TRIGGER AS $$
DECLARE
    v_konflik INT;
BEGIN
    SELECT COUNT(*) INTO v_konflik
    FROM kelas
    WHERE id_dosen        = NEW.id_dosen
      AND id_tahun_ajaran = NEW.id_tahun_ajaran
      AND semester_aktif  = NEW.semester_aktif
      AND hari            = NEW.hari
      AND id_kelas       != COALESCE(NEW.id_kelas, -1)
      -- Cek tumpang tindih waktu
      AND (
            NEW.jam_mulai   < jam_selesai AND
            NEW.jam_selesai > jam_mulai
          );

    IF v_konflik > 0 THEN
        RAISE EXCEPTION
            'Dosen id=% sudah memiliki kelas lain pada hari % jam %-%',
            NEW.id_dosen, NEW.hari, NEW.jam_mulai, NEW.jam_selesai;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_cek_jadwal_dosen
BEFORE INSERT OR UPDATE OF id_dosen, hari, jam_mulai, jam_selesai, id_tahun_ajaran, semester_aktif
ON kelas
FOR EACH ROW
EXECUTE FUNCTION fn_cek_jadwal_dosen();
