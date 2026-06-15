import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { getKrsRoute, createKrsRoute } from "./krs.routes";

// Karena database minimalis hanya berisi tabel users default,
// kita menyediakan mock handler KRS ini sebagai referensi
// sebelum Anda membuat tabel krs dan mata_kuliah sendiri.
export const getKrsHandler: RouteHandler<typeof getKrsRoute, AppEnv> = async (c) => {
  const { mahasiswaId } = c.req.valid("param");

  // Mock data krs
  const mockKrs = {
    id: `krs-${crypto.randomUUID().slice(0, 8)}`,
    mahasiswaId,
    tahunAjaran: "2025/2026",
    semester: "Genap",
    mataKuliah: [
      { kodeMk: "IF101", namaMk: "Sistem Basis Data", sks: 3 },
      { kodeMk: "IF102", namaMk: "Pemrograman Web", sks: 3 },
      { kodeMk: "IF103", namaMk: "Algoritma dan Struktur Data", sks: 4 },
    ],
    createdAt: new Date().toISOString(),
  };

  return c.json(mockKrs, 200);
};

export const createKrsHandler: RouteHandler<typeof createKrsRoute, AppEnv> = async (
  c,
) => {
  const body = c.req.valid("json");

  // Mock response berhasil
  const mockSavedKrs = {
    id: `krs-${crypto.randomUUID().slice(0, 8)}`,
    mahasiswaId: body.mahasiswaId,
    tahunAjaran: body.tahunAjaran,
    semester: body.semester,
    // Mengubah ID mk menjadi mock list mata kuliah
    mataKuliah: body.mataKuliahIds.map((id, index) => ({
      kodeMk: id,
      namaMk: `Mata Kuliah Mock ${index + 1}`,
      sks: 3,
    })),
    createdAt: new Date().toISOString(),
  };

  return c.json(mockSavedKrs, 201);
};
