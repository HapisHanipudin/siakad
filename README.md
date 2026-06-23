# ⚡ SiAkad (Sistem Informasi Akademik)

### Sistem Informasi Akademik Terintegrasi.
Aplikasi ini dikembangkan sebagai proyek Ujian Akhir Semester (UAS) mata kuliah Sistem Basis Data.

---

## Deskripsi Proyek
SiAkad adalah platform manajemen data akademik perguruan tinggi yang mengelola data **Mahasiswa**, **Dosen**, **Mata Kuliah**, dan pengisian **KRS (Kartu Rencana Studi)**. Proyek ini mendemonstrasikan perancangan basis data relasional serta implementasi operasi CRUD terintegrasi menggunakan Next.js di frontend dan Hono (Cloudflare Workers) di backend.

```
Frontend (Next.js)  ↔  API Gateway (Hono)  ↔  pg (node-postgres)  ↔  PostgreSQL
```

---

## 📚 Dokumentasi Akademik & Penilaian
Proyek ini dibuat untuk memenuhi kriteria Tugas Akhir Praktikum Sistem Basis Data. 
Untuk melihat rincian pemenuhan syarat teknis (Trigger, TCL, Stored Procedure, dll) beserta pembagian tugas masing-masing anggota kelompok, silakan merujuk pada dokumen berikut:
👉 [**Dokumentasi Proyek & Pembagian Tugas**](./DOKUMENTASI_PROYEK.md)

---

## Tech Stack

| Layer      | Teknologi                          |
| ---------- | ---------------------------------- |
| Frontend   | Next.js (OpenNext), Tailwind CSS   |
| Backend    | Hono on Cloudflare Workers         |
| Migration  | node-pg-migrate                    |
| Driver     | pg (node-postgres)                 |
| Database   | PostgreSQL (Docker / Neon)         |
| Deploy     | Cloudflare Workers & Pages         |

---

## Struktur Monorepo
Proyek ini menggunakan struktur monorepo untuk menyatukan frontend, backend, dan type-sharing secara efisien:
* `/apps/web` - Aplikasi frontend Next.js (OpenNext).
* `/apps/api` - Worker API backend berbasis Hono dan pg Client.
* `/packages/shared` - Modul TypeScript shared types yang digunakan bersama oleh frontend dan backend.

---

## Local Development

### Prasyarat
- [Bun](https://bun.sh) >= 1.0
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) >= 4.0
- Akun [Cloudflare](https://cloudflare.com)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) atau Docker Engine

### Setup Awal
1. Clone repositori dan instal dependensi di root direktori:
   ```bash
   bun install
   ```

2. Jalankan database PostgreSQL lokal lewat Docker Compose:
   ```bash
   docker compose up -d db
   ```

3. Buat file `.dev.vars` di direktori `apps/api/` berdasarkan `.dev.vars.example` yang tersedia:
   ```env
   DATABASE_URL="postgresql://siakad:siakad@127.0.0.1:5432/siakad?sslmode=disable"
   JWT_SECRET="rahasia-super-aman"
   CORS_ORIGINS="http://localhost:3000"
   ```

4. Jalankan server development secara paralel (menjalankan API di port `8787` dan Web di port `3000`):
   ```bash
   bun run dev
   ```

---

## Sinkronisasi & Migrasi Database
Untuk mengelola migrasi skema database (termasuk custom ENUM types dan trigger) menggunakan `node-pg-migrate`, masuk ke direktori backend:

```bash
cd apps/api

# 1. Jalankan seluruh migrasi skema (UP)
bun run db:migrate

# 2. Batalkan migrasi skema secara bertahap (DOWN)
bun run db:migrate:down

# 3. Buat file template migrasi baru
bun run db:migrate:create <nama_migrasi>
```

---

## Anggota Kelompok
* **Given Elyada Bani** (2510511046)
* **Ahya Mujahid Almadani** (2510511047)
* **Dimitri Putranto** (2510511059)
* **Muhammad Hafizh Hanifuddin** (2510511060)
* **Muhammad Akbar Alfarizy** (2510511068)


UPN Veteran Jakarta 2026
