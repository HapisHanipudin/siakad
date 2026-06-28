import { createRoute, z } from "@hono/zod-openapi";

const MahasiswaResponseSchema = z.object({
  id_mahasiswa: z.number(),
  nim: z.string(),
  nama_mahasiswa: z.string(),
  status_mahasiswa: z.string(),
  angkatan: z.number(),
  id_program_studi: z.number(),
  id_kurikulum: z.number(),
  id_kelompok: z.number(),
  nama_prodi: z.string().optional(),
  email: z.string().optional(),
});

const CreateMahasiswaSchema = z.object({
  nim: z.string().min(1, "NIM wajib diisi"),
  nama_mahasiswa: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  id_program_studi: z.number().default(1),
  id_kurikulum: z.number().default(1),
  id_kelompok: z.number().default(1),
  angkatan: z.number().default(2025),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const PaginatedMahasiswaSchema = z.object({
  data: z.array(MahasiswaResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export const getMahasiswaRoute = createRoute({
  method: "get",
  path: "/mahasiswa",
  tags: ["Mahasiswa"],
  summary: "Dapatkan daftar mahasiswa dengan paginasi",
  request: {
    query: z.object({
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("10"),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "Daftar mahasiswa terpaginasi",
      content: {
        "application/json": {
          schema: PaginatedMahasiswaSchema,
        },
      },
    },
  },
});

export const createMahasiswaRoute = createRoute({
  method: "post",
  path: "/mahasiswa",
  tags: ["Mahasiswa"],
  summary: "Daftar mahasiswa baru (Skenario 6)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateMahasiswaSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Mahasiswa berhasil didaftarkan beserta akun dan tagihan UKT",
      content: {
        "application/json": {
          schema: MahasiswaResponseSchema,
        },
      },
    },
    400: {
      description: "Input tidak valid / email atau NIM duplikat",
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

const ProgramStudiSchema = z.object({
  id_program_studi: z.number(),
  nama_prodi: z.string(),
  jenjang: z.string(),
});

const KurikulumSchema = z.object({
  id_kurikulum: z.number(),
  id_program_studi: z.number(),
  nama_kurikulum: z.string(),
});

const KelompokSchema = z.object({
  id_kelompok: z.number(),
  id_dosen: z.number(),
  kode_kelompok: z.string(),
  id_program_studi: z.number(),
});

export const getProgramStudiRoute = createRoute({
  method: "get",
  path: "/options/program-studi",
  tags: ["Mahasiswa Options"],
  summary: "Dapatkan semua program studi untuk opsi input",
  responses: {
    200: {
      description: "Daftar program studi",
      content: {
        "application/json": {
          schema: z.array(ProgramStudiSchema),
        },
      },
    },
  },
});

export const getKurikulumRoute = createRoute({
  method: "get",
  path: "/options/kurikulum",
  tags: ["Mahasiswa Options"],
  summary: "Dapatkan semua kurikulum untuk opsi input",
  responses: {
    200: {
      description: "Daftar kurikulum",
      content: {
        "application/json": {
          schema: z.array(KurikulumSchema),
        },
      },
    },
  },
});

export const getKelompokRoute = createRoute({
  method: "get",
  path: "/options/kelompok",
  tags: ["Mahasiswa Options"],
  summary: "Dapatkan semua kelompok untuk opsi input",
  responses: {
    200: {
      description: "Daftar kelompok",
      content: {
        "application/json": {
          schema: z.array(KelompokSchema),
        },
      },
    },
  },
});

