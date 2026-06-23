import { createRoute, z } from "@hono/zod-openapi";

const StatusMahasiswaResponse = z.object({
  nama_fakultas: z.string(),
  nama_prodi: z.string(),
  status_mahasiswa: z.string(),
  jumlah_mahasiswa: z.number(),
});

const PendapatanUktResponse = z.object({
  nama_prodi: z.string(),
  total_pendapatan_ukt: z.number(),
});

const KesulitanMatkulResponse = z.object({
  kode_mata_kuliah: z.string(),
  nama_mata_kuliah: z.string(),
  rata_rata_nilai: z.number(),
});

const PerformaBasisDataResponse = z.object({
  nim: z.string(),
  nama_mahasiswa: z.string(),
  nama_mata_kuliah: z.string(),
  nilai_akhir_angka: z.number(),
  kategori_performa: z.string(),
});

const BebanKerjaDosenResponse = z.object({
  nidn: z.string(),
  nama_dosen: z.string(),
  total_kelas_diajar: z.number(),
  total_beban_sks: z.number(),
});

export const getStatusMahasiswaRoute = createRoute({
  method: "get",
  path: "/laporan/status-mahasiswa",
  tags: ["Laporan"],
  summary: "Rekapitulasi Status Mahasiswa per Prodi dan Fakultas",
  responses: {
    200: {
      description: "Rekapitulasi status mahasiswa",
      content: {
        "application/json": {
          schema: z.array(StatusMahasiswaResponse),
        },
      },
    },
  },
});

export const getPendapatanUktRoute = createRoute({
  method: "get",
  path: "/laporan/pendapatan-ukt",
  tags: ["Laporan"],
  summary: "Laporan Pendapatan UKT per Prodi pada Semester Ganjil",
  responses: {
    200: {
      description: "Pendapatan UKT per prodi",
      content: {
        "application/json": {
          schema: z.array(PendapatanUktResponse),
        },
      },
    },
  },
});

export const getKesulitanMatkulRoute = createRoute({
  method: "get",
  path: "/laporan/kesulitan-matkul",
  tags: ["Laporan"],
  summary: "Analisis Kesulitan Mata Kuliah berdasarkan Rata-rata Nilai",
  responses: {
    200: {
      description: "Analisis rata-rata nilai mata kuliah",
      content: {
        "application/json": {
          schema: z.array(KesulitanMatkulResponse),
        },
      },
    },
  },
});

export const getPerformaBasisDataRoute = createRoute({
  method: "get",
  path: "/laporan/performa-basis-data",
  tags: ["Laporan"],
  summary: "Top & Bottom Performers mata kuliah Sistem Basis Data",
  responses: {
    200: {
      description: "Top & Bottom Performers",
      content: {
        "application/json": {
          schema: z.array(PerformaBasisDataResponse),
        },
      },
    },
  },
});

export const getBebanKerjaDosenRoute = createRoute({
  method: "get",
  path: "/laporan/beban-kerja-dosen",
  tags: ["Laporan"],
  summary: "Dashboard Beban Kerja Dosen pada TA 2025/2026",
  responses: {
    200: {
      description: "Beban kerja dosen",
      content: {
        "application/json": {
          schema: z.array(BebanKerjaDosenResponse),
        },
      },
    },
  },
});
