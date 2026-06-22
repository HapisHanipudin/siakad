// Shared types antara web dan api

export type Mahasiswa = {
  id_mahasiswa: number;
  id_program_studi: number;
  id_kurikulum: number;
  id_kelompok: number;
  nim: string;
  nama_mahasiswa: string;
  status_mahasiswa: 'aktif' | 'cuti' | 'lulus' | 'drop_out';
  angkatan: number;
  nama_prodi?: string;
  email?: string;
};

export type Dosen = {
  id_dosen: number;
  id_fakultas: number;
  nidn: string;
  nama_dosen: string;
  gelar: 'D3' | 'D4' | 'S1' | 'S2' | 'S3';
  nama_fakultas?: string;
  email?: string;
};

export type MataKuliah = {
  id_mata_kuliah: number;
  kode_mata_kuliah: string;
  nama_mata_kuliah: string;
  sks: number;
};

export type Kelas = {
  id_kelas: number;
  id_ruangan: number;
  id_program_studi: number;
  id_rombel: number | null;
  id_mata_kuliah: number;
  id_dosen: number;
  id_tahun_ajaran: number;
  kode_kelas: string;
  kuota: number;
  semester_aktif: 'ganjil' | 'genap';
  jam_mulai: string;
  jam_selesai: string;
  hari: string;
  // Join fields for convenience
  nama_mata_kuliah?: string;
  kode_mata_kuliah?: string;
  sks?: number;
  nama_dosen?: string;
  nama_ruangan?: string;
};

export type Krs = {
  id_krs: number;
  id_mahasiswa: number;
  id_tahun_ajaran: number;
  semester_aktif: 'ganjil' | 'genap';
  status_krs: 'draft' | 'menunggu' | 'ditolak' | 'sah';
  catatan: string | null;
  nama_tahun_ajaran?: string;
  detail?: DetailKrs[];
};

export type DetailKrs = {
  id_detail_krs: number;
  id_krs: number;
  id_kelas: number;
  nilai_tugas: number;
  nilai_uts: number;
  nilai_uas: number;
  nilai_akhir_angka: number;
  nilai_akhir_huruf: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | null;
  // Join fields for class details
  kode_kelas?: string;
  nama_mata_kuliah?: string;
  sks?: number;
  nama_dosen?: string;
};

export type Tagihan = {
  id_tagihan: number;
  id_mahasiswa: number;
  id_tahun_ajaran: number;
  semester_aktif: 'ganjil' | 'genap';
  tipe_tagihan: 'ukt' | 'spi' | 'denda';
  nominal: number;
  status_tagihan: 'belum' | 'diverifikasi' | 'lunas';
  tenggat: string;
  nama_tahun_ajaran?: string;
};

export type Pembayaran = {
  id_pembayaran: number;
  id_tagihan: number;
  tanggal_bayar: string;
  nominal_bayar: number;
  status_pembayaran: 'belum' | 'diverifikasi' | 'lunas';
};
