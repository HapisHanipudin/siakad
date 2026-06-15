import { createRoute, z } from "@hono/zod-openapi";

const KrsSchema = z.object({
  id: z.string(),
  mahasiswaId: z.string(),
  tahunAjaran: z.string(),
  semester: z.string(),
  mataKuliah: z.array(
    z.object({
      kodeMk: z.string(),
      namaMk: z.string(),
      sks: z.number(),
    }),
  ),
  createdAt: z.string(),
});

const CreateKrsSchema = z.object({
  mahasiswaId: z.string().min(1, "ID Mahasiswa wajib diisi"),
  tahunAjaran: z.string().min(1, "Tahun ajaran wajib diisi"),
  semester: z.string().min(1, "Semester wajib diisi"),
  mataKuliahIds: z.array(z.string()).min(1, "Pilih minimal satu mata kuliah"),
});

export const getKrsRoute = createRoute({
  method: "get",
  path: "/krs/{mahasiswaId}",
  tags: ["KRS"],
  summary: "Dapatkan KRS mahasiswa berdasarkan ID",
  request: {
    params: z.object({
      mahasiswaId: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Data KRS mahasiswa",
      content: {
        "application/json": {
          schema: KrsSchema,
        },
      },
    },
    404: {
      description: "KRS tidak ditemukan",
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

export const createKrsRoute = createRoute({
  method: "post",
  path: "/krs",
  tags: ["KRS"],
  summary: "Input/Submit KRS baru",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateKrsSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "KRS berhasil disimpan",
      content: {
        "application/json": {
          schema: KrsSchema,
        },
      },
    },
  },
});
