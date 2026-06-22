# API Service (Hono + node-pg-migrate)

Stack yang digunakan di folder ini:

- **Hono**: HTTP framework di Cloudflare Workers
- **node-pg-migrate**: Driver untuk migrasi skema database PostgreSQL menggunakan TypeScript/JavaScript
- **pg (node-postgres)**: Client driver untuk koneksi ke basis data PostgreSQL (Neon/Docker)

## Struktur Direktori

- `src/index.ts` - Entrypoint Worker
- `src/app.ts` - Routing modular Hono dan inisialisasi route endpoints
- `src/db/index.ts` - Inisialisasi client connection `pg`
- `migrations/` - File migrasi skema database

## Menjalankan API (Local Dev)

```bash
bun run dev
```

## Perintah Migrasi Database

```bash
# 1. Jalankan migrasi skema (UP)
bun run db:migrate

# 2. Revert migrasi skema (DOWN)
bun run db:migrate:down

# 3. Buat file template migrasi baru
bun run db:migrate:create <nama_migrasi>
```

## Environment Variables

Pastikan variabel di bawah ini tersedia di file `.dev.vars` (untuk lokal) atau Cloudflare Secrets (untuk produksi):

- `DATABASE_URL`: URL koneksi PostgreSQL utama (Neon / Docker lokal)
- `JWT_SECRET`: Secret key untuk otentikasi JWT token
- `CORS_ORIGINS`: Origin CORS yang diizinkan (dipisah koma)
- `NEON_DATABASE_URL`: URL cadangan/alternatif untuk live database Neon

*Catatan: runtime API akan secara otomatis menggunakan `HYPERDRIVE.connectionString` jika binding Hyperdrive tersedia di Cloudflare, dan melakukan fallback ke `DATABASE_URL` jika dijalankan di mode local development.*
