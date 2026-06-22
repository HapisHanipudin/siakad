# Web Portal (Next.js + OpenNext)

Aplikasi frontend portal SiAkad yang dibangun menggunakan **Next.js** dan dioptimalkan untuk di-deploy ke Cloudflare Pages menggunakan **OpenNext** (`@opennextjs/cloudflare`).

## Menjalankan di Lokal

### 1. Jalankan Dev Server

```bash
bun run dev
```

Server akan berjalan di [http://localhost:3000](http://localhost:3000).

### 2. Preview Lokal Runtime Cloudflare

Untuk menguji build Next.js lokal pada runtime emulator Cloudflare (Wrangler):

```bash
bun run preview
```

## Cara Deploy (Cloudflare Pages)

Proyek ini terintegrasi dengan **OpenNext** untuk mempermudah build dan upload aset statis serta edge routes. 

### Konfigurasi Cloudflare Pages (Build Settings)

Gunakan parameter berikut saat mengatur proyek di dashboard Cloudflare Pages:

- **Framework preset**: `None` (atau custom)
- **Root directory**: `/` (repo root)
- **Build command**: `bun install --frozen-lockfile && cd apps/web && bun run build` (menggunakan OpenNext)
- **Build output directory**: `apps/web/.open-next/assets` (untuk aset statis)

### Environment Variables untuk Cloudflare Pages

Pastikan variabel-variabel berikut telah diatur di Settings proyek Cloudflare Pages Anda:

- `NEXT_PUBLIC_API_URL`: URL API gateway produksi backend Anda (contoh: `https://siakad-api.hapishanipudin.workers.dev`, **tanpa trailing slash**).
- `NEXTJS_ENV`: Set ke `production` untuk mengoptimalkan performa runtime Next.js.
