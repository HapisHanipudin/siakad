# ⚡ SiAkad (Sistem Informasi Akademik)

### Sistem Informasi Akademik Terintegrasi.
Aplikasi ini dikembangkan sebagai proyek Ujian Akhir Semester (UAS) mata kuliah Sistem Basis Data.

---

## Deskripsi Proyek
SiAkad adalah platform manajemen data akademik perguruan tinggi yang mengelola data **Mahasiswa**, **Dosen**, **Mata Kuliah**, dan pengisian **KRS (Kartu Rencana Studi)**. Proyek ini mendemonstrasikan perancangan basis data relasional serta implementasi operasi CRUD terintegrasi menggunakan Next.js di frontend dan Hono (Cloudflare Workers) di backend.

```
Frontend (Next.js)  ↔  API Gateway (Hono)  ↔  Drizzle ORM  ↔  Neon DB (PostgreSQL)
```

---

## Tech Stack

| Layer    | Teknologi                       |
| -------- | ------------------------------- |
| Frontend | Next.js, Tailwind CSS           |
| Backend  | Hono on Cloudflare Workers      |
| ORM      | Drizzle ORM                     |
| Database | Neon DB (PostgreSQL)            |
| Deploy   | Cloudflare Workers & Pages      |

---

## Struktur Monorepo
Proyek ini menggunakan struktur monorepo untuk menyatukan frontend, backend, dan type-sharing secara efisien:
* `/apps/web` - Aplikasi frontend Next.js.
* `/apps/api` - Worker API backend berbasis Hono dan Drizzle ORM.
* `/packages/shared` - Modul TypeScript shared types yang digunakan bersama oleh frontend dan backend.

---

## Local Development

### Prasyarat
- [Bun](https://bun.sh) >= 1.0
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) >= 4.0
- Akun [Cloudflare](https://cloudflare.com) & [Neon DB](https://neon.tech)

### Setup Awal
1. Clone repositori dan instal dependensi di root direktori:
   ```bash
   bun install
   ```

2. Buat file `.dev.vars` di direktori `apps/api/` berdasarkan `.dev.vars.example` yang tersedia:
   ```env
   NEON_DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   JWT_SECRET="rahasia-super-aman"
   CORS_ORIGINS="http://localhost:3000"
   ```

3. Jalankan server development secara paralel (menjalankan API di port `8787` dan Web di port `3000`):
   ```bash
   bun run dev
   ```

---

## Sinkronisasi Database (Drizzle ORM)
Untuk melakukan perubahan schema dan migrasi database ke Neon DB, masuk ke direktori backend:

```bash
cd apps/api

# 1. Generate file migrasi SQL berdasarkan schema.ts
bun run db:generate

# 2. Jalankan migrasi SQL ke database Neon DB
bun run db:migrate

# 3. Sinkronisasi schema langsung (sangat cepat untuk fase development)
bun run db:push

# 4. Membuka GUI Drizzle Studio di browser untuk melihat isi tabel
bun run db:studio
```

---

## Anggota Kelompok
* **Given Elyada Bani** (2510511046)
* **Ahya Mujahid Almadani** (2510511047)
* **Dimitri Putranto** (2510511059)
* **Muhammad Hafizh Hanifuddin** (2510511060)
* **Muhammad Akbar Alfarizy** (2510511068)


UPN Veteran Jakarta 2026
