"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface StatusMahasiswa {
  nama_fakultas: string;
  nama_prodi: string;
  status_mahasiswa: string;
  jumlah_mahasiswa: number;
}

interface PendapatanUkt {
  nama_prodi: string;
  total_pendapatan_ukt: number;
}

interface KesulitanMatkul {
  kode_mata_kuliah: string;
  nama_mata_kuliah: string;
  rata_rata_nilai: number;
}

interface PerformaBasisData {
  nim: string;
  nama_mahasiswa: string;
  nama_mata_kuliah: string;
  nilai_akhir_angka: number;
  kategori_performa: string;
}

interface BebanKerjaDosen {
  nidn: string;
  nama_dosen: string;
  total_kelas_diajar: number;
  total_beban_sks: number;
}

export default function LaporanDashboard() {
  const [statusMahasiswa, setStatusMahasiswa] = useState<StatusMahasiswa[]>([]);
  const [pendapatanUkt, setPendapatanUkt] = useState<PendapatanUkt[]>([]);
  const [kesulitanMatkul, setKesulitanMatkul] = useState<KesulitanMatkul[]>([]);
  const [performaBasisData, setPerformaBasisData] = useState<PerformaBasisData[]>([]);
  const [bebanKerjaDosen, setBebanKerjaDosen] = useState<BebanKerjaDosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusRes, uktRes, kesulitanRes, performaRes, bebanRes] = await Promise.all([
        fetch(`${API_URL}/laporan/status-mahasiswa`),
        fetch(`${API_URL}/laporan/pendapatan-ukt`),
        fetch(`${API_URL}/laporan/kesulitan-matkul`),
        fetch(`${API_URL}/laporan/performa-basis-data`),
        fetch(`${API_URL}/laporan/beban-kerja-dosen`),
      ]);

      if (!statusRes.ok || !uktRes.ok || !kesulitanRes.ok || !performaRes.ok || !bebanRes.ok) {
        throw new Error("Satu atau lebih API laporan gagal merespon.");
      }

      const [statusData, uktData, kesulitanData, performaData, bebanData] = await Promise.all([
        statusRes.json(),
        uktRes.json(),
        kesulitanRes.json(),
        performaRes.json(),
        bebanRes.json(),
      ]);

      setStatusMahasiswa(statusData as StatusMahasiswa[]);
      setPendapatanUkt(uktData as PendapatanUkt[]);
      setKesulitanMatkul(kesulitanData as KesulitanMatkul[]);
      setPerformaBasisData(performaData as PerformaBasisData[]);
      setBebanKerjaDosen(bebanData as BebanKerjaDosen[]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Format currency helper
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Aggregates for summary cards
  const grandTotalUkt = pendapatanUkt.reduce((sum, item) => sum + item.total_pendapatan_ukt, 0);
  const totalBebanSks = bebanKerjaDosen.reduce((sum, item) => sum + item.total_beban_sks, 0);
  const avgSksBeban = bebanKerjaDosen.length > 0 ? (totalBebanSks / bebanKerjaDosen.length).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center text-slate-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-sm font-medium">Sedang memuat data laporan analitik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center text-slate-800 px-6">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 shadow-sm max-w-md w-full text-center">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-lg font-bold mt-2">Error Memuat Laporan</h2>
          <p className="text-sm mt-1 text-red-500">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <Link href="/admin" className="hover:text-indigo-600 transition-colors no-underline">
                Portal Admin
              </Link>
              <span>/</span>
              <span className="text-slate-500">Laporan Eksekutif</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Laporan Analitik & Dashboard
            </h1>
          </div>
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors shadow-sm self-start"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* ==================== SUMMARY CARDS ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Total Pendapatan UKT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pendapatan UKT</span>
                <span className="p-2 bg-green-50 text-green-600 rounded-xl text-lg">💰</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{formatRupiah(grandTotalUkt)}</h2>
              <p className="text-xs text-slate-400 mt-2">Akumulasi UKT lunas pada Semester Ganjil.</p>
            </div>
            <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
              {pendapatanUkt.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-500">
                  <span className="truncate">{item.nama_prodi}</span>
                  <span className="font-semibold">{formatRupiah(item.total_pendapatan_ukt)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Beban SKS Dosen */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Beban Mengajar Dosen</span>
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-lg">👨‍🏫</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{avgSksBeban} SKS</h2>
              <p className="text-xs text-slate-400 mt-2">Rata-rata beban SKS dosen pengajar pada TA 2025/2026.</p>
            </div>
            <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Total Kelas Berjalan</span>
                <span className="font-semibold text-slate-800">
                  {bebanKerjaDosen.reduce((sum, item) => sum + item.total_kelas_diajar, 0)} Kelas
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Total Akumulasi SKS</span>
                <span className="font-semibold text-slate-800">{totalBebanSks} SKS</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Dosen Terdaftar</span>
                <span className="font-semibold text-slate-800">{bebanKerjaDosen.length} Orang</span>
              </div>
            </div>
          </div>

          {/* Card 3: Dashboard Ringkasan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Performa Terendah Matkul</span>
                <span className="p-2 bg-rose-50 text-rose-600 rounded-xl text-lg">📈</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {kesulitanMatkul.length > 0 ? kesulitanMatkul[0].rata_rata_nilai : "0"} / 100
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Rata-rata terendah diraih pada:{" "}
                <span className="font-semibold text-indigo-600">
                  {kesulitanMatkul.length > 0 ? kesulitanMatkul[0].nama_mata_kuliah : "-"}
                </span>
              </p>
            </div>
            <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Total Mata Kuliah Teranalisis</span>
                <span className="font-semibold text-slate-800">{kesulitanMatkul.length} Matkul</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Matkul Rata-rata Tertinggi</span>
                <span className="font-semibold text-green-600">
                  {kesulitanMatkul.length > 0 ? kesulitanMatkul[kesulitanMatkul.length - 1].rata_rata_nilai : "0"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== TABLES ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Table 1: Status Mahasiswa */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-950">📊 Rekapitulasi Status Mahasiswa</h3>
              <p className="text-xs text-slate-400">Jumlah mahasiswa per prodi dan status akademik.</p>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Fakultas</th>
                    <th className="py-3 px-4">Program Studi</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statusMahasiswa.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-700">{item.nama_fakultas}</td>
                      <td className="py-3 px-4 text-slate-600">{item.nama_prodi}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status_mahasiswa === "aktif"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : item.status_mahasiswa === "cuti"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : item.status_mahasiswa === "lulus"
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {item.status_mahasiswa}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">{item.jumlah_mahasiswa} Mahasiswa</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Rata-rata Kesulitan Matkul */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-950">📚 Analisis Kesulitan Mata Kuliah</h3>
              <p className="text-xs text-slate-400">Rerata Nilai Akhir Angka mahasiswa dari yang tersulit hingga yang termudah.</p>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Kode MK</th>
                    <th className="py-3 px-4">Nama Mata Kuliah</th>
                    <th className="py-3 px-4 text-right">Rata-rata Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kesulitanMatkul.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 text-xs">{item.kode_mata_kuliah}</td>
                      <td className="py-3 px-4 text-slate-600">{item.nama_mata_kuliah}</td>
                      <td className="py-3 px-4 text-right font-bold">
                        <span
                          className={`text-sm ${
                            item.rata_rata_nilai < 70
                              ? "text-rose-600"
                              : item.rata_rata_nilai < 80
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.rata_rata_nilai}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table 3: Top & Bottom Performers Sistem Basis Data */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-950">🏆 Top & Bottom Performers</h3>
              <p className="text-xs text-slate-400">Nilai tertinggi & terendah spesifik mata kuliah Sistem Basis Data.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">NIM</th>
                    <th className="py-3 px-4">Mahasiswa</th>
                    <th className="py-3 px-4">Mata Kuliah</th>
                    <th className="py-3 px-4 text-center">Nilai</th>
                    <th className="py-3 px-4 text-right">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performaBasisData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{item.nim}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{item.nama_mahasiswa}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{item.nama_mata_kuliah}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{item.nilai_akhir_angka}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.kategori_performa === "Top Performer"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {item.kategori_performa}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* List: Detail Beban Kerja Dosen */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-950">📋 Beban Kerja Mengajar Dosen</h3>
              <p className="text-xs text-slate-400">Total kelas dan total SKS yang diampu dosen TA 2025/2026.</p>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {bebanKerjaDosen.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/85 border border-slate-100 rounded-xl transition-colors">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{item.nama_dosen}</h4>
                    <p className="text-[10px] font-mono text-slate-400">NIDN: {item.nidn}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-indigo-700">{item.total_beban_sks} SKS</span>
                    <span className="block text-[10px] text-slate-400">{item.total_kelas_diajar} Kelas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
