import { createRoute, z } from "@hono/zod-openapi";

const KelasResponseSchema = z.object({
  id_kelas: z.number(),
  id_ruangan: z.number(),
  id_program_studi: z.number(),
  id_rombel: z.number().nullable(),
  id_mata_kuliah: z.number(),
  id_dosen: z.number(),
  id_tahun_ajaran: z.number(),
  kode_kelas: z.string(),
  kuota: z.number(),
  semester_aktif: z.string(),
  jam_mulai: z.string(),
  jam_selesai: z.string(),
  hari: z.string(),
  nama_mata_kuliah: z.string().optional(),
  kode_mata_kuliah: z.string().optional(),
  sks: z.number().optional(),
  nama_dosen: z.string().optional(),
  nama_ruangan: z.string().optional(),
});

const CreateKelasSchema = z.object({
  id_ruangan: z.number(),
  id_program_studi: z.number(),
  id_rombel: z.number().nullable(),
  id_mata_kuliah: z.number(),
  id_dosen: z.number(),
  id_tahun_ajaran: z.number().default(2),
  kode_kelas: z.string().min(1, "Kode kelas wajib diisi"),
  kuota: z.number().min(1, "Kuota minimal 1"),
  semester_aktif: z.enum(["ganjil", "genap"]),
  jam_mulai: z.string().min(1, "Jam mulai wajib diisi"),
  jam_selesai: z.string().min(1, "Jam selesai wajib diisi"),
  hari: z.string().min(1, "Hari wajib diisi"),
});

export const getKelasRoute = createRoute({
  method: "get",
  path: "/kelas",
  tags: ["Kelas"],
  summary: "Dapatkan daftar kelas",
  responses: {
    200: {
      description: "Daftar kelas perkuliahan",
      content: {
        "application/json": {
          schema: z.array(KelasResponseSchema),
        },
      },
    },
  },
});

export const createKelasRoute = createRoute({
  method: "post",
  path: "/kelas",
  tags: ["Kelas"],
  summary: "Tambah kelas perkuliahan baru (Skenario 4)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateKelasSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Kelas berhasil dibuat",
      content: {
        "application/json": {
          schema: KelasResponseSchema,
        },
      },
    },
    400: {
      description: "Gagal membuat kelas (jadwal dosen bentrok / melebihi kapasitas ruangan)",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const getKelasCountRoute = createRoute({
  method: "get",
  path: "/kelas/count",
  tags: ["Kelas"],
  summary: "Dapatkan jumlah total kelas perkuliahan aktif",
  responses: {
    200: {
      description: "Jumlah total kelas perkuliahan aktif",
      content: {
        "application/json": {
          schema: z.object({
            totalKelas: z.number(),
          }),
        },
      },
    },
  },
});

const MataKuliahSchema = z.object({
  id_mata_kuliah: z.number(),
  kode_mata_kuliah: z.string(),
  nama_mata_kuliah: z.string(),
  sks: z.number(),
});

const RuanganSchema = z.object({
  id_ruangan: z.number(),
  nama_ruangan: z.string(),
  kapasitas: z.number(),
});

const RombelSchema = z.object({
  id_rombel: z.number(),
  id_program_studi: z.number(),
  nama_rombel: z.string(),
  angkatan: z.number(),
});

export const getMataKuliahOptionsRoute = createRoute({
  method: "get",
  path: "/options/mata-kuliah",
  tags: ["Kelas Options"],
  summary: "Dapatkan semua mata kuliah untuk opsi input",
  responses: {
    200: {
      description: "Daftar mata kuliah",
      content: {
        "application/json": {
          schema: z.array(MataKuliahSchema),
        },
      },
    },
  },
});

export const getRuanganOptionsRoute = createRoute({
  method: "get",
  path: "/options/ruangan",
  tags: ["Kelas Options"],
  summary: "Dapatkan semua ruangan untuk opsi input",
  responses: {
    200: {
      description: "Daftar ruangan",
      content: {
        "application/json": {
          schema: z.array(RuanganSchema),
        },
      },
    },
  },
});

export const getRombelOptionsRoute = createRoute({
  method: "get",
  path: "/options/rombel",
  tags: ["Kelas Options"],
  summary: "Dapatkan semua rombel untuk opsi input",
  responses: {
    200: {
      description: "Daftar rombel",
      content: {
        "application/json": {
          schema: z.array(RombelSchema),
        },
      },
    },
  },
});

