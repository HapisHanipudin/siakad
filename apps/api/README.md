# API Boilerplate (Hono + Drizzle)

Stack yang disiapkan di folder ini:

- Hono sebagai HTTP framework di Cloudflare Workers
- Drizzle ORM + Drizzle Kit untuk schema dan migration
- Neon serverless driver untuk PostgreSQL

## Struktur

- `src/index.ts` entrypoint Worker
- `src/routes/*` route modular
- `src/db/schema.ts` definisi tabel
- `src/db/client.ts` inisialisasi Drizzle client
- `drizzle.config.ts` konfigurasi migration

## Menjalankan

```bash
bun run dev
```

## Database Commands

```bash
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
```

## Environment

Pastikan variabel di bawah tersedia di `.dev.vars` atau `.env`:

- `NEON_DATABASE_URL`
- `HYPERDRIVE.connectionString` untuk koneksi runtime di Cloudflare Workers
- `JWT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `WAKATIME_CLIENT_ID`
- `WAKATIME_CLIENT_SECRET`
- `CORS_ORIGINS` (comma-separated, support wildcard `*.`)

Catatan: migrasi lokal masih memakai `NEON_DATABASE_URL`, sedangkan runtime API akan memakai `HYPERDRIVE.connectionString` jika binding Hyperdrive tersedia.
