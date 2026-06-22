"use client";

import { useEffect, useState } from "react";
import { Mahasiswa, Tagihan } from "@siakad/shared";

const API_URL = "http://localhost:8787";

export default function MahasiswaPortal() {
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedMhs, setSelectedMhs] = useState<Mahasiswa | null>(null);
  const [tagihan, setTagihan] = useState<Tagihan[]>([]);
  const [tagihanLoading, setTagihanLoading] = useState(false);

  // Form states
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prodi, setProdi] = useState(1);
  const [kurikulum, setKurikulum] = useState(1);
  const [kelompok, setKelompok] = useState(1);
  const [angkatan, setAngkatan] = useState(2025);

  const fetchMahasiswa = async () => {
    try {
      const res = await fetch(`${API_URL}/mahasiswa`);
      const data = await res.json() as any;
      setMahasiswaList(data);
    } catch (err) {
      console.error("Gagal memuat mahasiswa:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMahasiswa();
  }, []);

  const fetchTagihan = async (id_mahasiswa: number) => {
    setTagihanLoading(true);
    try {
      // Kita bisa buat endpoint tagihan di backend atau query langsung
      // Di sini kita query endpoint tagihan via general / pembayaran atau check mock
      // Untuk kemudahan, mari kita mock data tagihan live dari db atau fetch via query
      const res = await fetch(`${API_URL}/krs/${id_mahasiswa}`);
      // KRS endpoint mengembalikan KRS data. Kita juga bisa fetch krs details.
      // Namun, untuk tagihan, mari kita fetch tagihan mahasiswa. Kita belum buat GET /tagihan di backend.
      // Mari kita buat endpoint GET /tagihan/:mahasiswaId di backend agar real-time!
      // Sementara itu, mari kita fetch tagihan dari endpoint pembayaran/tagihan di backend.
      // Wait, let's look at the database. We can write a quick custom endpoint or query it.
      // Let's create a tagihan endpoint in apps/api/src/modules/pembayaran/index.ts!
      // Yes, we will add an endpoint GET /tagihan/:mahasiswaId.
      const tRes = await fetch(`${API_URL}/tagihan/${id_mahasiswa}`);
      if (tRes.ok) {
        const tData = await tRes.json() as any;
        setTagihan(tData);
      } else {
        setTagihan([]);
      }
    } catch (err) {
      console.error(err);
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
        fetchMahasiswa();
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
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>👥</span> Database Mahasiswa Live
              </h2>

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
                      {mahasiswaList.map((m) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

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
                            Rp {t.nominal.toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Tenggat Pembayaran: {new Date(t.tenggat).toLocaleDateString("id-ID")}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
