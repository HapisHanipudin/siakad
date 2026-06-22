import { createRoute, z } from "@hono/zod-openapi";

const GradeUpdateSchema = z.object({
  id_detail_krs: z.number(),
  nilai_tugas: z.number().min(0).max(100),
  nilai_uts: z.number().min(0).max(100),
  nilai_uas: z.number().min(0).max(100),
});

const InputNilaiRequestSchema = z.object({
  updates: z.array(GradeUpdateSchema).min(1, "Minimal 1 data nilai wajib di-update"),
  id_dosen_user: z.number().default(7), // default user dosen Aris
});

export const updateGradeRoute = createRoute({
  method: "post",
  path: "/nilai/update",
  tags: ["Nilai"],
  summary: "Update/Input nilai akhir mahasiswa (Skenario 2)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: InputNilaiRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Nilai berhasil diperbarui dan dikalkulasi otomatis",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            count: z.number(),
          }),
        },
      },
    },
    400: {
      description: "Nilai di luar rentang 0-100 atau ID tidak valid",
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
