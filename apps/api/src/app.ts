import { createRoute, z } from "@hono/zod-openapi";
import { getValidatedEnv } from "./env";
import { createRouter } from "./factory";
import { corsMiddleware } from "./middlewares/cors";
import { createDb } from "./db";
import { mahasiswaRoutes } from "./modules/mahasiswa";
import { dosenRoutes } from "./modules/dosen";
import { krsRoutes } from "./modules/krs";
import { kelasRoutes } from "./modules/kelas";
import { nilaiRoutes } from "./modules/nilai";
import { pembayaranRoutes } from "./modules/pembayaran";
import { laporanRoutes } from "./modules/laporan";

const app = createRouter();

app.use("*", corsMiddleware);

app.use("*", async (c, next) => {
  try {
    getValidatedEnv(c.env);
    await next();
  } catch {
    return c.json({ message: "Invalid environment variables" }, 500);
  }
});

app.route("/", mahasiswaRoutes);
app.route("/", dosenRoutes);
app.route("/", krsRoutes);
app.route("/", kelasRoutes);
app.route("/", nilaiRoutes);
app.route("/", pembayaranRoutes);
app.route("/", laporanRoutes);

app.get("/dashboard-stats", async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  await client.connect();
  try {
    const mRes = await client.query("SELECT COUNT(*) FROM mahasiswa WHERE status_mahasiswa = 'aktif'");
    const dRes = await client.query("SELECT COUNT(*) FROM dosen");
    const kRes = await client.query(`
      SELECT COUNT(*) FROM kelas k
      JOIN tahun_ajaran ta ON k.id_tahun_ajaran = ta.id_tahun_ajaran
      WHERE ta.nama_tahun_ajaran = '2025/2026'
    `);
    
    const aRes = await client.query(`
      SELECT isi_pengumuman, tanggal_dibuat 
      FROM pengumuman 
      ORDER BY id_pengumuman DESC 
      LIMIT 3
    `);

    return c.json({
      totalMahasiswa: parseInt(mRes.rows[0].count, 10),
      totalDosen: parseInt(dRes.rows[0].count, 10),
      totalKelas: parseInt(kRes.rows[0].count, 10),
      announcements: aRes.rows,
    }, 200);
  } catch (error: any) {
    return c.json({ message: error.message || "Failed to load dashboard stats" }, 500);
  } finally {
    await client.end();
  }
});

const docRoute = createRoute({
  method: "get",
  path: "/doc",
  tags: ["Docs"],
  responses: {
    200: {
      description: "OpenAPI JSON spec",
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
    },
  },
});

const referenceRoute = createRoute({
  method: "get",
  path: "/reference",
  tags: ["Docs"],
  responses: {
    200: {
      description: "Scalar docs UI",
      content: {
        "text/html": {
          schema: z.string(),
        },
      },
    },
  },
});

app.openapi(docRoute, (c) => {
  return c.json(
    app.getOpenAPI31Document({
      openapi: "3.1.0",
      info: {
        title: "SiAkad API",
        version: "1.0.0",
      },
    }),
    200,
  );
});

app.openapi(referenceRoute, (c) => {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>SiAkad API Reference</title>
  </head>
  <body>
    <script id=\"api-reference\" data-url=\"/doc\"></script>
    <script src=\"https://cdn.jsdelivr.net/npm/@scalar/api-reference\"></script>
  </body>
</html>`;

  return c.html(html, 200);
});

export { app };
