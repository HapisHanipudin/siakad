import { createRoute, z } from "@hono/zod-openapi";

const DosenSchema = z.object({
  id: z.string(),
  nama: z.string(),
  email: z.string().email(),
  role: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateDosenSchema = z.object({
  nama: z.string().min(1, "Nama tidak boleh kosong"),
  email: z.string().email("Format email tidak valid"),
});

export const getDosenRoute = createRoute({
  method: "get",
  path: "/dosen",
  tags: ["Dosen"],
  summary: "Dapatkan daftar dosen",
  responses: {
    200: {
      description: "Daftar dosen",
      content: {
        "application/json": {
          schema: z.array(DosenSchema),
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
          schema: DosenSchema,
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
