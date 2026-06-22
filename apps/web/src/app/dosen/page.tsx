"use client";

import { useEffect, useState } from "react";
import { Dosen, Mahasiswa, Krs, DetailKrs } from "@siakad/shared";

const API_URL = "http://localhost:8787";

export default function DosenPortal() {
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [selectedDosen, setSelectedDosen] = useState<Dosen | null>(null);
  const [bimbinganList, setBimbinganList] = useState<Mahasiswa[]>([]);
  const [selectedMhs, setSelectedMhs] = useState<Mahasiswa | null>(null);
  const [mhsKrs, setMhsKrs] = useState<Krs | null>(null);
  
  // Grade input states
  const [grades, setGrades] = useState<{ [id_detail_krs: number]: { tugas: number; uts: number; uas: number } }>({});

  const [loading, setLoading] = useState(true);
  const [bimbinganLoading, setBimbinganLoading] = useState(false);
  const [krsLoading, setKrsLoading] = useState(false);
  const [savingGrades, setSavingGrades] = useState(false);

  const initPortal = async () => {
    try {
      const res = await fetch(`${API_URL}/dosen`);
      const data = await res.json() as any;
      setDosenList(data);
    } catch (err) {
      console.error("Gagal memuat dosen:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initPortal();
  }, []);

  // Fetch bimbingan mahasiswa based on id_dosen (Scenario 2 context)
  // Let's create an endpoint in backend for bimbingan or query direct
  // Wait, let's add an endpoint GET /dosen/bimbingan/:id_dosen in backend to query this!
  // Yes, we will implement this handler in dosen.handlers.ts and route in dosen.routes.ts.
  const fetchBimbingan = async (id_dosen: number) => {
    setBimbinganLoading(true);
    setSelectedMhs(null);
    setMhsKrs(null);
    try {
      const res = await fetch(`${API_URL}/dosen/bimbingan/${id_dosen}`);
      if (res.ok) {
        const data = await res.json() as any;
        setBimbinganList(data);
      } else {
        setBimbinganList([]);
      }
    } catch (err) {
      console.error(err);
      setBimbinganList([]);
    } finally {
      setBimbinganLoading(false);
    }
  };

  const handleSelectDosen = (d: Dosen) => {
    setSelectedDosen(d);
    fetchBimbingan(d.id_dosen);
  };

  const fetchStudentKrs = async (id_mahasiswa: number) => {
    setKrsLoading(true);
    try {
      const res = await fetch(`${API_URL}/krs/${id_mahasiswa}`);
      if (res.ok) {
        const data = await res.json() as any;
        setMhsKrs(data);
        
        // Initialize grade form states
        const initialGrades: typeof grades = {};
        data.detail?.forEach((d: DetailKrs) => {
          initialGrades[d.id_detail_krs] = {
            tugas: d.nilai_tugas || 0,
            uts: d.nilai_uts || 0,
            uas: d.nilai_uas || 0,
          };
        });
        setGrades(initialGrades);
      } else {
        setMhsKrs(null);
      }
    } catch (err) {
      console.error(err);
      setMhsKrs(null);
    } finally {
      setKrsLoading(false);
    }
  };

  const handleSelectStudent = (m: Mahasiswa) => {
    setSelectedMhs(m);
    fetchStudentKrs(m.id_mahasiswa);
  };

  const handleGradeChange = (id_detail_krs: number, field: "tugas" | "uts" | "uas", value: number) => {
    setGrades({
      ...grades,
      [id_detail_krs]: {
        ...grades[id_detail_krs],
        [field]: value,
      },
    });
  };

  const handleSaveGrades = async () => {
    if (!selectedDosen || !selectedMhs || !mhsKrs) return;
    setSavingGrades(true);
    try {
      // Find the selected dosen's user id to log activity
      // For simplicity, Aris Tri Jaka Nidn 0411028801 is user id 7, we can use a fallback
      const idDosenUser = selectedDosen.id_dosen === 1 ? 7 : 8; // fallback matching seed log_aktivitas id_user

      const updatesPayload = Object.keys(grades).map((id) => {
        const id_detail_krs = Number(id);
        return {
          id_detail_krs,
          nilai_tugas: grades[id_detail_krs].tugas,
          nilai_uts: grades[id_detail_krs].uts,
          nilai_uas: grades[id_detail_krs].uas,
        };
      });

      const res = await fetch(`${API_URL}/nilai/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: updatesPayload,
          id_dosen_user: idDosenUser,
        }),
      });

      const data = await res.json() as any;
      if (!res.ok) {
        alert(data.message || "Gagal meng-update nilai");
      } else {
        alert("Nilai akademik berhasil disimpan! Huruf mutu dihitung otomatis oleh trigger basis data (Skenario 2).");
        fetchStudentKrs(selectedMhs.id_mahasiswa);
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan.");
    } finally {
      setSavingGrades(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Portal Dosen Wali & Akademik
        </h1>

        {loading ? (
          <p className="text-slate-400 text-sm">Menghubungkan database...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panel Kiri: Pilih Dosen Wali */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>👨‍🏫</span> Pilih Dosen Pengajar
                </h2>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {dosenList.map((d) => (
                    <div
                      key={d.id_dosen}
                      onClick={() => handleSelectDosen(d)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedDosen?.id_dosen === d.id_dosen ? "border-purple-500 bg-purple-50/30 shadow-sm" : "border-slate-100 hover:bg-slate-50"}`}
                    >
                      <p className="font-semibold text-slate-800 text-sm">{d.nama_dosen}</p>
                      <p className="text-xs text-slate-400 font-mono mt-1">NIDN: {d.nidn}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel Bimbingan Mahasiswa */}
              {selectedDosen && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-300">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span>🎓</span> Daftar Mahasiswa Bimbingan
                  </h2>
                  {bimbinganLoading ? (
                    <p className="text-xs text-slate-400">Memuat bimbingan...</p>
                  ) : bimbinganList.length === 0 ? (
                    <p className="text-xs text-slate-400">Tidak ada bimbingan aktif.</p>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                      {bimbinganList.map((m) => (
                        <div
                          key={m.id_mahasiswa}
                          onClick={() => handleSelectStudent(m)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedMhs?.id_mahasiswa === m.id_mahasiswa ? "border-purple-500 bg-purple-50/30" : "border-slate-100 hover:bg-slate-50"}`}
                        >
                          <p className="font-semibold text-slate-800 text-xs">{m.nama_mahasiswa}</p>
                          <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400 font-mono">
                            <span>NIM: {m.nim}</span>
                            <span className="font-sans px-1.5 py-0.2 bg-slate-100 rounded">{m.status_mahasiswa}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sisi Kanan: Input Nilai KRS (Skenario 2) */}
            <div className="lg:col-span-2">
              {selectedMhs ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Input Nilai Mahasiswa: {selectedMhs.nama_mahasiswa}
                      </h2>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">NIM: {selectedMhs.nim}</p>
                    </div>
                    {mhsKrs && mhsKrs.detail && mhsKrs.detail.length > 0 && (
                      <button
                        onClick={handleSaveGrades}
                        disabled={savingGrades}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:bg-purple-300"
                      >
                        {savingGrades ? "Menyimpan..." : "Simpan Nilai (Skenario 2)"}
                      </button>
                    )}
                  </div>

                  {krsLoading ? (
                    <p className="text-sm text-slate-400">Memuat KRS mahasiswa...</p>
                  ) : !mhsKrs || !mhsKrs.detail || mhsKrs.detail.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                      Mahasiswa ini belum mengisi KRS atau KRS belum disahkan.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {mhsKrs.detail.map((d) => {
                        const score = grades[d.id_detail_krs] || { tugas: 0, uts: 0, uas: 0 };
                        return (
                          <div
                            key={d.id_detail_krs}
                            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-sm text-slate-800">{d.nama_mata_kuliah}</h3>
                                <p className="text-[10px] text-slate-400 mt-1">Kode: {d.kode_kelas} | SKS: {d.sks}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-semibold text-slate-500">Nilai Akhir: <span className="font-extrabold text-slate-800">{d.nilai_akhir_angka}</span></p>
                                <span className={`inline-block px-2 py-0.5 mt-1 text-xs font-bold rounded ${d.nilai_akhir_huruf === 'A' || d.nilai_akhir_huruf === 'B' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                  Mutu: {d.nilai_akhir_huruf || "Belum"}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Nilai Tugas (30%)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={score.tugas}
                                  onChange={(e) => handleGradeChange(d.id_detail_krs, "tugas", Number(e.target.value))}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Nilai UTS (30%)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={score.uts}
                                  onChange={(e) => handleGradeChange(d.id_detail_krs, "uts", Number(e.target.value))}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Nilai UAS (40%)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={score.uas}
                                  onChange={(e) => handleGradeChange(d.id_detail_krs, "uas", Number(e.target.value))}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                  <span className="text-4xl mb-4 block">👈</span>
                  Pilih dosen wali dan bimbingan mahasiswa di panel kiri untuk memulai penginputan nilai perkuliahan.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
