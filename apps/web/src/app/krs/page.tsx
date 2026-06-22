"use client";

import { useEffect, useState } from "react";
import { Mahasiswa, Krs, Kelas } from "@siakad/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export default function KrsPortal() {
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedMhs, setSelectedMhs] = useState<Mahasiswa | null>(null);
  const [currentKrs, setCurrentKrs] = useState<Krs | null>(null);
  const [selectedKelasIds, setSelectedKelasIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [krsLoading, setKrsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load mahasiswa and available classes
  const initPortal = async () => {
    try {
      const [mRes, kRes] = await Promise.all([
        fetch(`${API_URL}/mahasiswa`),
        fetch(`${API_URL}/kelas`),
      ]);
      const mData = await mRes.json() as any;
      const kData = await kRes.json() as any;
      setMahasiswaList(mData);
      setKelasList(kData);
    } catch (err) {
      console.error("Gagal inisialisasi KRS:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initPortal();
  }, []);

  const fetchKrs = async (id_mahasiswa: number) => {
    setKrsLoading(true);
    try {
      const res = await fetch(`${API_URL}/krs/${id_mahasiswa}`);
      if (res.ok) {
        const data = await res.json() as any;
        setCurrentKrs(data);
        // Pre-select already taken class IDs
        setSelectedKelasIds(data.detail?.map((d: any) => d.id_kelas) || []);
      } else {
        setCurrentKrs(null);
        setSelectedKelasIds([]);
      }
    } catch (err) {
      console.error(err);
      setCurrentKrs(null);
    } finally {
      setKrsLoading(false);
    }
  };

  const handleSelectMhs = (mhs: Mahasiswa) => {
    setSelectedMhs(mhs);
    fetchKrs(mhs.id_mahasiswa);
  };

  const handleToggleKelas = (id_kelas: number) => {
    if (selectedKelasIds.includes(id_kelas)) {
      setSelectedKelasIds(selectedKelasIds.filter((id) => id !== id_kelas));
    } else {
      setSelectedKelasIds([...selectedKelasIds, id_kelas]);
    }
  };

  const handleSubmitKrs = async () => {
    if (!selectedMhs) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/krs/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_mahasiswa: selectedMhs.id_mahasiswa,
          id_kelas_list: selectedKelasIds,
        }),
      });

      const data = await res.json() as any;
      if (!res.ok) {
        // Trigger DB exceptions (prerequisite failed or class full) are returned here
        alert(`Gagal mengisi KRS: ${data.message}`);
      } else {
        alert("KRS berhasil diajukan dan disetujui (Skenario 1)!");
        fetchKrs(selectedMhs.id_mahasiswa);
        // Refresh kelas to update kuota live
        const kRes = await fetch(`${API_URL}/kelas`);
        const kData = await kRes.json() as any;
        setKelasList(kData);
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatalKrs = async () => {
    if (!currentKrs || !selectedMhs) return;
    if (!confirm("Apakah Anda yakin ingin membatalkan KRS ini? Ini akan menghapus rencana studi Anda secara transaksional.")) return;

    try {
      const res = await fetch(`${API_URL}/krs/${currentKrs.id_krs}`, {
        method: "DELETE",
      });

      const data = await res.json() as any;
      if (!res.ok) {
        alert(`Gagal membatalkan KRS: ${data.message}`);
      } else {
        alert("KRS berhasil dibatalkan (Skenario 5)! Kuota kelas otomatis dikembalikan.");
        fetchKrs(selectedMhs.id_mahasiswa);
        // Refresh kelas to update kuota live
        const kRes = await fetch(`${API_URL}/kelas`);
        const kData = await kRes.json() as any;
        setKelasList(kData);
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan.");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Portal Kartu Rencana Studi (KRS)
        </h1>

        {loading ? (
          <p className="text-slate-400 text-sm">Menghubungkan database...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sisi Kiri: Pilih Mahasiswa */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>🎓</span> Pilih Mahasiswa Aktif
              </h2>
              <p className="text-xs text-slate-400 mb-6">Pilih mahasiswa di bawah untuk mengisi KRS semester Genap 2025/2026.</p>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {mahasiswaList.map((m) => (
                  <div
                    key={m.id_mahasiswa}
                    onClick={() => handleSelectMhs(m)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedMhs?.id_mahasiswa === m.id_mahasiswa ? "border-indigo-500 bg-indigo-50/30 shadow-sm" : "border-slate-100 hover:bg-slate-50"}`}
                  >
                    <p className="font-semibold text-slate-800 text-sm">{m.nama_mahasiswa}</p>
                    <div className="flex justify-between items-center mt-1 text-xs text-slate-400 font-mono">
                      <span>NIM: {m.nim}</span>
                      <span className="font-sans px-2 py-0.5 bg-slate-100 rounded text-slate-600">{m.nama_prodi || "Informatika"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sisi Kanan: Panel KRS & Daftar Kelas */}
            <div className="lg:col-span-2 space-y-8">
              {selectedMhs ? (
                <>
                  {/* Info KRS Mahasiswa saat ini */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          KRS Mahasiswa: {selectedMhs.nama_mahasiswa}
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">NIM: {selectedMhs.nim}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {currentKrs && (
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${currentKrs.status_krs === 'sah' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            Status: {currentKrs.status_krs.toUpperCase()}
                          </span>
                        )}
                        {currentKrs && currentKrs.status_krs !== 'sah' && (
                          <button
                            onClick={handleBatalKrs}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                          >
                            Batalkan KRS
                          </button>
                        )}
                      </div>
                    </div>

                    {krsLoading ? (
                      <p className="text-sm text-slate-400">Memuat KRS...</p>
                    ) : !currentKrs || currentKrs.detail?.length === 0 ? (
                      <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                        Belum ada kelas yang didaftarkan. Silakan pilih kelas di bawah untuk mengajukan KRS.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mata Kuliah Diambil</p>
                        {currentKrs.detail?.map((d: any) => (
                          <div key={d.id_detail_krs} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-sm">
                            <div>
                              <p className="font-semibold text-slate-800">{d.nama_mata_kuliah}</p>
                              <p className="text-xs text-slate-400 mt-1">Kelas: {d.kode_kelas} | Dosen: {d.nama_dosen} | SKS: {d.sks}</p>
                            </div>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                              {d.sks} SKS
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4 font-semibold text-sm">
                          <span>Total SKS Terdaftar</span>
                          <span className="text-indigo-600 text-lg font-bold">
                            {currentKrs.detail?.reduce((acc, d: any) => acc + (d.sks || 0), 0)} SKS
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Pengisian Kelas Baru (Skenario 1) */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Form Pengisian Kelas
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Centang kelas di bawah untuk ditambahkan ke KRS mahasiswa.
                        </p>
                      </div>
                      <button
                        onClick={handleSubmitKrs}
                        disabled={submitting || (currentKrs?.status_krs === 'sah')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:bg-indigo-300"
                      >
                        {submitting ? "Memproses..." : "Ajukan & Sahkan KRS"}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {kelasList.map((k) => {
                        const isChecked = selectedKelasIds.includes(k.id_kelas);
                        const isFull = k.kuota <= 0;
                        return (
                          <div
                            key={k.id_kelas}
                            onClick={() => (currentKrs?.status_krs !== 'sah') && handleToggleKelas(k.id_kelas)}
                            className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${isChecked ? "border-indigo-500 bg-indigo-50/10" : "border-slate-100 hover:bg-slate-50"} ${currentKrs?.status_krs === 'sah' ? 'opacity-80 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                readOnly
                                disabled={currentKrs?.status_krs === 'sah'}
                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-slate-800">{k.nama_mata_kuliah}</span>
                                  <span className="text-[10px] bg-slate-100 font-mono px-2 py-0.5 rounded text-slate-500">
                                    {k.kode_kelas}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                  Dosen: {k.nama_dosen} | Hari: {k.hari} ({k.jam_mulai.slice(0, 5)}-{k.jam_selesai.slice(0, 5)}) | Ruangan: {k.nama_ruangan}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                                {k.sks} SKS
                              </span>
                              <p className={`text-[10px] mt-2 font-semibold ${isFull ? "text-red-500" : "text-emerald-600"}`}>
                                {isFull ? "Penuh" : `Kuota: ${k.kuota} Tersedia`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                  <span className="text-4xl mb-4 block">👈</span>
                  Silakan pilih mahasiswa bimbingan terlebih dahulu di panel kiri untuk membuka portal KRS.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
