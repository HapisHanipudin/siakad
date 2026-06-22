"use client";

import { useEffect, useState } from "react";
import { Kelas, Dosen } from "@siakad/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export default function AdminPortal() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form states for Skenario 4
  const [idRuangan, setIdRuangan] = useState(3); // Lab BD (Kap 30)
  const [idProdi, setIdProdi] = useState(1); // Informatika
  const [idRombel, setIdRombel] = useState(1); // IF-A 2025
  const [idMk, setIdMk] = useState(3); // Sistem Basis Data (4 SKS)
  const [idDosen, setIdDosen] = useState(2); // Ira Herawati
  const [idTa, setIdTa] = useState(2); // 2025/2026
  const [kodeKelas, setKodeKelas] = useState("");
  const [kuota, setKuota] = useState(30);
  const [semesterAktif, setSemesterAktif] = useState<"ganjil" | "genap">("genap");
  const [jamMulai, setJamMulai] = useState("08:00:00");
  const [jamSelesai, setJamSelesai] = useState("11:20:00");
  const [hari, setHari] = useState("Rabu");

  const loadAdminData = async () => {
    try {
      const [kRes, dRes] = await Promise.all([
        fetch(`${API_URL}/kelas`),
        fetch(`${API_URL}/dosen`),
      ]);
      const kData = await kRes.json() as any;
      const dData = await dRes.json() as any;
      setKelasList(kData);
      setDosenList(dData);
    } catch (err) {
      console.error("Gagal memuat data admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_URL}/kelas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ruangan: Number(idRuangan),
          id_program_studi: Number(idProdi),
          id_rombel: idRombel ? Number(idRombel) : null,
          id_mata_kuliah: Number(idMk),
          id_dosen: Number(idDosen),
          id_tahun_ajaran: Number(idTa),
          kode_kelas: kodeKelas,
          kuota: Number(kuota),
          semester_aktif: semesterAktif,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          hari,
        }),
      });

      const data = await res.json() as any;
      if (!res.ok) {
        // Trigger DB checks throw errors here
        alert(`Gagal membuat kelas (Trigger Error): \n${data.message}`);
      } else {
        alert("Kelas perkuliahan baru berhasil didaftarkan (Skenario 4)!");
        setKodeKelas("");
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
          Portal Administrasi & Kelas Baru
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Pembuatan Kelas Baru (Skenario 4) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span>🏫</span> Registrasi Kelas Baru
            </h2>
            <p className="text-xs text-slate-400 mb-6">Mendaftarkan kelas baru dengan pengecekan tumpang tindih jadwal dosen dan kapasitas ruangan secara live.</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kode Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: IF-A-BD2"
                  value={kodeKelas}
                  onChange={(e) => setKodeKelas(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mata Kuliah</label>
                  <select
                    value={idMk}
                    onChange={(e) => setIdMk(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value={3}>Sistem Basis Data (4 SKS)</option>
                    <option value={1}>Dasar-Dasar Pemrograman (3 SKS)</option>
                    <option value={4}>Pemrograman Web (3 SKS)</option>
                    <option value={8}>Pengantar Manajemen (3 SKS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dosen Pengajar</label>
                  <select
                    value={idDosen}
                    onChange={(e) => setIdDosen(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    {dosenList.map((d) => (
                      <option key={d.id_dosen} value={d.id_dosen}>{d.nama_dosen}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ruangan</label>
                  <select
                    value={idRuangan}
                    onChange={(e) => setIdRuangan(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value={3}>Laboratorium Basis Data (Kapasitas: 30)</option>
                    <option value={1}>Ruang Teori 101 (Kapasitas: 40)</option>
                    <option value={5}>Ruang FEB 201 (Kapasitas: 50)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kuota Kelas</label>
                  <input
                    type="number"
                    required
                    value={kuota}
                    onChange={(e) => setKuota(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hari</label>
                  <select
                    value={hari}
                    onChange={(e) => setHari(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Semester</label>
                  <select
                    value={semesterAktif}
                    onChange={(e) => setSemesterAktif(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="ganjil">Ganjil</option>
                    <option value="genap">Genap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rombel</label>
                  <select
                    value={idRombel}
                    onChange={(e) => setIdRombel(Number(e.target.value))}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value={1}>IF-A 2025</option>
                    <option value={2}>IF-B 2025</option>
                    <option value={3}>SI-A 2025</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jam Mulai</label>
                  <input
                    type="text"
                    required
                    placeholder="HH:MM:SS"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jam Selesai</label>
                  <input
                    type="text"
                    required
                    placeholder="HH:MM:SS"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm disabled:bg-red-300 mt-2"
              >
                {submitLoading ? "Memvalidasi..." : "Daftarkan Kelas"}
              </button>
            </form>
          </div>

          {/* List Kelas Live & Database Trigger Status */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>📅</span> Jadwal Kelas & Kuota Ruangan
            </h2>

            {loading ? (
              <p className="text-slate-400 text-sm">Memuat jadwal kelas...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-3 font-semibold">Mata Kuliah / Kelas</th>
                      <th className="pb-3 font-semibold">Dosen</th>
                      <th className="pb-3 font-semibold">Waktu / Ruangan</th>
                      <th className="pb-3 font-semibold text-right">Kuota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {kelasList.map((k) => (
                      <tr key={k.id_kelas} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <p className="font-semibold text-slate-800">{k.nama_mata_kuliah}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{k.kode_kelas} ({k.sks} SKS)</p>
                        </td>
                        <td className="py-4 font-medium text-slate-600">{k.nama_dosen}</td>
                        <td className="py-4">
                          <p className="text-slate-700 font-semibold">{k.hari}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{k.jam_mulai.slice(0, 5)} - {k.jam_selesai.slice(0, 5)} | {k.nama_ruangan}</p>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${k.kuota <= 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                            {k.kuota <= 0 ? "Penuh" : `${k.kuota} Kursi`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
