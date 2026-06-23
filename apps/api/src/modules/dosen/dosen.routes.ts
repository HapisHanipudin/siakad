import { createRoute, z } from "@hono/zod-openapi";

const DosenResponseSchema = z.object({
  id_dosen: z.number(),
  nidn: z.string(),
  nama_dosen: z.string(),
  gelar: z.string(),
  id_fakultas: z.number(),
  nama_fakultas: z.string().optional(),
  email: z.string().optional(),
  jumlah_bimbingan: z.number().optional(),
});

const BimbinganMahasiswaSchema = z.object({
  id_mahasiswa: z.number(),
  nim: z.string(),
  nama_mahasiswa: z.string(),
  status_mahasiswa: z.string(),
  angkatan: z.number(),
  nama_prodi: z.string(),
});

const CreateDosenSchema = z.object({
  nidn: z.string().min(1, "NIDN tidak boleh kosong"),
  nama_dosen: z.string().min(1, "Nama tidak boleh kosong"),
  gelar: z.enum(["D3", "D4", "S1", "S2", "S3"]),
  email: z.string().email("Format email tidak valid"),
  id_fakultas: z.number().default(1),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const getDosenRoute = createRoute({
  method: "get",
  path: "/dosen",
  tags: ["Dosen"],
  summary: "Dapatkan daftar dosen",
  request: {
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "Daftar dosen",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(DosenResponseSchema),
            meta: z.object({
              total: z.number(),
              page: z.number(),
              limit: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
  },
});

export const getBimbinganRoute = createRoute({
  method: "get",
  path: "/dosen/bimbingan/{id_dosen}",
  tags: ["Dosen"],
  summary: "Dapatkan mahasiswa bimbingan dosen wali",
  request: {
    params: z.object({
      id_dosen: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Daftar mahasiswa bimbingan",
      content: {
        "application/json": {
          schema: z.array(BimbinganMahasiswaSchema),
        },
      },
    },
  },
});

export const createDosenRoute = createRoute({
  method: "post",
  path: "/dosen",
  tags: ["Dosen"],
  summary: "Tambah dosen baru",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateDosenSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Dosen berhasil dibuat",
      content: {
        "application/json": {
          schema: DosenResponseSchema,
        },
      },
    },
    400: {
      description: "Input tidak valid / NIDN atau email duplikat",
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
