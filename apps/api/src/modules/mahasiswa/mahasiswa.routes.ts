import { createRoute, z } from "@hono/zod-openapi";

const MahasiswaSchema = z.object({
  id: z.string(),
  nama: z.string(),
  email: z.string().email(),
  role: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateMahasiswaSchema = z.object({
  nama: z.string().min(1, "Nama tidak boleh kosong"),
  email: z.string().email("Format email tidak valid"),
});

export const getMahasiswaRoute = createRoute({
  method: "get",
  path: "/mahasiswa",
  tags: ["Mahasiswa"],
  summary: "Dapatkan daftar mahasiswa",
  responses: {
    200: {
      description: "Daftar mahasiswa",
      content: {
        "application/json": {
          schema: z.array(MahasiswaSchema),
        },
      },
    },
  },
});

export const createMahasiswaRoute = createRoute({
  method: "post",
  path: "/mahasiswa",
  tags: ["Mahasiswa"],
  summary: "Tambah mahasiswa baru",
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
      description: "Mahasiswa berhasil dibuat",
      content: {
        "application/json": {
          schema: MahasiswaSchema,
        },
      },
    },
    400: {
      description: "Input tidak valid",
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
