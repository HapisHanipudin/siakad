import { createRoute, z } from "@hono/zod-openapi";

const TagihanResponseSchema = z.object({
  id_tagihan: z.number(),
  id_mahasiswa: z.number(),
  id_tahun_ajaran: z.number(),
  semester_aktif: z.string(),
  tipe_tagihan: z.string(),
  nominal: z.number(),
  status_tagihan: z.string(),
  tenggat: z.string(),
  nama_tahun_ajaran: z.string().optional(),
});

const PembayaranResponseSchema = z.object({
  id_pembayaran: z.number(),
  id_tagihan: z.number(),
  tanggal_bayar: z.string(),
  nominal_bayar: z.number(),
  status_pembayaran: z.string(),
  message: z.string().optional(),
});

const CreatePembayaranSchema = z.object({
  id_tagihan: z.number(),
  nominal_bayar: z.number().min(1, "Nominal pembayaran minimal 1 rupiah"),
});

export const getTagihanRoute = createRoute({
  method: "get",
  path: "/tagihan/{id_mahasiswa}",
  tags: ["Pembayaran"],
  summary: "Dapatkan tagihan mahasiswa",
  request: {
    params: z.object({
      id_mahasiswa: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Daftar tagihan mahasiswa",
      content: {
        "application/json": {
          schema: z.array(TagihanResponseSchema),
        },
      },
    },
  },
});

export const createPembayaranRoute = createRoute({
  method: "post",
  path: "/pembayaran",
  tags: ["Pembayaran"],
  summary: "Proses pembayaran UKT / tagihan (Skenario 3)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePembayaranSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Pembayaran berhasil dicatat",
      content: {
        "application/json": {
          schema: PembayaranResponseSchema,
        },
      },
    },
    400: {
      description: "Gagal membayar (tagihan sudah lunas / nominal tidak sesuai)",
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
