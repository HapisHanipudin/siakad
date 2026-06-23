import { createRoute, z } from "@hono/zod-openapi";

const KrsDetailSchema = z.object({
  id_detail_krs: z.number(),
  id_krs: z.number(),
  id_kelas: z.number(),
  nilai_tugas: z.number(),
  nilai_uts: z.number(),
  nilai_uas: z.number(),
  nilai_akhir_angka: z.number(),
  nilai_akhir_huruf: z.string().nullable(),
  kode_kelas: z.string().optional(),
  nama_mata_kuliah: z.string().optional(),
  sks: z.number().optional(),
  nama_dosen: z.string().optional(),
  total_pertemuan: z.number().optional(),
  total_hadir: z.number().optional(),
});

const KrsResponseSchema = z.object({
  id_krs: z.number(),
  id_mahasiswa: z.number(),
  id_tahun_ajaran: z.number(),
  nama_tahun_ajaran: z.string().optional(),
  semester_aktif: z.string(),
  status_krs: z.string(),
  catatan: z.string().nullable(),
  detail: z.array(KrsDetailSchema),
});

const SubmitKrsSchema = z.object({
  id_mahasiswa: z.number(),
  id_kelas_list: z.array(z.number()).min(1, "Pilih minimal satu kelas"),
});

export const getKrsRoute = createRoute({
  method: "get",
  path: "/krs/{id_mahasiswa}",
  tags: ["KRS"],
  summary: "Dapatkan KRS mahasiswa",
  request: {
    params: z.object({
      id_mahasiswa: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Data KRS mahasiswa",
      content: {
        "application/json": {
          schema: KrsResponseSchema,
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
  path: "/krs/submit",
  tags: ["KRS"],
  summary: "Pengajuan & Persetujuan KRS Baru (Skenario 1)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SubmitKrsSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "KRS berhasil diajukan dan disahkan",
      content: {
        "application/json": {
          schema: KrsResponseSchema,
        },
      },
    },
    400: {
      description: "Gagal memproses KRS (kuota habis, prasyarat kurang, dll)",
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

export const cancelKrsRoute = createRoute({
  method: "delete",
  path: "/krs/{id_krs}",
  tags: ["KRS"],
  summary: "Pembatalan KRS Mahasiswa (Skenario 5)",
  request: {
    params: z.object({
      id_krs: z.string(),
    }),
  },
  responses: {
    200: {
      description: "KRS berhasil dibatalkan",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Gagal membatalkan KRS (KRS sudah disahkan/sah)",
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
