"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

type Stats = {
  totalMahasiswa: number;
  totalDosen: number;
  totalKelas: number;
  announcements: {
    isi_pengumuman: string;
    tanggal_dibuat: string;
  }[];
};

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalKelasReal, setTotalKelasReal] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard-stats`);
        const data = await res.json() as Stats;
        setStats(data);

        // Fetch real total active classes count for year 2025/2026
        const kCountRes = await fetch(`${API_URL}/kelas/count`);
        if (kCountRes.ok) {
          const kData = await kCountRes.json() as { totalKelas: number };
          setTotalKelasReal(kData.totalKelas);
        }
      } catch (err) {
        console.error("Gagal mengambil data statistik:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50/50 py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Akademik SiAkad
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl text-sm sm:text-base">
            Sistem Informasi Akademik Terintegrasi. Mengelola KRS, kelas perkuliahan, data mahasiswa, dosen, serta input nilai secara transaksional berbasis PostgreSQL live.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Statistics Cards (Live data) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Mahasiswa</span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">👥</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">
              {loading ? "..." : stats?.totalMahasiswa}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Status aktif terdaftar</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dosen</span>
              <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">👨‍🏫</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">
              {loading ? "..." : stats?.totalDosen}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">Status aktif mengajar</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kelas</span>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">📝</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">
              {loading ? "..." : (totalKelasReal !== null ? totalKelasReal : stats?.totalKelas)}
            </p>
            <p className="text-xs text-indigo-600 font-medium mt-1">Kelas perkuliahan aktif</p>
          </div>
        </div>

        {/* Quick Actions & Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Menu */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Akses Cepat Layanan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/mahasiswa" className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer group no-underline text-inherit">
                <span className="text-2xl mb-2 block">🎓</span>
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Portal Mahasiswa</h3>
                <p className="text-xs text-slate-500 mt-1">Pendaftaran mahasiswa baru, buat tagihan UKT, dan bayar UKT.</p>
              </Link>

              <Link href="/krs" className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer group no-underline text-inherit">
                <span className="text-2xl mb-2 block">📅</span>
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Pengisian KRS</h3>
                <p className="text-xs text-slate-500 mt-1">Pilih mata kuliah untuk semester aktif, serta ajukan/batalkan KRS.</p>
              </Link>

              <Link href="/dosen" className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer group no-underline text-inherit">
                <span className="text-2xl mb-2 block">📋</span>
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Portal Dosen</h3>
                <p className="text-xs text-slate-500 mt-1">Input nilai tugas, UTS, dan UAS mahasiswa bimbingan akademik.</p>
              </Link>

              <Link href="/admin" className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer group no-underline text-inherit">
                <span className="text-2xl mb-2 block">⚙️</span>
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Konfigurasi Kelas</h3>
                <p className="text-xs text-slate-500 mt-1">Admin mendaftarkan kelas baru beserta kuota dan ruangan.</p>
              </Link>
            </div>
          </div>

          {/* Side Info / Live Announcements */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl">
            <div>
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10">
                Pengumuman Akademik Live
              </span>
              
              {loading ? (
                <p className="text-xs text-slate-300 mt-6">Memuat pengumuman...</p>
              ) : !stats?.announcements || stats.announcements.length === 0 ? (
                <p className="text-xs text-slate-300 mt-6">Tidak ada pengumuman.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {stats.announcements.map((a, index) => (
                    <div key={index} className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                      <p className="text-sm font-semibold leading-snug">{a.isi_pengumuman}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Dibuat: {new Date(a.tanggal_dibuat).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>SiAkad UPNVJ 2026</span>
              <span className="text-white">Live DB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}