"use client";

import { useEffect, useState } from "react";
import { Mahasiswa, Tagihan } from "@siakad/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export default function MahasiswaPortal() {
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedMhs, setSelectedMhs] = useState<Mahasiswa | null>(null);
  const [tagihan, setTagihan] = useState<Tagihan[]>([]);
  const [tagihanLoading, setTagihanLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prodi, setProdi] = useState(1);
  const [kurikulum, setKurikulum] = useState(1);
  const [kelompok, setKelompok] = useState(1);
  const [angkatan, setAngkatan] = useState(2025);

  const fetchMahasiswa = async (currentPage = page, search = searchQuery) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (search) {
        queryParams.append("search", search);
      }
      const res = await fetch(`${API_URL}/mahasiswa?${queryParams.toString()}`);
      if (res.ok) {
        const result = await res.json() as any;
        setMahasiswaList(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
        setTotalItems(result.meta?.total || 0);
      } else {
        setMahasiswaList([]);
      }
    } catch (err) {
      console.error("Gagal memuat mahasiswa:", err);
      setMahasiswaList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMahasiswa(page, searchQuery);
  }, [page, searchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const fetchTagihan = async (id_mahasiswa: number) => {
    setTagihanLoading(true);
    try {
      console.log(`Fetching tagihan for student ID: ${id_mahasiswa}`);
      const tRes = await fetch(`${API_URL}/tagihan/${id_mahasiswa}`);
      console.log("Fetch tagihan response status:", tRes.status);
      if (tRes.ok) {
        const tData = await tRes.json() as any;
        console.log("Fetch tagihan data:", tData);
        setTagihan(tData);
      } else {
        console.warn("Fetch tagihan returned not OK:", tRes.statusText);
        setTagihan([]);
      }
    } catch (err) {
      console.error("Error in fetchTagihan:", err);
      setTagihan([]);
    } finally {
      setTagihanLoading(false);
    }
  };

  const handleSelectMhs = (mhs: Mahasiswa) => {
    setSelectedMhs(mhs);
    fetchTagihan(mhs.id_mahasiswa);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_URL}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim,
          nama_mahasiswa: nama,
          email,
          id_program_studi: Number(prodi),
          id_kurikulum: Number(kurikulum),
          id_kelompok: Number(kelompok),
          angkatan: Number(angkatan),
          password,
        }),
      });

      const data = await res.json() as any;
      if (!res.ok) {
        alert(data.message || "Gagal mendaftarkan mahasiswa");
      } else {
        alert("Mahasiswa baru berhasil didaftarkan! Tagihan UKT Awal dibuat otomatis.");
        // Clear form
        setNim("");
        setNama("");
        setEmail("");
        setPassword("");
        setPage(1);
        fetchMahasiswa(1);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBayarUKT = async (id_tagihan: number, nominal: number) => {
    try {
      const res = await fetch(`${API_URL}/pembayaran`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tagihan,
          nominal_bayar: nominal,
        }),
      });
      const data = await res.json() as any;
      if (!res.ok) {
        alert(data.message || "Pembayaran gagal");
      } else {
        alert("Pembayaran Terverifikasi! Status tagihan lunas seketika via database trigger.");
        if (selectedMhs) {
          fetchTagihan(selectedMhs.id_mahasiswa);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Portal Mahasiswa & Registrasi
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Registrasi Mahasiswa Baru (Skenario 6) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>📝</span> Pendaftaran Mahasiswa Baru
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">NIM</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2510511099"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Mahasiswa"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email UPNVJ</label>
                <input
                  type="email"
                  required
                  placeholder="nama@mahasiswa.upnvj.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password Akun</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 Karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Program Studi</label>
                  <select
                    value={prodi}
                    onChange={(e) => setProdi(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value={1}>Informatika</option>
                    <option value={2}>Sistem Informasi</option>
                    <option value={3}>Manajemen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Angkatan</label>
                  <select
                    value={angkatan}
                    onChange={(e) => setAngkatan(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value={2025}>2025</option>
                    <option value={2024}>2024</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition-colors shadow-sm disabled:bg-blue-300 mt-2"
              >
                {submitLoading ? "Mendaftarkan..." : "Daftar & Terbitkan UKT"}
              </button>
            </form>
          </div>

          {/* List Mahasiswa & Detail Live */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tagihan & Pembayaran (Skenario 3) */}
            {selectedMhs && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span>💰</span> Status Keuangan: {selectedMhs.nama_mahasiswa}
                </h2>
                <p className="text-xs text-slate-400 mb-6 font-mono">NIM: {selectedMhs.nim}</p>

                {tagihanLoading ? (
                  <p className="text-sm text-slate-400">Memuat info tagihan...</p>
                ) : tagihan.length === 0 ? (
                  <p className="text-sm text-slate-500">Tidak ada tagihan aktif untuk mahasiswa ini.</p>
                ) : (
                  <div className="space-y-4">
                    {tagihan.map((t) => (
                      <div
                        key={t.id_tagihan}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                              {t.tipe_tagihan}
                            </span>
                            <span className="text-xs text-slate-400">Semester {t.semester_aktif} ({t.nama_tahun_ajaran || "2025/2026"})</span>
                          </div>
                          <p className="text-lg font-extrabold text-slate-800 mt-2">
                            Rp {Number(t.nominal || 0).toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Tenggat Pembayaran: {t.tenggat ? new Date(t.tenggat).toLocaleDateString("id-ID") : "-"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${t.status_tagihan === 'lunas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {t.status_tagihan === 'lunas' ? '✅ Lunas' : '❌ Belum Bayar'}
                          </span>

                          {t.status_tagihan !== 'lunas' && (
                            <button
                              onClick={() => handleBayarUKT(t.id_tagihan, t.nominal)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                            >
                              Bayar UKT Live
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>👥</span> Database Mahasiswa Live
                </h2>
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari nama / NIM..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-slate-400 bg-slate-50/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-sm font-semibold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <p className="text-slate-400 text-sm">Memuat data...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                        <th className="pb-3 font-semibold">Nama / NIM</th>
                        <th className="pb-3 font-semibold">Program Studi</th>
                        <th className="pb-3 font-semibold">Angkatan</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {mahasiswaList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                            Mahasiswa tidak ditemukan.
                          </td>
                        </tr>
                      ) : (
                        mahasiswaList.map((m) => (
                          <tr
                            key={m.id_mahasiswa}
                            className={`hover:bg-slate-50/50 transition-colors ${selectedMhs?.id_mahasiswa === m.id_mahasiswa ? "bg-blue-50/20" : ""}`}
                          >
                            <td className="py-4">
                              <p className="font-semibold text-slate-800">{m.nama_mahasiswa}</p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{m.nim}</p>
                            </td>
                            <td className="py-4 text-slate-600">{m.nama_prodi || "Informatika"}</td>
                            <td className="py-4 text-slate-600">{m.angkatan}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${m.status_mahasiswa === 'aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                {m.status_mahasiswa}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => handleSelectMhs(m)}
                                className="text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-all"
                              >
                                Pilih & Lihat UKT
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                    <p className="text-xs text-slate-500 font-medium">
                      Menampilkan <span className="font-semibold text-slate-800">{mahasiswaList.length}</span> dari <span className="font-semibold text-slate-800">{totalItems}</span> mahasiswa
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
                      >
                        Prev
                      </button>
                      <span className="text-xs font-bold text-slate-600 px-3 py-1.5 rounded-lg bg-slate-100/80">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
